import type { ethers } from "ethers";
import type { prisma as PrismaClientInstance } from "../../lib/prisma.js";
import { provinciaDesdeIndice } from "../enumMaps.js";
import type { IndexedContracts } from "../../lib/contracts.js";

type Prisma = typeof PrismaClientInstance;

function toDate(unixSeconds: bigint | number): Date {
  return new Date(Number(unixSeconds) * 1000);
}

export async function handleUsuarioRegistrado(
  prisma: Prisma,
  contracts: IndexedContracts,
  log: ethers.EventLog,
) {
  const [wallet, identidadHash] = log.args as unknown as [string, string];
  const usuario = await contracts.registro.usuarios(wallet);

  await prisma.user.upsert({
    where: { wallet },
    create: {
      wallet,
      identidadHash,
      provincia: provinciaDesdeIndice(usuario.residencia.provincia),
      cantonId: Number(usuario.residencia.cantonId),
      loteM2: Number(usuario.residencia.loteM2),
      tipoVivienda: Number(usuario.residencia.tipoVivienda),
      activo: usuario.activo,
      registradoEn: toDate(usuario.registradoEn),
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
    },
    update: {
      activo: usuario.activo,
    },
  });
}

export async function handleCentroRegistrado(
  prisma: Prisma,
  contracts: IndexedContracts,
  provider: ethers.Provider,
  log: ethers.EventLog,
) {
  const [wallet, nombreHash] = log.args as unknown as [string, string];
  const centro = await contracts.registro.centros(wallet);
  // CentroRecolector no tiene campo "registradoEn" en el contrato (solo Usuario lo tiene);
  // usamos el timestamp del bloque del evento en su lugar.
  const block = await provider.getBlock(log.blockNumber);

  await prisma.collectionCenter.upsert({
    where: { wallet },
    create: {
      wallet,
      nombreHash,
      cedulaHash: centro.cedulaHash,
      provincia: provinciaDesdeIndice(centro.ubicacion.provincia),
      cantonId: Number(centro.ubicacion.cantonId),
      loteM2: Number(centro.ubicacion.loteM2),
      tipoVivienda: Number(centro.ubicacion.tipoVivienda),
      esPublico: centro.esPublico,
      verificado: centro.verificado,
      activo: centro.activo,
      registradoEn: toDate(block?.timestamp ?? Math.floor(Date.now() / 1000)),
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
    },
    update: {
      activo: centro.activo,
    },
  });
}

export async function handleCentroVerificado(
  prisma: Prisma,
  provider: ethers.Provider,
  log: ethers.EventLog,
) {
  const [centro, verificador] = log.args as unknown as [string, string];
  const block = await provider.getBlock(log.blockNumber);

  await prisma.collectionCenter.update({
    where: { wallet: centro },
    data: {
      verificado: true,
      verificadoPor: verificador,
      verificadoEn: toDate(block?.timestamp ?? Math.floor(Date.now() / 1000)),
    },
  });
}

export async function handleMunicipalidadRegistrada(
  prisma: Prisma,
  contracts: IndexedContracts,
  provider: ethers.Provider,
  log: ethers.EventLog,
) {
  const [wallet, nombreHash] = log.args as unknown as [string, string];
  const block = await provider.getBlock(log.blockNumber);
  const municipalidad = await contracts.registro.municipalidades(wallet);

  await prisma.municipality.upsert({
    where: { wallet },
    create: {
      wallet,
      nombreHash,
      provincia: provinciaDesdeIndice(municipalidad.provincia),
      cantonId: Number(municipalidad.cantonId),
      activo: true,
      registradoEn: toDate(block?.timestamp ?? Math.floor(Date.now() / 1000)),
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
    },
    update: {},
  });
}
