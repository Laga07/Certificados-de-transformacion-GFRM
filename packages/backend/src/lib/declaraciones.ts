import { randomBytes } from "node:crypto";
import { ethers } from "ethers";
import { prisma } from "./prisma.js";
import type { Declaracion } from "../generated/prisma/client.js";
import type { Material } from "../generated/prisma/enums.js";

// ==== PERIODO ====
// El contrato guarda `periodo` como uint32. Codificacion: AAAA*100 + NN, con
// NN = 00 anual, 01-12 mes, 21-24 trimestre, 31-32 semestre. Decodificable y ordenable.

export type TipoPeriodo = "anual" | "semestral" | "trimestral" | "mensual";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "setiembre", "octubre", "noviembre", "diciembre",
];
const ORDINALES = ["1.er", "2.º", "3.er", "4.º"];

export function codificarPeriodo(tipo: TipoPeriodo, anio: number, numero: number): { periodo: number; texto: string } {
  if (!Number.isInteger(anio) || anio < 2020 || anio > 2100) throw new Error("Año inválido");
  switch (tipo) {
    case "anual":
      return { periodo: anio * 100, texto: `Año ${anio}` };
    case "semestral":
      if (numero < 1 || numero > 2) throw new Error("Semestre inválido");
      return { periodo: anio * 100 + 30 + numero, texto: `${ORDINALES[numero - 1]} semestre ${anio}` };
    case "trimestral":
      if (numero < 1 || numero > 4) throw new Error("Trimestre inválido");
      return { periodo: anio * 100 + 20 + numero, texto: `${ORDINALES[numero - 1]} trimestre ${anio}` };
    case "mensual":
      if (numero < 1 || numero > 12) throw new Error("Mes inválido");
      return { periodo: anio * 100 + numero, texto: `${MESES[numero - 1][0].toUpperCase()}${MESES[numero - 1].slice(1)} ${anio}` };
  }
}

// ==== CODIGO PUBLICO ====
// Sin 0/O/1/I/L para que se pueda dictar o copiar a mano desde una constancia impresa.
const ALFABETO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generarCodigo(): string {
  const bytes = randomBytes(8);
  let s = "";
  for (const b of bytes) s += ALFABETO[b % ALFABETO.length];
  return `VV-${s.slice(0, 4)}-${s.slice(4)}`;
}

// ==== CONTENIDO CANONICO E informeRef ====
// El JSON se arma con claves en orden fijo y sin espacios: cualquiera que tenga la constancia
// puede reconstruirlo byte a byte y comparar su keccak256 con el informeRef grabado on-chain.

export interface DatosContenido {
  codigo: string;
  wallet: string;
  razonSocial: string | null;
  cedulaJuridica: string | null;
  material: Material;
  cantidadKg: string;
  periodo: number;
  periodoTexto: string;
  entidadDestino: string;
  referencia: string | null;
  descripcion: string | null;
  creadaEn: string;
}

export function contenidoCanonico(d: DatosContenido): string {
  const ordenado = {
    version: 1,
    plataforma: "valorverde.org",
    codigo: d.codigo,
    wallet: d.wallet,
    razonSocial: d.razonSocial,
    cedulaJuridica: d.cedulaJuridica,
    material: d.material,
    cantidadKg: d.cantidadKg,
    periodo: d.periodo,
    periodoTexto: d.periodoTexto,
    entidadDestino: d.entidadDestino,
    referencia: d.referencia,
    descripcion: d.descripcion,
    creadaEn: d.creadaEn,
  };
  return JSON.stringify(ordenado);
}

export function informeRefDe(contenido: string): `0x${string}` {
  return ethers.keccak256(ethers.toUtf8Bytes(contenido)) as `0x${string}`;
}

// ==== ORIGEN DEL MATERIAL ====
// Los certificados son ERC-20 fungibles por material: on-chain no hay un vinculo entre los kg
// que se retiran y una emision concreta. Para la constancia se asignan FIFO contra las
// compras primarias de la misma wallet (la mas vieja primero), descontando lo que ya cubrieron
// declaraciones confirmadas anteriores. Si la wallet recibio certificados por transferencia
// (no por compra primaria), esa parte figura como "sin compra primaria registrada".

export interface TramoOrigen {
  emisionId: string;
  kg: string;
  compraTxHash: string;
  compraBloque: string;
  transformadorWallet: string;
  precioUSDTporKg: string;
  kgTransformadosEmision: string;
  separadores: number;
  intermediarios: number;
  cantones: { provincia: string; cantonId: number; kgAportados: string }[];
  mermaTotalGramos: string;
}

export interface OrigenDeclaracion {
  tramos: TramoOrigen[];
  kgSinOrigen: string;
}

export async function origenDeDeclaracion(decl: Declaracion): Promise<OrigenDeclaracion> {
  const compras = await prisma.ventaPrimaria.findMany({
    where: { compradorWallet: decl.wallet, emision: { material: decl.material } },
    orderBy: [{ blockNumber: "asc" }, { logIndex: "asc" }],
    include: {
      emision: {
        include: { aportes: { include: { separador: true } }, eslabones: true },
      },
    },
  });

  // Lo ya cubierto por declaraciones confirmadas ANTERIORES de la misma wallet y material.
  const anteriores = await prisma.declaracion.findMany({
    where: {
      wallet: decl.wallet,
      material: decl.material,
      estado: "CONFIRMADA",
      id: { not: decl.id },
      ...(decl.estado === "CONFIRMADA" && decl.blockNumber !== null
        ? { blockNumber: { lt: decl.blockNumber } }
        : {}),
    },
    select: { cantidadKg: true },
  });
  let porSaltar = anteriores.reduce((acc, a) => acc + BigInt(a.cantidadKg.toString()), BigInt(0));
  let porAsignar = BigInt(decl.cantidadKg.toString());

  const tramos: TramoOrigen[] = [];
  for (const compra of compras) {
    if (porAsignar === BigInt(0)) break;
    let disponible = BigInt(compra.cantidadKg.toString());
    if (porSaltar > BigInt(0)) {
      const salto = porSaltar < disponible ? porSaltar : disponible;
      disponible -= salto;
      porSaltar -= salto;
    }
    if (disponible === BigInt(0)) continue;
    const kg = disponible < porAsignar ? disponible : porAsignar;
    porAsignar -= kg;

    const e = compra.emision;
    const porCanton = new Map<string, { provincia: string; cantonId: number; gramos: bigint }>();
    for (const a of e.aportes) {
      const clave = `${a.separador.provincia}-${a.separador.cantonId}`;
      const fila = porCanton.get(clave) ?? { provincia: a.separador.provincia, cantonId: a.separador.cantonId, gramos: BigInt(0) };
      fila.gramos += BigInt(a.kgAportado.toString());
      porCanton.set(clave, fila);
    }

    tramos.push({
      emisionId: e.id.toString(),
      kg: kg.toString(),
      compraTxHash: compra.txHash,
      compraBloque: compra.blockNumber.toString(),
      transformadorWallet: e.transformadorWallet,
      precioUSDTporKg: e.precioUSDTporKg.toString(),
      kgTransformadosEmision: e.kgTransformadosOriginal.toString(),
      separadores: e.aportes.length,
      intermediarios: e.eslabones.filter((x) => x.direccion.toLowerCase() !== e.transformadorWallet.toLowerCase()).length,
      // aportes y merma estan en GRAMOS (TokenCustodia); se informan en kg con 3 decimales.
      cantones: [...porCanton.values()]
        .sort((a, b) => (b.gramos > a.gramos ? 1 : -1))
        .map((c) => ({ provincia: c.provincia, cantonId: c.cantonId, kgAportados: (Number(c.gramos) / 1000).toFixed(3) })),
      mermaTotalGramos: e.eslabones.reduce((acc, x) => acc + BigInt(x.mermaKg.toString()), BigInt(0)).toString(),
    });
  }

  return { tramos, kgSinOrigen: porAsignar.toString() };
}

// ==== CONFIRMACION ON-CHAIN ====
// Marca CONFIRMADA una declaracion pendiente cuyo informeRef aparece en un evento
// CertificadoRetirado. La llaman el endpoint /confirmar y el indexer: es idempotente.
export async function confirmarPorEvento(args: {
  informeRef: string;
  wallet: string;
  material: Material;
  cantidadKg: string;
  periodo: number;
  txHash: string;
  blockNumber: bigint;
  timestamp: Date;
}): Promise<Declaracion | null> {
  const decl = await prisma.declaracion.findUnique({ where: { informeRef: args.informeRef } });
  if (!decl) return null;
  if (decl.estado === "CONFIRMADA") return decl;
  const coincide =
    decl.wallet.toLowerCase() === args.wallet.toLowerCase() &&
    decl.material === args.material &&
    decl.cantidadKg.toString() === args.cantidadKg &&
    decl.periodo === args.periodo;
  if (!coincide) return null;
  return prisma.declaracion.update({
    where: { id: decl.id },
    data: { estado: "CONFIRMADA", txHash: args.txHash, blockNumber: args.blockNumber, confirmadaEn: args.timestamp },
  });
}

// true si el indexer todavia no llego al bloque del retiro: el origen (que sale de las compras
// indexadas) puede estar incompleto por unos segundos. La constancia lo indica en vez de
// decir que los kg "no provienen de compras primarias".
export async function origenPendienteDeIndexar(decl: Declaracion): Promise<boolean> {
  if (decl.blockNumber === null) return false;
  const estado = await prisma.indexerState.findFirst();
  return !estado || estado.lastBlockNumber < decl.blockNumber;
}
