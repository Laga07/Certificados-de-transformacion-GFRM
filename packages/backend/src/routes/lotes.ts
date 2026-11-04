import type { FastifyInstance } from "fastify";
import { ethers } from "ethers";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { booleanQueryParam, paginatedResponse, paginationSchema, toSkipTake } from "../lib/pagination.js";

const listQuerySchema = paginationSchema.extend({
  municipalidad: z.string().optional(),
  cerrado: booleanQueryParam.optional(),
  // Filtrar por la provincia/canton de la municipalidad duena del lote: asi un Usuario
  // puede encontrar los lotes abiertos que le corresponden segun su propia ubicacion,
  // sin necesitar que le compartan el loteId por fuera de la app.
  provincia: z.string().optional(),
  cantonId: z.coerce.number().int().optional(),
});

export async function lotesRoutes(app: FastifyInstance) {
  app.get("/lotes", async (request, reply) => {
    const query = listQuerySchema.safeParse(request.query);
    if (!query.success) return reply.badRequest(query.error.message);
    const q = query.data;

    const where: Record<string, unknown> = {};
    if (q.municipalidad) where.municipalidadWallet = ethers.getAddress(q.municipalidad);
    if (q.cerrado !== undefined) where.cerrado = q.cerrado;
    if (q.provincia || q.cantonId !== undefined) {
      where.municipalidad = {
        ...(q.provincia ? { provincia: q.provincia as never } : {}),
        ...(q.cantonId !== undefined ? { cantonId: q.cantonId } : {}),
      };
    }

    const [data, total] = await Promise.all([
      prisma.municipalBatch.findMany({
        where,
        include: { municipalidad: true },
        ...toSkipTake(q),
        orderBy: { blockNumberIniciado: "desc" },
      }),
      prisma.municipalBatch.count({ where }),
    ]);

    return paginatedResponse(data, total, q);
  });

  app.get<{ Params: { id: string } }>("/lotes/:id", async (request, reply) => {
    let id: bigint;
    try {
      id = BigInt(request.params.id);
    } catch {
      return reply.badRequest("id invalido");
    }

    const lote = await prisma.municipalBatch.findUnique({
      where: { id },
      include: {
        transacciones: { orderBy: { id: "asc" } },
        tiposCerrados: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!lote) return reply.notFound("Lote no encontrado");
    return lote;
  });
}
