import type { ethers } from "ethers";
import type { prisma as PrismaClientInstance } from "../../lib/prisma.js";
import { tipoPlasticoDesdeIndice, tipoTransaccionDesdeIndice } from "../enumMaps.js";
import type { IndexedContracts } from "../../lib/contracts.js";

type Prisma = typeof PrismaClientInstance;

function toDate(unixSeconds: bigint | number): Date {
  return new Date(Number(unixSeconds) * 1000);
}

async function upsertTransaccionDesdeChain(
  prisma: Prisma,
  contracts: IndexedContracts,
  id: bigint,
  log: ethers.EventLog,
) {
  const onchain = await contracts.transacciones.transacciones(id);
  const loteId = onchain.loteId as bigint;

  await prisma.transaccion.upsert({
    where: { id },
    create: {
      id,
      origen: onchain.origen,
      destino: onchain.destino,
      pesoGramos: onchain.pesoGramos.toString(),
      // Se fija SOLO al crear la fila -- nunca en el update de abajo. Es el unico registro
      // permanente de cuanto declaro quien entrego, antes de que la municipalidad reconcilie.
      pesoGramosDeclarado: onchain.pesoGramosDeclarado.toString(),
      tokensMinteados: onchain.tokensMinteados.toString(),
      usdtPagado: onchain.usdtPagado.toString(),
      tipo: tipoTransaccionDesdeIndice(onchain.tipo),
      tipoPlastico: tipoPlasticoDesdeIndice(onchain.tipoPlastico),
      reconciliada: onchain.reconciliada,
      loteId: loteId === 0n ? null : loteId,
      timestampOnchain: toDate(onchain.timestamp),
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
      logIndex: log.index,
    },
    update: {
      pesoGramos: onchain.pesoGramos.toString(),
      tokensMinteados: onchain.tokensMinteados.toString(),
      reconciliada: onchain.reconciliada,
    },
  });
}

export async function handleTransaccionRegistrada(
  prisma: Prisma,
  contracts: IndexedContracts,
  log: ethers.EventLog,
) {
  const [id] = log.args as unknown as [bigint];
  await upsertTransaccionDesdeChain(prisma, contracts, id, log);
}

export async function handleTransaccionReconciliada(
  prisma: Prisma,
  contracts: IndexedContracts,
  log: ethers.EventLog,
) {
  const [id] = log.args as unknown as [bigint];
  await upsertTransaccionDesdeChain(prisma, contracts, id, log);
}

export async function handleLoteMunicipalIniciado(prisma: Prisma, log: ethers.EventLog) {
  const [loteId, municipalidad, fechaRecoleccion, rutaId] = log.args as unknown as [
    bigint,
    string,
    bigint,
    bigint,
  ];

  await prisma.municipalBatch.upsert({
    where: { id: loteId },
    create: {
      id: loteId,
      municipalidadWallet: municipalidad,
      fechaRecoleccion: toDate(fechaRecoleccion),
      rutaId: Number(rutaId),
      cerrado: false,
      blockNumberIniciado: BigInt(log.blockNumber),
      txHashIniciado: log.transactionHash,
    },
    update: {},
  });
}

export async function handleLoteTipoCerrado(prisma: Prisma, log: ethers.EventLog) {
  const [loteId, tipoPlastico, pesoOficial, factorAjuste] = log.args as unknown as [
    bigint,
    bigint,
    bigint,
    bigint,
  ];

  await prisma.loteTipoCierre.upsert({
    where: { loteId_tipoPlastico: { loteId, tipoPlastico: tipoPlasticoDesdeIndice(tipoPlastico) } },
    create: {
      loteId,
      tipoPlastico: tipoPlasticoDesdeIndice(tipoPlastico),
      pesoOficialGramos: pesoOficial.toString(),
      factorAjuste: factorAjuste.toString(),
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
    },
    update: {},
  });
}

export async function handleLoteMunicipalCerrado(prisma: Prisma, log: ethers.EventLog) {
  const [loteId, pesoOficial, factorAjuste] = log.args as unknown as [bigint, bigint, bigint];

  await prisma.municipalBatch.update({
    where: { id: loteId },
    data: {
      cerrado: true,
      pesoOficialGramos: pesoOficial.toString(),
      factorAjuste: factorAjuste.toString(),
      blockNumberCerrado: BigInt(log.blockNumber),
      txHashCerrado: log.transactionHash,
    },
  });
}
