import type { FastifyInstance } from "fastify";
import { ethers } from "ethers";
import { prisma } from "../lib/prisma.js";
import { paginatedResponse, paginationSchema, toSkipTake } from "../lib/pagination.js";

export async function compradoresRoutes(app: FastifyInstance) {
  app.get("/compradores", async (request, reply) => {
    const query = paginationSchema.safeParse(request.query);
    if (!query.success) return reply.badRequest(query.error.message);

    const [data, total] = await Promise.all([
      prisma.comprador.findMany({ ...toSkipTake(query.data), orderBy: { registradoEn: "desc" } }),
      prisma.comprador.count(),
    ]);

    return paginatedResponse(data, total, query.data);
  });

  app.get<{ Params: { wallet: string } }>("/compradores/:wallet", async (request, reply) => {
    let wallet: string;
    try {
      wallet = ethers.getAddress(request.params.wallet);
    } catch {
      return reply.badRequest("Direccion invalida");
    }

    const comprador = await prisma.comprador.findUnique({
      where: { wallet },
      include: {
        ventas: { orderBy: { blockNumber: "desc" }, take: 20 },
        retiros: { orderBy: { blockNumber: "desc" }, take: 20 },
      },
    });
    if (!comprador) return reply.notFound("Comprador no encontrado");
    return comprador;
  });
}
