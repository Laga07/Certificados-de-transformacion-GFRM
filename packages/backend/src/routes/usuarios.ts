import type { FastifyInstance } from "fastify";
import { ethers } from "ethers";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { paginatedResponse, paginationSchema, toSkipTake } from "../lib/pagination.js";

const listQuerySchema = paginationSchema.extend({
  provincia: z.string().optional(),
});

export async function usuariosRoutes(app: FastifyInstance) {
  app.get("/usuarios", async (request, reply) => {
    const query = listQuerySchema.safeParse(request.query);
    if (!query.success) return reply.badRequest(query.error.message);

    const where = query.data.provincia ? { provincia: query.data.provincia as never } : {};

    const [data, total] = await Promise.all([
      prisma.user.findMany({ where, ...toSkipTake(query.data), orderBy: { registradoEn: "desc" } }),
      prisma.user.count({ where }),
    ]);

    return paginatedResponse(data, total, query.data);
  });

  app.get<{ Params: { wallet: string } }>("/usuarios/:wallet", async (request, reply) => {
    let wallet: string;
    try {
      wallet = ethers.getAddress(request.params.wallet);
    } catch {
      return reply.badRequest("Direccion invalida");
    }

    const usuario = await prisma.user.findUnique({ where: { wallet } });
    if (!usuario) return reply.notFound("Usuario no encontrado");
    return usuario;
  });
}
