import type { ethers } from "ethers";
import type { prisma as PrismaClientInstance } from "../../lib/prisma.js";
import { provinciaDesdeIndice } from "../enumMaps.js";
import type { IndexedContracts } from "../../lib/contracts.js";

type Prisma = typeof PrismaClientInstance;

function toDate(unixSeconds: bigint | number): Date {
  return new Date(Number(unixSeconds) * 1000);
}

export async function handleSeparadorRegistrado(
  prisma: Prisma,
  contracts: IndexedContracts,
  log: ethers.EventLog,
) {
  const [wallet, identidadHash, tipoSeparador] = log.args as unknown as [string, string, bigint];
  const separador = await contracts.registro.separadores(wallet);

  await prisma.separador.upsert({
    where: { wallet },
    create: {
      wallet,
      identidadHash,
      provincia: provinciaDesdeIndice(separador.ubicacion.provincia),
      cantonId: Number(separador.ubicacion.cantonId),
      tipoSeparador: Number(tipoSeparador),
      activo: separador.activo,
      registradoEn: toDate(separador.registradoEn),
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
    },
    update: { activo: separador.activo },
  });
}

export async function handleIntermediarioRegistrado(
  prisma: Prisma,
  contracts: IndexedContracts,
  log: ethers.EventLog,
) {
  const [wallet, nombreHash, subtipo] = log.args as unknown as [string, string, bigint];
  const intermediario = await contracts.registro.intermediarios(wallet);

  await prisma.intermediario.upsert({
    where: { wallet },
    create: {
      wallet,
      nombreHash,
      cedulaHash: intermediario.cedulaHash,
      provincia: provinciaDesdeIndice(intermediario.ubicacion.provincia),
      cantonId: Number(intermediario.ubicacion.cantonId),
      subtipo: Number(subtipo),
      verificado: intermediario.verificado,
      activo: intermediario.activo,
      registradoEn: toDate(intermediario.registradoEn),
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
    },
    update: { activo: intermediario.activo },
  });
}

export async function handleIntermediarioVerificado(
  prisma: Prisma,
  provider: ethers.Provider,
  log: ethers.EventLog,
) {
  const [wallet, verificador] = log.args as unknown as [string, string];
  const block = await provider.getBlock(log.blockNumber);

  await prisma.intermediario.update({
    where: { wallet },
    data: {
      verificado: true,
      verificadoPor: verificador,
      verificadoEn: toDate(block?.timestamp ?? Math.floor(Date.now() / 1000)),
    },
  });
}

export async function handleTransformadorRegistrado(
  prisma: Prisma,
  contracts: IndexedContracts,
  log: ethers.EventLog,
) {
  const [wallet, nombreHash] = log.args as unknown as [string, string];
  const transformador = await contracts.registro.transformadores(wallet);

  await prisma.transformador.upsert({
    where: { wallet },
    create: {
      wallet,
      nombreHash,
      cedulaHash: transformador.cedulaHash,
      provincia: provinciaDesdeIndice(transformador.ubicacion.provincia),
      cantonId: Number(transformador.ubicacion.cantonId),
      verificado: transformador.verificado,
      activo: transformador.activo,
      registradoEn: toDate(transformador.registradoEn),
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
    },
    update: { activo: transformador.activo },
  });
}

export async function handleTransformadorVerificado(
  prisma: Prisma,
  provider: ethers.Provider,
  log: ethers.EventLog,
) {
  const [wallet, verificador] = log.args as unknown as [string, string];
  const block = await provider.getBlock(log.blockNumber);

  await prisma.transformador.update({
    where: { wallet },
    data: {
      verificado: true,
      verificadoPor: verificador,
      verificadoEn: toDate(block?.timestamp ?? Math.floor(Date.now() / 1000)),
    },
  });
}

// Rol enum de TiposComunes.sol: 0 Ninguno, 1 Separador, 2 Intermediario, 3 Transformador,
// 4 Comprador. Los eventos de gobernanza traen el rol para no tener que adivinar en que
// tabla vive la wallet.
const ROL_SEPARADOR = 1;
const ROL_INTERMEDIARIO = 2;
const ROL_TRANSFORMADOR = 3;
const ROL_COMPRADOR = 4;

export async function handleEntidadActivoCambiado(prisma: Prisma, log: ethers.EventLog, activo: boolean) {
  const [wallet, rol] = log.args as unknown as [string, bigint, string];
  const data = { activo };
  switch (Number(rol)) {
    case ROL_SEPARADOR:
      return prisma.separador.updateMany({ where: { wallet }, data });
    case ROL_INTERMEDIARIO:
      return prisma.intermediario.updateMany({ where: { wallet }, data });
    case ROL_TRANSFORMADOR:
      return prisma.transformador.updateMany({ where: { wallet }, data });
    case ROL_COMPRADOR:
      return prisma.comprador.updateMany({ where: { wallet }, data });
    default:
      throw new Error(`Rol desconocido ${rol} en evento de activacion para ${wallet}`);
  }
}

export async function handleVerificacionRevocada(prisma: Prisma, log: ethers.EventLog) {
  const [wallet, rol] = log.args as unknown as [string, bigint, string];
  const data = { verificado: false, verificadoPor: null, verificadoEn: null };
  if (Number(rol) === ROL_INTERMEDIARIO) {
    return prisma.intermediario.updateMany({ where: { wallet }, data });
  }
  if (Number(rol) === ROL_TRANSFORMADOR) {
    return prisma.transformador.updateMany({ where: { wallet }, data });
  }
  throw new Error(`VerificacionRevocada con rol inesperado ${rol} para ${wallet}`);
}

export async function handleCompradorRegistrado(
  prisma: Prisma,
  contracts: IndexedContracts,
  log: ethers.EventLog,
) {
  const [wallet, nombreHash, empresaObligadaLey9786] = log.args as unknown as [
    string,
    string,
    boolean,
  ];
  const comprador = await contracts.registro.compradores(wallet);

  await prisma.comprador.upsert({
    where: { wallet },
    create: {
      wallet,
      nombreHash,
      cedulaHash: comprador.cedulaHash,
      empresaObligadaLey9786,
      activo: comprador.activo,
      registradoEn: toDate(comprador.registradoEn),
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
    },
    update: { activo: comprador.activo },
  });
}
