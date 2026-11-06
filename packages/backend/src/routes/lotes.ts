import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { booleanQueryParam, paginatedResponse, paginationSchema, toSkipTake } from "../lib/pagination.js";

const listQuerySchema = paginationSchema.extend({
  material: z.string().optional(),
  activo: booleanQueryParam.optional(),
});

export async function lotesRoutes(app: FastifyInstance) {
  app.get("/lotes", async (request, reply) => {
    const query = listQuerySchema.safeParse(request.query);
    if (!query.success) return reply.badRequest(query.error.message);

    const where = {
      ...(query.data.material ? { material: query.data.material as never } : {}),
      ...(query.data.activo !== undefined ? { activo: query.data.activo } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.lote.findMany({ where, ...toSkipTake(query.data), orderBy: { id: "desc" } }),
      prisma.lote.count({ where }),
    ]);

    return paginatedResponse(data, total, query.data);
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
