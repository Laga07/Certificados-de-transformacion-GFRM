import type { ethers } from "ethers";
import type { prisma as PrismaClientInstance } from "../../lib/prisma.js";
import { materialDesdeIndice, modalidadEntregaDesdeIndice, quienAbsorbeDesdeIndice } from "../enumMaps.js";
import type { IndexedContracts } from "../../lib/contracts.js";

type Prisma = typeof PrismaClientInstance;

// Los arrays uint256[] del contrato (loteIdsOrigen, pesosOrigen, etc.) se guardan como Json
// -- Postgres/Prisma no tiene un tipo BigInt[] comodo, y estos campos son solo para
// trazabilidad/auditoria, no se consultan por elemento individual.
function bigintArrayToJson(values: readonly bigint[]): string[] {
  return values.map((v) => v.toString());
}

async function upsertLoteDesdeChain(
  prisma: Prisma,
  contracts: IndexedContracts,
  loteId: bigint,
  blockNumber: number,
  txHash: string,
) {
  const lote = await contracts.custodia.lotes(loteId);

  await prisma.lote.upsert({
    where: { id: loteId },
    create: {
      id: loteId,
      material: materialDesdeIndice(lote.material),
      varianteId: Number(lote.varianteId),
      custodioActual: lote.custodioActual,
      pesoActual: lote.pesoActual.toString(),
      pesoAceptadoOrigen: lote.pesoAceptadoOrigen.toString(),
      activo: lote.activo,
      blockNumberCreado: BigInt(blockNumber),
      txHashCreado: txHash,
    },
    update: {
      custodioActual: lote.custodioActual,
      pesoActual: lote.pesoActual.toString(),
      pesoAceptadoOrigen: lote.pesoAceptadoOrigen.toString(),
      activo: lote.activo,
    },
  });
}

export async function handleLoteCreado(
  prisma: Prisma,
  contracts: IndexedContracts,
  log: ethers.EventLog,
) {
  const [loteId] = log.args as unknown as [bigint];
  await upsertLoteDesdeChain(prisma, contracts, loteId, log.blockNumber, log.transactionHash);
}

export async function handleEntregaRegistrada(
  prisma: Prisma,
  contracts: IndexedContracts,
  log: ethers.EventLog,
) {
  const [loteId, separador, receptor, material, varianteId, pesoGramos, modalidad, precioUSDTporKg] =
    log.args as unknown as [bigint, string, string, bigint, bigint, bigint, bigint, bigint];

  // Por si la entrega alimento un lote ya existente (loteDestino != 0): LoteCreado no se
  // emite en ese caso, asi que el lote podria no estar todavia en la tabla.
  await upsertLoteDesdeChain(prisma, contracts, loteId, log.blockNumber, log.transactionHash);

  await prisma.entrega.upsert({
    where: { txHash_logIndex: { txHash: log.transactionHash, logIndex: log.index } },
    create: {
      loteId,
      separadorWallet: separador,
      receptorWallet: receptor,
      material: materialDesdeIndice(material),
      varianteId: Number(varianteId),
      pesoGramos: pesoGramos.toString(),
      modalidad: modalidadEntregaDesdeIndice(modalidad),
      precioUSDTporKg: precioUSDTporKg.toString(),
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
      logIndex: log.index,
    },
    update: {},
  });
}

export async function handleLoteUnido(
  prisma: Prisma,
  contracts: IndexedContracts,
  log: ethers.EventLog,
) {
  const [nuevoLoteId, loteIdsOrigen, pesosOrigen, varianteResultante] = log.args as unknown as [
    bigint,
    bigint[],
    bigint[],
    bigint,
  ];

  await upsertLoteDesdeChain(prisma, contracts, nuevoLoteId, log.blockNumber, log.transactionHash);
  // Los lotes de origen quedan inactivos on-chain -- reflejar eso tambien en su fila.
  for (const origenId of loteIdsOrigen) {
    await upsertLoteDesdeChain(prisma, contracts, origenId, log.blockNumber, log.transactionHash);
  }

  await prisma.loteUnionEvento.upsert({
    where: { txHash_logIndex: { txHash: log.transactionHash, logIndex: log.index } },
    create: {
      nuevoLoteId,
      loteIdsOrigen: bigintArrayToJson(loteIdsOrigen),
      pesosOrigen: bigintArrayToJson(pesosOrigen),
      varianteResultante: Number(varianteResultante),
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
      logIndex: log.index,
    },
    update: {},
  });
}

export async function handleLoteDividido(
  prisma: Prisma,
  contracts: IndexedContracts,
  log: ethers.EventLog,
) {
  const [loteIdOrigen, nuevosLoteIds, pesos] = log.args as unknown as [bigint, bigint[], bigint[]];

  await upsertLoteDesdeChain(prisma, contracts, loteIdOrigen, log.blockNumber, log.transactionHash);
  for (const nuevoId of nuevosLoteIds) {
    await upsertLoteDesdeChain(prisma, contracts, nuevoId, log.blockNumber, log.transactionHash);
  }

  await prisma.loteDivisionEvento.upsert({
    where: { txHash_logIndex: { txHash: log.transactionHash, logIndex: log.index } },
    create: {
      loteIdOrigen,
      nuevosLoteIds: bigintArrayToJson(nuevosLoteIds),
      pesos: bigintArrayToJson(pesos),
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
      logIndex: log.index,
    },
    update: {},
  });
}

export async function handleEnvioDeclarado(prisma: Prisma, log: ethers.EventLog) {
  const [loteId, de, hacia, pesoEnviado, precioUSDTporKg] = log.args as unknown as [
    bigint,
    string,
    string,
    bigint,
    bigint,
  ];

  await prisma.traspaso.create({
    data: {
      loteId,
      de,
      hacia,
      pesoEnviado: pesoEnviado.toString(),
      precioUSDTporKg: precioUSDTporKg.toString(),
      estado: "Declarado",
      blockNumberDeclarado: BigInt(log.blockNumber),
      txHashDeclarado: log.transactionHash,
    },
  });
}

export async function handleRecepcionConfirmada(
  prisma: Prisma,
  contracts: IndexedContracts,
  log: ethers.EventLog,
) {
  const [loteId, , , pesoRecibido, merma, quienAbsorbe] = log.args as unknown as [
    bigint,
    string,
    string,
    bigint,
    bigint,
    bigint,
  ];

  await upsertLoteDesdeChain(prisma, contracts, loteId, log.blockNumber, log.transactionHash);

  // Encuentra el traspaso "Declarado" mas reciente de este lote (la confirmacion siempre
  // llega despues de su propia declaracion, en una transaccion posterior).
  const declarado = await prisma.traspaso.findFirst({
    where: { loteId, estado: "Declarado" },
    orderBy: { id: "desc" },
  });

  if (declarado) {
    await prisma.traspaso.update({
      where: { id: declarado.id },
      data: {
        estado: "Confirmado",
        pesoRecibido: pesoRecibido.toString(),
        merma: merma.toString(),
        quienAbsorbe: quienAbsorbeDesdeIndice(quienAbsorbe),
        blockNumberConfirmado: BigInt(log.blockNumber),
        txHashConfirmado: log.transactionHash,
      },
    });
  }
}

export async function handleLoteConsumido(
  prisma: Prisma,
  contracts: IndexedContracts,
  log: ethers.EventLog,
) {
  const [loteConsolidadoId, loteIdsOrigen] = log.args as unknown as [bigint, bigint[]];

  await upsertLoteDesdeChain(
    prisma,
    contracts,
    loteConsolidadoId,
    log.blockNumber,
    log.transactionHash,
  );
  for (const origenId of loteIdsOrigen) {
    await upsertLoteDesdeChain(prisma, contracts, origenId, log.blockNumber, log.transactionHash);
  }
  // El resto de los campos del evento (transformador, pesoActualTotal, pesoAceptadoOrigenTotal)
  // se reflejan en el modelo Emision cuando llega TransformacionRegistrada en la misma
  // transaccion -- no hace falta una tabla aparte para este evento.
}
