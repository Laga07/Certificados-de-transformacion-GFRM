import type { FastifyInstance } from "fastify";
import { ethers } from "ethers";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { booleanQueryParam, paginatedResponse, paginationSchema, toSkipTake } from "../lib/pagination.js";

const listQuerySchema = paginationSchema.extend({
  verificado: booleanQueryParam.optional(),
  provincia: z.string().optional(),
});

export async function centrosRoutes(app: FastifyInstance) {
  app.get("/centros", async (request, reply) => {
    const query = listQuerySchema.safeParse(request.query);
    if (!query.success) return reply.badRequest(query.error.message);

    const where = {
      ...(query.data.verificado !== undefined ? { verificado: query.data.verificado } : {}),
      ...(query.data.provincia ? { provincia: query.data.provincia as never } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.collectionCenter.findMany({
        where,
        ...toSkipTake(query.data),
        orderBy: { registradoEn: "desc" },
      }),
      prisma.collectionCenter.count({ where }),
    ]);

    return paginatedResponse(data, total, query.data);
  });

  app.get<{ Params: { wallet: string } }>("/centros/:wallet", async (request, reply) => {
    let wallet: string;
    try {
      wallet = ethers.getAddress(request.params.wallet);
    } catch {
      return reply.badRequest("Direccion invalida");
    }

    const centro = await prisma.collectionCenter.findUnique({ where: { wallet } });
    if (!centro) return reply.notFound("Centro no encontrado");
    return centro;
  });
}
