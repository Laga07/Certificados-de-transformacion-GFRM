import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { paginatedResponse, paginationSchema, toSkipTake } from "../lib/pagination.js";

const listQuerySchema = paginationSchema.extend({
  material: z.string().optional(),
  transformador: z.string().optional(),
});

export async function emisionesRoutes(app: FastifyInstance) {
  app.get("/emisiones", async (request, reply) => {
    const query = listQuerySchema.safeParse(request.query);
    if (!query.success) return reply.badRequest(query.error.message);

    const where = {
      ...(query.data.material ? { material: query.data.material as never } : {}),
      ...(query.data.transformador ? { transformadorWallet: query.data.transformador } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.emision.findMany({ where, ...toSkipTake(query.data), orderBy: { id: "desc" } }),
      prisma.emision.count({ where }),
    ]);

    return paginatedResponse(data, total, query.data);
  });

  app.get<{ Params: { id: string } }>("/emisiones/:id", async (request, reply) => {
    let id: bigint;
    try {
      id = BigInt(request.params.id);
    } catch {
      return reply.badRequest("Id de emision invalido");
    }

    const emision = await prisma.emision.findUnique({
      where: { id },
      include: {
        aportes: true,
        eslabones: true,
        ventas: { orderBy: { blockNumber: "asc" } },
      },
    });
    if (!emision) return reply.notFound("Emision no encontrada");
    return emision;
  });

  // Historial de pagos acreditados a una direccion -- util para el dashboard de "lo que me
  // corresponde", aunque el saldo retirable en si se lee en vivo del contrato
  // (saldoPendiente), no de aca.
  app.get<{ Params: { wallet: string } }>("/pagos/:wallet", async (request, reply) => {
    const query = paginationSchema.safeParse(request.query);
    if (!query.success) return reply.badRequest(query.error.message);

    const where = { destinatario: request.params.wallet };
    const [acreditados, retirados, total] = await Promise.all([
      prisma.pagoAcreditado.findMany({ where, ...toSkipTake(query.data), orderBy: { blockNumber: "desc" } }),
      prisma.pagoRetiro.findMany({ where, orderBy: { blockNumber: "desc" }, take: 20 }),
      prisma.pagoAcreditado.count({ where }),
    ]);

    return { ...paginatedResponse(acreditados, total, query.data), retirosRecientes: retirados };
  });
}
