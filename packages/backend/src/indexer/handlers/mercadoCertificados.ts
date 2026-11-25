import type { ethers } from "ethers";
import type { prisma as PrismaClientInstance } from "../../lib/prisma.js";
import { materialDesdeIndice } from "../enumMaps.js";
import type { IndexedContracts } from "../../lib/contracts.js";
import { confirmarPorEvento } from "../../lib/declaraciones.js";

type Prisma = typeof PrismaClientInstance;

export async function handleCertificadoDesplegado(
  prisma: Prisma,
  log: ethers.EventLog,
) {
  const [material, clone, nombre, simbolo] = log.args as unknown as [
    bigint,
    string,
    string,
    string,
  ];

  await prisma.certificadoContrato.upsert({
    where: { material: materialDesdeIndice(material) },
    create: {
      material: materialDesdeIndice(material),
      direccion: clone,
      nombre,
      simbolo,
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
    },
    update: {},
  });
}

export async function handleTransformacionRegistrada(
  prisma: Prisma,
  contracts: IndexedContracts,
  log: ethers.EventLog,
) {
  const [emisionId, transformador, material, , loteConsolidadoId, pesoConsumidoTotal, , mermaTransformador] =
    log.args as unknown as [bigint, string, bigint, bigint[], bigint, bigint, bigint, bigint];

  const emision = await contracts.mercado.emisiones(emisionId);

  await prisma.emision.upsert({
    where: { id: emisionId },
    create: {
      id: emisionId,
      material: materialDesdeIndice(material),
      transformadorWallet: transformador,
      loteConsolidadoId,
      pesoConsumidoTotal: pesoConsumidoTotal.toString(),
      kgTransformadosOriginal: emision.kgTransformadosOriginal.toString(),
      kgDisponiblesPrimario: emision.kgDisponiblesPrimario.toString(),
      pesoAceptadoOrigenTotal: emision.pesoAceptadoOrigenTotal.toString(),
      // En GRAMOS, tal como lo emite el contrato (antes se calculaba gramos - kg, mezclando
      // unidades; ver seccion 0.2 de docs/arquitectura-certificado-transformacion.md).
      mermaTransformador: mermaTransformador.toString(),
      precioUSDTporKg: emision.precioUSDTporKg.toString(),
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
    },
    update: {},
  });

  const separadores: string[] = await contracts.mercado.separadoresDeEmision(emisionId);
  for (const separadorWallet of separadores) {
    const kgAportado: bigint = await contracts.mercado.aporteKgDeEmision(emisionId, separadorWallet);
    await prisma.emisionAporte.upsert({
      where: { emisionId_separadorWallet: { emisionId, separadorWallet } },
      create: { emisionId, separadorWallet, kgAportado: kgAportado.toString() },
      update: {},
    });
  }

  const eslabones: string[] = await contracts.mercado.eslabonesDeEmision(emisionId);
  for (const direccion of eslabones) {
    const mermaKg: bigint = await contracts.mercado.mermaKgDeEmision(emisionId, direccion);
    await prisma.emisionEslabon.upsert({
      where: { emisionId_direccion: { emisionId, direccion } },
      create: { emisionId, direccion, mermaKg: mermaKg.toString() },
      update: {},
    });
  }
}

export async function handleCertificadoComprado(
  prisma: Prisma,
  contracts: IndexedContracts,
  log: ethers.EventLog,
) {
  const [emisionId, comprador, cantidadKg, valorTotal] = log.args as unknown as [
    bigint,
    string,
    bigint,
    bigint,
  ];

  const venta = await prisma.ventaPrimaria.upsert({
    where: { txHash_logIndex: { txHash: log.transactionHash, logIndex: log.index } },
    create: {
      emisionId,
      compradorWallet: comprador,
      cantidadKg: cantidadKg.toString(),
      valorTotal: valorTotal.toString(),
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
      logIndex: log.index,
    },
    update: {},
  });

  // _repartirVenta() emite sus PagoAcreditado ANTES que este CertificadoComprado (ver el
  // orden de emits en MercadoCertificados.sol) -- cuando esos eventos se procesaron, esta
  // fila de VentaPrimaria todavia no existia. Se completa la relacion aca, retroactivamente,
  // para todos los PagoAcreditado de esta misma transaccion.
  await prisma.pagoAcreditado.updateMany({
    where: { txHash: log.transactionHash, ventaId: null },
    data: { ventaId: venta.id },
  });

  // Mantener kgDisponiblesPrimario al dia sin esperar otro poll -- se lee del contrato (es
  // la unica fuente de verdad), no se resta a mano aca.
  const emision = await contracts.mercado.emisiones(emisionId);
  await prisma.emision.update({
    where: { id: emisionId },
    data: { kgDisponiblesPrimario: emision.kgDisponiblesPrimario.toString() },
  });
}

export async function handlePagoAcreditado(prisma: Prisma, log: ethers.EventLog) {
  const [emisionId, destinatario, monto] = log.args as unknown as [bigint, string, bigint];

  // ventaId se completa despues, cuando llega CertificadoComprado de la misma transaccion
  // (ver handleCertificadoComprado) -- este evento siempre se procesa primero.
  await prisma.pagoAcreditado.upsert({
    where: { txHash_logIndex: { txHash: log.transactionHash, logIndex: log.index } },
    create: {
      emisionId,
      destinatario,
      monto: monto.toString(),
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
      logIndex: log.index,
    },
    update: {},
  });
}

export async function handlePagoRetirado(prisma: Prisma, log: ethers.EventLog) {
  const [destinatario, monto] = log.args as unknown as [string, bigint];

  await prisma.pagoRetiro.upsert({
    where: { txHash_logIndex: { txHash: log.transactionHash, logIndex: log.index } },
    create: {
      destinatario,
      monto: monto.toString(),
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
      logIndex: log.index,
    },
    update: {},
  });
}

export async function handleCertificadoRetirado(prisma: Prisma, provider: ethers.Provider, log: ethers.EventLog) {
  const [comprador, material, cantidadKg, informeRef, periodo] = log.args as unknown as [
    string,
    bigint,
    bigint,
    string,
    bigint,
  ];

  await prisma.certificadoRetiro.upsert({
    where: { txHash_logIndex: { txHash: log.transactionHash, logIndex: log.index } },
    create: {
      compradorWallet: comprador,
      material: materialDesdeIndice(material),
      cantidadKg: cantidadKg.toString(),
      informeRef,
      periodo: Number(periodo),
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
      logIndex: log.index,
    },
    update: {},
  });

  // Si el retiro corresponde a una declaracion creada en la plataforma (informeRef = huella
  // de su contenido), se confirma aca tambien: cubre el caso en que el usuario cerro el
  // navegador antes de que el frontend llamara a /declaraciones/:id/confirmar.
  const bloque = await provider.getBlock(log.blockNumber);
  await confirmarPorEvento({
    informeRef,
    wallet: comprador,
    material: materialDesdeIndice(material),
    cantidadKg: cantidadKg.toString(),
    periodo: Number(periodo),
    txHash: log.transactionHash,
    blockNumber: BigInt(log.blockNumber),
    timestamp: new Date((bloque?.timestamp ?? Math.floor(Date.now() / 1000)) * 1000),
  });
}
