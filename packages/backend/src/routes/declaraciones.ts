import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ethers } from "ethers";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";
import { getIndexedContracts, getProvider, type IndexedContracts } from "../lib/contracts.js";
import { MATERIAL_POR_INDICE, materialDesdeIndice } from "../indexer/enumMaps.js";
import {
  codificarPeriodo,
  confirmarPorEvento,
  contenidoCanonico,
  generarCodigo,
  informeRefDe,
  origenDeDeclaracion,
  origenPendienteDeIndexar,
} from "../lib/declaraciones.js";
import type { Declaracion } from "../generated/prisma/client.js";

// Declaraciones de cumplimiento: retiro de certificados para un informe (ver
// lib/declaraciones.ts y el modelo Declaracion del schema).

let contratos: Promise<IndexedContracts> | null = null;
function getContratos() {
  if (!contratos) contratos = getIndexedContracts(getProvider());
  return contratos;
}

const crearSchema = z.object({
  materialIndex: z.number().int().min(0).max(MATERIAL_POR_INDICE.length - 1),
  cantidadKg: z.number().int().min(1).max(1_000_000_000),
  periodo: z.object({
    tipo: z.enum(["anual", "semestral", "trimestral", "mensual"]),
    anio: z.number().int(),
    numero: z.number().int().min(0).max(12),
  }),
  entidadDestino: z.string().trim().min(3).max(200),
  referencia: z.string().trim().max(120).optional().nullable(),
  descripcion: z.string().trim().max(1000).optional().nullable(),
});

function vistaPrivada(d: Declaracion) {
  return {
    id: d.id,
    codigo: d.codigo,
    wallet: d.wallet,
    material: d.material,
    materialIndex: MATERIAL_POR_INDICE.indexOf(d.material),
    cantidadKg: d.cantidadKg.toString(),
    periodo: d.periodo,
    periodoTexto: d.periodoTexto,
    entidadDestino: d.entidadDestino,
    referencia: d.referencia,
    descripcion: d.descripcion,
    razonSocial: d.razonSocial,
    cedulaJuridica: d.cedulaJuridica,
    informeRef: d.informeRef,
    contenido: d.contenido,
    estado: d.estado,
    txHash: d.txHash,
    blockNumber: d.blockNumber?.toString() ?? null,
    confirmadaEn: d.confirmadaEn,
    createdAt: d.createdAt,
  };
}

export async function declaracionesRoutes(app: FastifyInstance) {
  // ---- crear (queda PENDIENTE hasta que el retiro on-chain lo confirme) ----
  app.post("/declaraciones", { preHandler: requireAuth }, async (request, reply) => {
    const body = crearSchema.safeParse(request.body);
    if (!body.success) return reply.badRequest(body.error.issues[0]?.message ?? "Datos inválidos");
    const d = body.data;
    const account = request.account!;

    if (!account.walletAddress) {
      return reply.badRequest("Primero vinculá tu wallet en Mi cuenta: la declaración queda a nombre de esa wallet.");
    }
    const comprador = await prisma.comprador.findUnique({ where: { wallet: account.walletAddress } });
    if (!comprador?.activo) {
      return reply.badRequest("La wallet vinculada no está registrada como comprador activo.");
    }

    let periodo: { periodo: number; texto: string };
    try {
      periodo = codificarPeriodo(d.periodo.tipo, d.periodo.anio, d.periodo.numero);
    } catch (e) {
      return reply.badRequest((e as Error).message);
    }

    const perfil = await prisma.entidadPerfil.findUnique({ where: { accountId: account.id } });
    const material = materialDesdeIndice(d.materialIndex);
    const creadaEn = new Date();

    // Reintenta si el codigo aleatorio choca (astronomicamente improbable, pero barato).
    for (let intento = 0; intento < 3; intento++) {
      const codigo = generarCodigo();
      const contenido = contenidoCanonico({
        codigo,
        wallet: account.walletAddress,
        razonSocial: perfil?.razonSocial ?? null,
        cedulaJuridica: perfil?.cedula ?? null,
        material,
        cantidadKg: String(d.cantidadKg),
        periodo: periodo.periodo,
        periodoTexto: periodo.texto,
        entidadDestino: d.entidadDestino,
        referencia: d.referencia || null,
        descripcion: d.descripcion || null,
        creadaEn: creadaEn.toISOString(),
      });
      try {
        const decl = await prisma.declaracion.create({
          data: {
            codigo,
            accountId: account.id,
            wallet: account.walletAddress,
            material,
            cantidadKg: String(d.cantidadKg),
            periodo: periodo.periodo,
            periodoTexto: periodo.texto,
            entidadDestino: d.entidadDestino,
            referencia: d.referencia || null,
            descripcion: d.descripcion || null,
            razonSocial: perfil?.razonSocial ?? null,
            cedulaJuridica: perfil?.cedula ?? null,
            contenido,
            informeRef: informeRefDe(contenido),
            createdAt: creadaEn,
          },
        });
        return { declaracion: vistaPrivada(decl) };
      } catch (e) {
        if ((e as { code?: string }).code !== "P2002") throw e;
      }
    }
    return reply.internalServerError("No se pudo generar un código único");
  });

  // ---- confirmar con el hash de la transaccion de retiro ----
  app.post<{ Params: { id: string } }>("/declaraciones/:id/confirmar", { preHandler: requireAuth }, async (request, reply) => {
    const id = Number(request.params.id);
    const body = z.object({ txHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/) }).safeParse(request.body);
    if (!Number.isInteger(id) || !body.success) return reply.badRequest("Datos inválidos");

    const decl = await prisma.declaracion.findUnique({ where: { id } });
    if (!decl || decl.accountId !== request.account!.id) return reply.notFound("Declaración no encontrada");
    if (decl.estado === "CONFIRMADA") return { declaracion: vistaPrivada(decl) };

    const c = await getContratos();
    const provider = getProvider();
    const receipt = await provider.getTransactionReceipt(body.data.txHash);
    if (!receipt) return reply.conflict("La transacción todavía no está confirmada en la red. Probá de nuevo en unos segundos.");
    if (receipt.status !== 1) return reply.badRequest("La transacción de retiro falló en la red.");

    const mercado = (await c.mercado.getAddress()).toLowerCase();
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== mercado) continue;
      let parsed: ethers.LogDescription | null = null;
      try {
        parsed = c.mercado.interface.parseLog(log);
      } catch {
        continue;
      }
      if (parsed?.name !== "CertificadoRetirado") continue;
      const [comprador, material, cantidadKg, informeRef, periodo] = parsed.args as unknown as [string, bigint, bigint, string, bigint];
      if (informeRef.toLowerCase() !== decl.informeRef.toLowerCase()) continue;
      const bloque = await provider.getBlock(receipt.blockNumber);
      const confirmada = await confirmarPorEvento({
        informeRef: decl.informeRef,
        wallet: comprador,
        material: materialDesdeIndice(material),
        cantidadKg: cantidadKg.toString(),
        periodo: Number(periodo),
        txHash: receipt.hash,
        blockNumber: BigInt(receipt.blockNumber),
        timestamp: new Date((bloque?.timestamp ?? Math.floor(Date.now() / 1000)) * 1000),
      });
      if (!confirmada) return reply.badRequest("El retiro on-chain no coincide con los datos de la declaración.");
      return { declaracion: vistaPrivada(confirmada) };
    }
    return reply.badRequest("Esa transacción no contiene el retiro de esta declaración.");
  });

  // ---- mis declaraciones ----
  app.get("/declaraciones", { preHandler: requireAuth }, async (request) => {
    const lista = await prisma.declaracion.findMany({
      where: { accountId: request.account!.id },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return { data: lista.map(vistaPrivada) };
  });

  // ---- detalle + origen (duenio o admin) ----
  app.get<{ Params: { id: string } }>("/declaraciones/:id", { preHandler: requireAuth }, async (request, reply) => {
    const id = Number(request.params.id);
    if (!Number.isInteger(id)) return reply.badRequest("Id inválido");
    const decl = await prisma.declaracion.findUnique({ where: { id } });
    const account = request.account!;
    if (!decl || (decl.accountId !== account.id && account.rol !== "ADMIN")) return reply.notFound("Declaración no encontrada");
    return {
      declaracion: vistaPrivada(decl),
      origen: await origenDeDeclaracion(decl),
      origenSincronizando: await origenPendienteDeIndexar(decl),
    };
  });

  // ---- borrar una PENDIENTE (si el retiro nunca se hizo) ----
  app.delete<{ Params: { id: string } }>("/declaraciones/:id", { preHandler: requireAuth }, async (request, reply) => {
    const id = Number(request.params.id);
    const decl = Number.isInteger(id) ? await prisma.declaracion.findUnique({ where: { id } }) : null;
    if (!decl || decl.accountId !== request.account!.id) return reply.notFound("Declaración no encontrada");
    if (decl.estado !== "PENDIENTE") return reply.badRequest("Una declaración confirmada on-chain no se puede borrar.");
    await prisma.declaracion.delete({ where: { id } });
    return { ok: true };
  });

  // ---- verificacion publica (sin sesion) ----
  app.get<{ Params: { codigo: string } }>(
    "/verificar/:codigo",
    { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const codigo = request.params.codigo.trim().toUpperCase();
      if (!/^VV-[2-9A-Z]{4}-[2-9A-Z]{4}$/.test(codigo)) return reply.badRequest("Código con formato inválido");
      const decl = await prisma.declaracion.findUnique({ where: { codigo } });
      // Una pendiente no es una constancia valida: se responde igual que si no existiera.
      if (!decl || decl.estado !== "CONFIRMADA") return reply.notFound("No existe una constancia confirmada con ese código");

      const retiro = decl.txHash
        ? await prisma.certificadoRetiro.findFirst({ where: { txHash: decl.txHash, informeRef: decl.informeRef } })
        : null;
      const origen = await origenDeDeclaracion(decl);
      return {
        codigo: decl.codigo,
        estado: decl.estado,
        razonSocial: decl.razonSocial,
        cedulaJuridica: decl.cedulaJuridica,
        wallet: decl.wallet,
        material: decl.material,
        cantidadKg: decl.cantidadKg.toString(),
        periodoTexto: decl.periodoTexto,
        entidadDestino: decl.entidadDestino,
        referencia: decl.referencia,
        confirmadaEn: decl.confirmadaEn,
        txHash: decl.txHash,
        blockNumber: decl.blockNumber?.toString() ?? null,
        informeRef: decl.informeRef,
        contenido: decl.contenido,
        // Se recalcula aca: si alguien alterara la fila en la base, no coincidiria con el
        // informeRef grabado on-chain.
        huellaCoincide: informeRefDe(decl.contenido).toLowerCase() === decl.informeRef.toLowerCase(),
        retiroIndexado: Boolean(retiro),
        origenSincronizando: await origenPendienteDeIndexar(decl),
        origen: {
          kgSinOrigen: origen.kgSinOrigen,
          tramos: origen.tramos.map((t) => ({
            emisionId: t.emisionId,
            kg: t.kg,
            separadores: t.separadores,
            intermediarios: t.intermediarios,
            cantones: t.cantones,
          })),
        },
      };
    },
  );
}
