import { ethers } from "ethers";
import type { prisma as PrismaClientInstance } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";
import type { IndexedContracts } from "../lib/contracts.js";
import {
  handleCompradorRegistrado,
  handleEntidadActivoCambiado,
  handleVerificacionRevocada,
  handleIntermediarioRegistrado,
  handleIntermediarioVerificado,
  handleSeparadorRegistrado,
  handleTransformadorRegistrado,
  handleTransformadorVerificado,
} from "./handlers/registroEntidades.js";
import {
  handleEntregaRegistrada,
  handleEnvioDeclarado,
  handleLoteConsumido,
  handleLoteCreado,
  handleLoteDividido,
  handleLoteUnido,
  handleRecepcionConfirmada,
} from "./handlers/tokenCustodia.js";
import {
  handleCertificadoComprado,
  handleCertificadoDesplegado,
  handleCertificadoRetirado,
  handlePagoAcreditado,
  handlePagoRetirado,
  handleTransformacionRegistrada,
} from "./handlers/mercadoCertificados.js";

type Prisma = typeof PrismaClientInstance;

// Configurable porque el rango maximo de eth_getLogs depende del proveedor RPC. dRPC gratis
// DICE soportar hasta 10,000 bloques en su mensaje de error, pero probado en vivo (DAPP
// Plastico Tesis, 29 sept 2026) el limite real para eth_getLogs con filtro de address ronda
// los 75-100 bloques -- 150 ya falla siempre con el mismo mensaje (mal etiquetado). 50 deja
// margen. Si cambia el proveedor, ajustar INDEXER_BLOCK_WINDOW en el .env en vez de tocar
// este default -- y volver a probar en vivo el limite real en vez de confiar en el texto
// del error.
const MAX_BLOCK_WINDOW = Number(process.env.INDEXER_BLOCK_WINDOW ?? 50);

const REGISTRO_EVENTS = [
  "SeparadorRegistrado",
  "IntermediarioRegistrado",
  "IntermediarioVerificado",
  "TransformadorRegistrado",
  "TransformadorVerificado",
  "CompradorRegistrado",
  "EntidadDesactivada",
  "EntidadReactivada",
  "VerificacionRevocada",
];
const CUSTODIA_EVENTS = [
  "EntregaRegistrada",
  "LoteCreado",
  "LoteUnido",
  "LoteDividido",
  "EnvioDeclarado",
  "RecepcionConfirmada",
  "LoteConsumido",
];
const MERCADO_EVENTS = [
  "CertificadoDesplegado",
  "TransformacionRegistrada",
  "CertificadoComprado",
  "PagoAcreditado",
  "PagoRetirado",
  "CertificadoRetirado",
];

interface TaggedLog {
  contractName: "registro" | "custodia" | "mercado";
  eventName: string;
  log: ethers.EventLog;
}

// Espaciado entre llamadas eth_getLogs para no exceder el limite de compute-units-por-
// segundo de RPCs gratuitos.
const RPC_CALL_DELAY_MS = Number(process.env.INDEXER_RPC_DELAY_MS ?? 250);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// dRPC (y cualquier RPC "agregador" que reparte la consulta entre varios operadores de
// nodo) tira de vez en cuando errores transitorios que no son limite de tasa -- ej.
// "Temporary internal error, please retry". El reintento inmediato de aca se resuelve solo,
// casi siempre en menos de 1 segundo -- sin esto, cada blip costaba un ciclo entero de poll.
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

// Un solo eth_getLogs POR CONTRATO (no por nombre de evento) -- se decodifican aca y se
// descarta lo que no interesa (ej. RoleGranted, Paused, Upgraded de OpenZeppelin, que
// tambien viven en el mismo ABI).
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
    if (eventName === "SeparadorRegistrado") return handleSeparadorRegistrado(prisma, contracts, log);
    if (eventName === "IntermediarioRegistrado")
      return handleIntermediarioRegistrado(prisma, contracts, log);
    if (eventName === "IntermediarioVerificado")
      return handleIntermediarioVerificado(prisma, provider, log);
    if (eventName === "TransformadorRegistrado")
      return handleTransformadorRegistrado(prisma, contracts, log);
    if (eventName === "TransformadorVerificado")
      return handleTransformadorVerificado(prisma, provider, log);
    if (eventName === "CompradorRegistrado") return handleCompradorRegistrado(prisma, contracts, log);
    if (eventName === "EntidadDesactivada") return handleEntidadActivoCambiado(prisma, log, false);
    if (eventName === "EntidadReactivada") return handleEntidadActivoCambiado(prisma, log, true);
    if (eventName === "VerificacionRevocada") return handleVerificacionRevocada(prisma, log);
  }

  if (contractName === "custodia") {
    if (eventName === "LoteCreado") return handleLoteCreado(prisma, contracts, log);
    if (eventName === "EntregaRegistrada") return handleEntregaRegistrada(prisma, contracts, log);
    if (eventName === "LoteUnido") return handleLoteUnido(prisma, contracts, log);
    if (eventName === "LoteDividido") return handleLoteDividido(prisma, contracts, log);
    if (eventName === "EnvioDeclarado") return handleEnvioDeclarado(prisma, log);
    if (eventName === "RecepcionConfirmada")
      return handleRecepcionConfirmada(prisma, contracts, log);
    if (eventName === "LoteConsumido") return handleLoteConsumido(prisma, contracts, log);
  }

  if (contractName === "mercado") {
    if (eventName === "CertificadoDesplegado") return handleCertificadoDesplegado(prisma, log);
    if (eventName === "TransformacionRegistrada")
      return handleTransformacionRegistrada(prisma, contracts, log);
    if (eventName === "CertificadoComprado")
      return handleCertificadoComprado(prisma, contracts, log);
    if (eventName === "PagoAcreditado") return handlePagoAcreditado(prisma, log);
    if (eventName === "PagoRetirado") return handlePagoRetirado(prisma, log);
    if (eventName === "CertificadoRetirado") return handleCertificadoRetirado(prisma, log);
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
    prisma.separador.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
    prisma.intermediario.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
    prisma.transformador.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
    prisma.comprador.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
    prisma.entrega.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
    prisma.loteUnionEvento.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
    prisma.loteDivisionEvento.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
    prisma.traspaso.deleteMany({ where: { blockNumberDeclarado: { gt: rollbackTo } } }),
    prisma.lote.deleteMany({ where: { blockNumberCreado: { gt: rollbackTo } } }),
    prisma.certificadoContrato.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
    prisma.emision.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
    prisma.ventaPrimaria.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
    prisma.pagoAcreditado.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
    prisma.pagoRetiro.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
    prisma.certificadoRetiro.deleteMany({ where: { blockNumber: { gt: rollbackTo } } }),
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
  // IndexerState despues de cada una -- si el proceso se reinicia a la mitad de un backlog
  // grande, no se pierde el progreso ya hecho.
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
    const custodiaLogs = await fetchLogsInRange(
      provider,
      contracts.custodia,
      "custodia",
      CUSTODIA_EVENTS,
      windowFrom,
      windowTo,
    );
    const mercadoLogs = await fetchLogsInRange(
      provider,
      contracts.mercado,
      "mercado",
      MERCADO_EVENTS,
      windowFrom,
      windowTo,
    );

    // Orden cronologico real entre los 3 contratos: por bloque y luego por logIndex dentro del bloque.
    const todosLosLogs = [...registroLogs, ...custodiaLogs, ...mercadoLogs].sort((a, b) => {
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
