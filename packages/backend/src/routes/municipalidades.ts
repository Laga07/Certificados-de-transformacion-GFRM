import type { FastifyInstance } from "fastify";
import { ethers } from "ethers";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { paginatedResponse, paginationSchema, toSkipTake } from "../lib/pagination.js";

const listQuerySchema = paginationSchema.extend({
  provincia: z.string().optional(),
  cantonId: z.coerce.number().int().optional(),
});

export async function municipalidadesRoutes(app: FastifyInstance) {
  app.get("/municipalidades", async (request, reply) => {
    const query = listQuerySchema.safeParse(request.query);
    if (!query.success) return reply.badRequest(query.error.message);
    const q = query.data;

    const where = {
      ...(q.provincia ? { provincia: q.provincia as never } : {}),
      ...(q.cantonId !== undefined ? { cantonId: q.cantonId } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.municipality.findMany({ where, ...toSkipTake(q), orderBy: { registradoEn: "desc" } }),
      prisma.municipality.count({ where }),
    ]);

    return paginatedResponse(data, total, q);
  });

  app.get<{ Params: { wallet: string } }>(
    "/municipalidades/:wallet",
    async (request, reply) => {
      let wallet: string;
      try {
        wallet = ethers.getAddress(request.params.wallet);
      } catch {
        return reply.badRequest("Direccion invalida");
      }

      const municipalidad = await prisma.municipality.findUnique({ where: { wallet } });
      if (!municipalidad) return reply.notFound("Municipalidad no encontrada");
      return municipalidad;
    },
  );
}
