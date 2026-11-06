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
