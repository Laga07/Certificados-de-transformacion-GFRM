import type { FastifyInstance } from "fastify";
import { ethers } from "ethers";
import { prisma } from "../lib/prisma.js";

export async function walletsRoutes(app: FastifyInstance) {
  app.get<{ Params: { address: string } }>("/wallets/:address/resumen", async (request, reply) => {
    let wallet: string;
    try {
      wallet = ethers.getAddress(request.params.address);
    } catch {
      return reply.badRequest("Direccion invalida");
    }

    const where = { OR: [{ origen: wallet }, { destino: wallet }] };

    const [totales, porTipoPlastico] = await prisma.$transaction([
      prisma.transaccion.aggregate({
        where,
        _count: { _all: true },
        _sum: { pesoGramos: true, tokensMinteados: true },
      }),
      prisma.transaccion.groupBy({
        where,
        by: ["tipoPlastico"],
        _count: { _all: true },
        _sum: { pesoGramos: true },
      }),
    ]);

    return {
      wallet,
      totales: {
        transacciones: totales._count._all,
        pesoGramosTotal: totales._sum.pesoGramos?.toString() ?? "0",
        tokensMinteadosTotal: totales._sum.tokensMinteados?.toString() ?? "0",
      },
      porTipoPlastico: porTipoPlastico
        .filter((row) => row._count._all > 0)
        .map((row) => ({
          tipoPlastico: row.tipoPlastico,
          transacciones: row._count._all,
          pesoGramosTotal: row._sum.pesoGramos?.toString() ?? "0",
        })),
    };
  });
}
