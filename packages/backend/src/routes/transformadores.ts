import type { FastifyInstance } from "fastify";
import { ethers } from "ethers";
import { prisma } from "../lib/prisma.js";
import { booleanQueryParam, paginatedResponse, paginationSchema, toSkipTake } from "../lib/pagination.js";

const listQuerySchema = paginationSchema.extend({
  verificado: booleanQueryParam.optional(),
});

export async function transformadoresRoutes(app: FastifyInstance) {
  app.get("/transformadores", async (request, reply) => {
    const query = listQuerySchema.safeParse(request.query);
    if (!query.success) return reply.badRequest(query.error.message);

    const where = query.data.verificado !== undefined ? { verificado: query.data.verificado } : {};

    const [data, total] = await Promise.all([
      prisma.transformador.findMany({
        where,
        ...toSkipTake(query.data),
        orderBy: { registradoEn: "desc" },
      }),
      prisma.transformador.count({ where }),
    ]);

    return paginatedResponse(data, total, query.data);
  });

  app.get("/transformadores/pendientes", async () => {
    return prisma.transformador.findMany({
      where: { verificado: false, activo: true },
      orderBy: { registradoEn: "asc" },
    });
  });

  app.get<{ Params: { wallet: string } }>("/transformadores/:wallet", async (request, reply) => {
    let wallet: string;
    try {
      wallet = ethers.getAddress(request.params.wallet);
    } catch {
      return reply.badRequest("Direccion invalida");
    }

    const transformador = await prisma.transformador.findUnique({
      where: { wallet },
      include: { emisiones: { orderBy: { blockNumber: "desc" }, take: 20 } },
    });
    if (!transformador) return reply.notFound("Transformador no encontrado");
    return transformador;
  });
}
