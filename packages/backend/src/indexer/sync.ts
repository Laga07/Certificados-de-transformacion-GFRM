import { ethers } from "ethers";
import type { prisma as PrismaClientInstance } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";
import type { IndexedContracts } from "../lib/contracts.js";
import {
  handleCentroRegistrado,
  handleCentroVerificado,
  handleMunicipalidadRegistrada,
  handleUsuarioRegistrado,
} from "./handlers/registroEntidades.js";
import {
  handleLoteMunicipalCerrado,
  handleLoteMunicipalIniciado,
  handleLoteTipoCerrado,
  handleTransaccionReconciliada,
  handleTransaccionRegistrada,
} from "./handlers/transaccionesPlastico.js";
import { handleTokensMinteados } from "./handlers/plasticoToken.js";

type Prisma = typeof PrismaClientInstance;

// Configurable porque el rango maximo de eth_getLogs depende del proveedor RPC. El free
// tier de Alchemy lo limita a 10 bloques por llamada. dRPC gratis DICE soportar hasta
// 10,000 en su mensaje de error, pero probado en vivo (29 sept 2026) el limite real para
// eth_getLogs con filtro de address ronda los 75-100 bloques -- 150 ya falla siempre con
// el mismo mensaje (mal etiquetado). 50 deja margen. Si cambia el proveedor, ajustar
// INDEXER_BLOCK_WINDOW en el .env en vez de tocar este default -- y volver a probar en
// vivo el limite real en vez de confiar en el texto del error.
const MAX_BLOCK_WINDOW = Number(process.env.INDEXER_BLOCK_WINDOW ?? 50);

const REGISTRO_EVENTS = [
  "UsuarioRegistrado",
  "CentroRegistrado",
  "CentroVerificado",
  "MunicipalidadRegistrada",
];
const TRANSACCIONES_EVENTS = [
  "TransaccionRegistrada",
  "LoteMunicipalIniciado",
  "LoteTipoCerrado",
  "LoteMunicipalCerrado",
  "TransaccionReconciliada",
];
const TOKEN_EVENTS = ["TokensMinteados"];

interface TaggedLog {
  contractName: "registro" | "transacciones" | "token";
  eventName: string;
  log: ethers.EventLog;
}

// Espaciado entre llamadas eth_getLogs para no exceder el limite de compute-units-por-
// segundo de RPCs gratuitos (ej. Alchemy free tier). Configurable por si el RPC usado
// permite mas throughput.
const RPC_CALL_DELAY_MS = Number(process.env.INDEXER_RPC_DELAY_MS ?? 250);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// dRPC (y cualquier RPC "agregador" que reparte la consulta entre varios operadores de
// nodo) tira de vez en cuando errores transitorios que no son limite de tasa -- ej.
// "Temporary internal error, please retry". Sin esto, cada uno de esos blips le costaba
// un ciclo entero de 8 segundos (el catch de run.ts reintenta recien en el proximo poll);
// con el reintento inmediato de aca se resuelve solo, casi siempre en menos de 1 segundo.
function esErrorTransitorio(error: unknown): boolean {
  const texto = error instanceof Error ? JSON.stringify(error) : String(error);
  return /429|compute units|temporary|timeout|ETIMEDOUT|ECONNRESET|rate limit/i.test(texto);
}

async function getLogsWithRetry(
  provider: ethers.Provider,
  address: string,
  fromBlock: number,
  toBlock: number,
  attempt = 1,
): Promise<ethers.Log[]> {
  try {
    return await provider.getLogs({ address, fromBlock, toBlock });
  } catch (error) {
    if (esErrorTransitorio(error) && attempt <= 5) {
      const backoffMs = RPC_CALL_DELAY_MS * 2 ** attempt;
      await sleep(backoffMs);
      return getLogsWithRetry(provider, address, fromBlock, toBlock, attempt + 1);
    }
    throw error;
  }
}

// Antes se pedia un eth_getLogs POR CADA nombre de evento (hasta 10 llamadas por ventana:
// 4 de registro + 5 de transacciones + 1 de token -- eso fue lo que agoto la cuota
// gratuita de Alchemy en dias). Un solo eth_getLogs por CONTRATO trae todos sus logs de
// una vez; se decodifican aca y se descarta lo que no nos interesa (ej. RoleGranted,
// Paused, Upgraded de OpenZeppelin, que tambien viven en el mismo ABI). ~3x menos
// llamadas por ventana, combinado con la ventana mas ancha de MAX_BLOCK_WINDOW.
async function fetchLogsInRange(
  provider: ethers.Provider,
  contract: ethers.Contract,
  contractName: TaggedLog["contractName"],
  eventNames: string[],
  fromBlock: number,
  toBlock: number,
): Promise<TaggedLog[]> {
  const results: TaggedLog[] = [];
  const eventosConocidos = new Set(eventNames);
  const address = await contract.getAddress();

  const rawLogs = await getLogsWithRetry(provider, address, fromBlock, toBlock);

  for (const rawLog of rawLogs) {
    let parsed: ethers.LogDescription | null;
    try {
      parsed = contract.interface.parseLog(rawLog);
    } catch {
      continue; // topic desconocido para este ABI (no deberia pasar en la practica)
    }
    if (!parsed || !eventosConocidos.has(parsed.name)) continue;

    results.push({
      contractName,
      eventName: parsed.name,
      log: { ...rawLog, args: parsed.args } as unknown as ethers.EventLog,
    });
  }

  await sleep(RPC_CALL_DELAY_MS);
  return results;
}

async function dispatch(
  prisma: Prisma,
  contracts: IndexedContracts,
  provider: ethers.Provider,
  tagged: TaggedLog,
) {
  const { contractName, eventName, log } = tagged;

  if (contractName === "registro") {
    if (eventName === "UsuarioRegistrado") return handleUsuarioRegistrado(prisma, contracts, log);
    if (eventName === "CentroRegistrado")
      return handleCentroRegistrado(prisma, contracts, provider, log);
    if (eventName === "CentroVerificado") return handleCentroVerificado(prisma, provider, log);
    if (eventName === "MunicipalidadRegistrada")
      return handleMunicipalidadRegistrada(prisma, contracts, provider, log);
  }

  if (contractName === "transacciones") {
    if (eventName === "TransaccionRegistrada")
      return handleTransaccionRegistrada(prisma, contracts, log);
    if (eventName === "LoteMunicipalIniciado") return handleLoteMunicipalIniciado(prisma, log);
    if (eventName === "LoteTipoCerrado") return handleLoteTipoCerrado(prisma, log);
    if (eventName === "LoteMunicipalCerrado") return handleLoteMunicipalCerrado(prisma, log);
    if (eventName === "TransaccionReconciliada")
      return handleTransaccionReconciliada(prisma, contracts, log);
  }

  if (contractName === "token" && eventName === "TokensMinteados") {
    return handleTokensMinteados(prisma, log);
  }

  throw new Error(`Sin handler para ${contractName}.${eventName}`);
}

/**
 * Detecta un reorg simple comparando el hash guardado del ultimo bloque procesado
 * contra el hash real de ese mismo numero de bloque en la cadena actual.
 * Si difieren, retrocede `confirmations` bloques y borra las filas afectadas.
 */
async function checkReorg(
  prisma: Prisma,
  provider: ethers.Provider,
  chainId: number,
  confirmations: number,
): Promise<void> {
  const state = await prisma.indexerState.findUnique({ where: { chainId } });
  if (!state) return;

  const actualBlock = await provider.getBlock(Number(state.lastBlockNumber));
  if (actualBlock && actualBlock.hash === state.lastBlockHash) return;

  const rollbackTo = Math.max(0, Number(state.lastBlockNumber) - confirmations);
  logger.warn(
    { lastBlockNumber: state.lastBlockNumber, rollbackTo },
    "Reorg detectado: retrocediendo el indexer y limpiando filas afectadas",
  );

  await prisma.$transaction([
    prisma.rawEvent.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
    prisma.transaccion.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
    prisma.municipalBatch.deleteMany({ where: { blockNumberIniciado: { gt: rollbackTo } } }),
    prisma.tokenMintEvent.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
    prisma.user.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
    prisma.collectionCenter.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
    prisma.municipality.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
  ]);

  const rollbackBlock = await provider.getBlock(rollbackTo);
  await prisma.indexerState.update({
    where: { chainId },
    data: { lastBlockNumber: rollbackTo, lastBlockHash: rollbackBlock?.hash ?? "" },
  });
}

export interface SyncOptions {
  confirmations: number;
  startBlock: number;
}

/** Corre una pasada de sincronizacion: backfill + eventos nuevos hasta la cabeza (menos confirmations). */
export async function syncOnce(
  prisma: Prisma,
  provider: ethers.Provider,
  contracts: IndexedContracts,
  options: SyncOptions,
): Promise<{ fromBlock: number; toBlock: number; eventsProcesados: number }> {
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  await checkReorg(prisma, provider, chainId, options.confirmations);

  const state = await prisma.indexerState.findUnique({ where: { chainId } });
  const fromBlock = state ? Number(state.lastBlockNumber) + 1 : options.startBlock;

  const headBlock = await provider.getBlockNumber();
  const toBlock = headBlock - options.confirmations;

  if (fromBlock > toBlock) {
    return { fromBlock, toBlock, eventsProcesados: 0 };
  }

  // Se recorre ventana por ventana (no todo el rango de una), guardando el avance en
  // IndexerState despues de cada una. Con un backlog grande (RPC gratuito, 10 bloques por
  // llamada) procesar todo el tramo antes de persistir nada puede tardar horas -- si el
  // proceso se reinicia a la mitad, se perdia todo ese trabajo y arrancaba de cero otra vez.
  // Asi el progreso real queda guardado cada pocos segundos, sin importar que tan atras se
  // este.
  let eventosProcesados = 0;

  for (let windowFrom = fromBlock; windowFrom <= toBlock; windowFrom += MAX_BLOCK_WINDOW) {
    const windowTo = Math.min(windowFrom + MAX_BLOCK_WINDOW - 1, toBlock);

    // Secuencial (no Promise.all) a proposito: en paralelo, los 3 contratos suman presion
    // simultanea sobre el limite de compute-units-por-segundo de RPCs gratuitos.
    const registroLogs = await fetchLogsInRange(
      provider,
      contracts.registro,
      "registro",
      REGISTRO_EVENTS,
      windowFrom,
      windowTo,
    );
    const transaccionesLogs = await fetchLogsInRange(
      provider,
      contracts.transacciones,
      "transacciones",
      TRANSACCIONES_EVENTS,
      windowFrom,
      windowTo,
    );
    const tokenLogs = await fetchLogsInRange(
      provider,
      contracts.token,
      "token",
      TOKEN_EVENTS,
      windowFrom,
      windowTo,
    );

    // Orden cronologico real entre los 3 contratos: por bloque y luego por logIndex dentro del bloque.
    const todosLosLogs = [...registroLogs, ...transaccionesLogs, ...tokenLogs].sort((a, b) => {
      if (a.log.blockNumber !== b.log.blockNumber) return a.log.blockNumber - b.log.blockNumber;
      return a.log.index - b.log.index;
    });

    for (const tagged of todosLosLogs) {
      const { log } = tagged;

      const existing = await prisma.rawEvent.findUnique({
        where: { txHash_logIndex: { txHash: log.transactionHash, logIndex: log.index } },
      });
      if (existing?.processed) continue;

      await prisma.rawEvent.upsert({
        where: { txHash_logIndex: { txHash: log.transactionHash, logIndex: log.index } },
        create: {
          contractAddress: log.address,
          eventName: tagged.eventName,
          blockNumber: BigInt(log.blockNumber),
          blockHash: log.blockHash,
          txHash: log.transactionHash,
          logIndex: log.index,
          args: JSON.parse(
            JSON.stringify(log.args, (_key, value) =>
              typeof value === "bigint" ? value.toString() : value,
            ),
          ),
          processed: false,
        },
        update: {},
      });

      await dispatch(prisma, contracts, provider, tagged);

      await prisma.rawEvent.update({
        where: { txHash_logIndex: { txHash: log.transactionHash, logIndex: log.index } },
        data: { processed: true },
      });
    }

    eventosProcesados += todosLosLogs.length;

    const windowToBlockData = await provider.getBlock(windowTo);
    await prisma.indexerState.upsert({
      where: { chainId },
      create: { chainId, lastBlockNumber: windowTo, lastBlockHash: windowToBlockData?.hash ?? "" },
      update: { lastBlockNumber: windowTo, lastBlockHash: windowToBlockData?.hash ?? "" },
    });
  }

  return { fromBlock, toBlock, eventsProcesados: eventosProcesados };
}
