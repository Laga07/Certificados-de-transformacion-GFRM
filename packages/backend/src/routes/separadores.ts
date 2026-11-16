import type { FastifyInstance } from "fastify";
import { ethers } from "ethers";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { paginatedResponse, paginationSchema, toSkipTake } from "../lib/pagination.js";
import { requireAuth } from "../lib/auth.js";
import { hashCedula } from "../lib/identidad.js";

const listQuerySchema = paginationSchema.extend({
  provincia: z.string().optional(),
});

export async function separadoresRoutes(app: FastifyInstance) {
  // Busqueda por cedula para el formulario de "Registrar entrega": el intermediario escribe
  // la cedula del separador (o la lee de un QR) en vez de pegar una direccion 0x. La cedula
  // nunca se guarda ni se loguea: se convierte al mismo hash que vive on-chain y se busca por
  // ese. Con sesion + rate limit para que no sirva para enumerar cedulas.
  app.get(
    "/separadores/buscar",
    { config: { rateLimit: { max: 30, timeWindow: "1 minute" } }, preHandler: requireAuth },
    async (request, reply) => {
      const query = z.object({ cedula: z.string().min(3).max(40) }).safeParse(request.query);
      if (!query.success) return reply.badRequest("Indica la cedula");

      const separador = await prisma.separador.findUnique({ where: { identidadHash: hashCedula(query.data.cedula) } });
      if (!separador) return reply.notFound("No hay ningun separador registrado con esa cedula");
      return {
        wallet: separador.wallet,
        provincia: separador.provincia,
        cantonId: separador.cantonId,
        tipoSeparador: separador.tipoSeparador,
        activo: separador.activo,
      };
    },
  );

  app.get("/separadores", async (request, reply) => {
    const query = listQuerySchema.safeParse(request.query);
    if (!query.success) return reply.badRequest(query.error.message);

    const where = query.data.provincia ? { provincia: query.data.provincia as never } : {};

    const [data, total] = await Promise.all([
      prisma.separador.findMany({ where, ...toSkipTake(query.data), orderBy: { registradoEn: "desc" } }),
      prisma.separador.count({ where }),
    ]);

    return paginatedResponse(data, total, query.data);
  });

  app.get<{ Params: { wallet: string } }>("/separadores/:wallet", async (request, reply) => {
    let wallet: string;
    try {
      wallet = ethers.getAddress(request.params.wallet);
    } catch {
      return reply.badRequest("Direccion invalida");
    }

    const separador = await prisma.separador.findUnique({ where: { wallet } });
    if (!separador) return reply.notFound("Separador no encontrado");
    return separador;
  });
}
