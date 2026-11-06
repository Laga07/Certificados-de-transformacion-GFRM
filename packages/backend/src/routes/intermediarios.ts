import type { FastifyInstance } from "fastify";
import { ethers } from "ethers";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { booleanQueryParam, paginatedResponse, paginationSchema, toSkipTake } from "../lib/pagination.js";

const listQuerySchema = paginationSchema.extend({
  provincia: z.string().optional(),
  verificado: booleanQueryParam.optional(),
});

export async function intermediariosRoutes(app: FastifyInstance) {
  app.get("/intermediarios", async (request, reply) => {
    const query = listQuerySchema.safeParse(request.query);
    if (!query.success) return reply.badRequest(query.error.message);

    const where = {
      ...(query.data.provincia ? { provincia: query.data.provincia as never } : {}),
      ...(query.data.verificado !== undefined ? { verificado: query.data.verificado } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.intermediario.findMany({
        where,
        ...toSkipTake(query.data),
        orderBy: { registradoEn: "desc" },
      }),
      prisma.intermediario.count({ where }),
    ]);

    return paginatedResponse(data, total, query.data);
  });

  // Atajo para el panel de administracion: intermediarios/transformadores aun sin verificar.
  app.get("/intermediarios/pendientes", async () => {
    return prisma.intermediario.findMany({
      where: { verificado: false, activo: true },
      orderBy: { registradoEn: "asc" },
    });
  });

  app.get<{ Params: { wallet: string } }>("/intermediarios/:wallet", async (request, reply) => {
    let wallet: string;
    try {
      wallet = ethers.getAddress(request.params.wallet);
    } catch {
      return reply.badRequest("Direccion invalida");
    }

    const intermediario = await prisma.intermediario.findUnique({ where: { wallet } });
    if (!intermediario) return reply.notFound("Intermediario no encontrado");
    return intermediario;
  });
}
