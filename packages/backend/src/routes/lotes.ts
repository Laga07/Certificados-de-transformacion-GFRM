import type { FastifyInstance } from "fastify";
import { ethers } from "ethers";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { booleanQueryParam, paginatedResponse, paginationSchema, toSkipTake } from "../lib/pagination.js";

const listQuerySchema = paginationSchema.extend({
  material: z.string().optional(),
  activo: booleanQueryParam.optional(),
  // "Mis lotes": los que una wallet tiene en custodia ahora mismo.
  custodio: z.string().optional(),
});

function direccion(valor: string, reply: { badRequest: (m: string) => unknown }): string | null {
  try {
    return ethers.getAddress(valor);
  } catch {
    reply.badRequest("Direccion invalida");
    return null;
  }
}

export async function lotesRoutes(app: FastifyInstance) {
  app.get("/lotes", async (request, reply) => {
    const query = listQuerySchema.safeParse(request.query);
    if (!query.success) return reply.badRequest(query.error.message);

    let custodio: string | undefined;
    if (query.data.custodio) {
      const d = direccion(query.data.custodio, reply);
      if (!d) return;
      custodio = d;
    }

    const where = {
      ...(query.data.material ? { material: query.data.material as never } : {}),
      ...(query.data.activo !== undefined ? { activo: query.data.activo } : {}),
      ...(custodio ? { custodioActual: custodio } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.lote.findMany({
        where,
        ...toSkipTake(query.data),
        orderBy: { id: "desc" },
        // Un traspaso Declarado sin confirmar es lo que el frontend muestra como "en transito
        // hacia X": el custodio no puede mover ese lote hasta que el destinatario confirme.
        include: { traspasos: { where: { estado: "Declarado" }, take: 1 } },
      }),
      prisma.lote.count({ where }),
    ]);

    return paginatedResponse(
      data.map(({ traspasos, ...lote }) => ({ ...lote, traspasoPendiente: traspasos[0] ?? null })),
      total,
      query.data,
    );
  });

  // Traspasos declarados que esperan confirmacion de `hacia` (bandeja de entrada del
  // receptor) o que `de` envio y siguen sin confirmar.
  app.get("/traspasos/pendientes", async (request, reply) => {
    const query = z.object({ hacia: z.string().optional(), de: z.string().optional() }).safeParse(request.query);
    if (!query.success || (!query.data.hacia && !query.data.de)) return reply.badRequest("Indica hacia o de");

    const where: { estado: "Declarado"; hacia?: string; de?: string } = { estado: "Declarado" };
    if (query.data.hacia) {
      const d = direccion(query.data.hacia, reply);
      if (!d) return;
      where.hacia = d;
    }
    if (query.data.de) {
      const d = direccion(query.data.de, reply);
      if (!d) return;
      where.de = d;
    }

    const data = await prisma.traspaso.findMany({
      where,
      orderBy: { blockNumberDeclarado: "desc" },
      take: 100,
      include: { lote: { select: { id: true, material: true, varianteId: true, pesoActual: true } } },
    });
    return { data };
  });

  app.get<{ Params: { id: string } }>("/lotes/:id", async (request, reply) => {
    let id: bigint;
    try {
      id = BigInt(request.params.id);
    } catch {
      return reply.badRequest("Id de lote invalido");
    }

    const lote = await prisma.lote.findUnique({
      where: { id },
      include: {
        entregas: { orderBy: { blockNumber: "asc" } },
        traspasos: { orderBy: { id: "asc" } },
      },
    });
    if (!lote) return reply.notFound("Lote no encontrado");
    return lote;
  });
}
