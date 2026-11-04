import type { FastifyInstance } from "fastify";
import { ethers } from "ethers";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { paginatedResponse, paginationSchema, toSkipTake } from "../lib/pagination.js";

const listQuerySchema = paginationSchema.extend({
  origen: z.string().optional(),
  destino: z.string().optional(),
  direccion: z.string().optional(), // origen o destino
  tipo: z.string().optional(),
  tipoPlastico: z.string().optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
});

export async function transaccionesRoutes(app: FastifyInstance) {
  app.get("/transacciones", async (request, reply) => {
    const query = listQuerySchema.safeParse(request.query);
    if (!query.success) return reply.badRequest(query.error.message);
    const q = query.data;

    const where: Record<string, unknown> = {};
    if (q.origen) where.origen = ethers.getAddress(q.origen);
    if (q.destino) where.destino = ethers.getAddress(q.destino);
    if (q.direccion) {
      const address = ethers.getAddress(q.direccion);
      where.OR = [{ origen: address }, { destino: address }];
    }
    if (q.tipo) where.tipo = q.tipo;
    if (q.tipoPlastico) where.tipoPlastico = q.tipoPlastico;
    if (q.desde || q.hasta) {
      where.timestampOnchain = {
        ...(q.desde ? { gte: q.desde } : {}),
        ...(q.hasta ? { lte: q.hasta } : {}),
      };
    }

    const [data, total] = await Promise.all([
      prisma.transaccion.findMany({
        where,
        ...toSkipTake(q),
        orderBy: { blockNumber: "desc" },
      }),
      prisma.transaccion.count({ where }),
    ]);

    return paginatedResponse(data, total, q);
  });

  app.get<{ Params: { id: string } }>("/transacciones/:id", async (request, reply) => {
    let id: bigint;
    try {
      id = BigInt(request.params.id);
    } catch {
      return reply.badRequest("id invalido");
    }

    const transaccion = await prisma.transaccion.findUnique({ where: { id } });
    if (!transaccion) return reply.notFound("Transaccion no encontrada");
    return transaccion;
  });
}
