import type { FastifyInstance } from "fastify";
import { ethers } from "ethers";
import { prisma } from "../lib/prisma.js";

export async function walletsRoutes(app: FastifyInstance) {
  // Resumen generico de una wallet, sin importar que rol tenga -- util para el perfil del
  // usuario conectado en el frontend. El rol en si (y saldoPendiente) se leen en vivo del
  // contrato (RegistroEntidades.rolDe / MercadoCertificados.saldoPendiente), no de aca.
  app.get<{ Params: { address: string } }>("/wallets/:address/resumen", async (request, reply) => {
    let wallet: string;
    try {
      wallet = ethers.getAddress(request.params.address);
    } catch {
      return reply.badRequest("Direccion invalida");
    }

    const [
      entregasHechas,
      entregasRecibidas,
      pagosAcreditados,
      pagosRetirados,
      ventasCompradas,
      certificadosRetirados,
    ] = await prisma.$transaction([
      prisma.entrega.aggregate({
        where: { separadorWallet: wallet },
        _count: { _all: true },
        _sum: { pesoGramos: true },
      }),
      prisma.entrega.aggregate({
        where: { receptorWallet: wallet },
        _count: { _all: true },
        _sum: { pesoGramos: true },
      }),
      prisma.pagoAcreditado.aggregate({
        where: { destinatario: wallet },
        _count: { _all: true },
        _sum: { monto: true },
      }),
      prisma.pagoRetiro.aggregate({
        where: { destinatario: wallet },
        _count: { _all: true },
        _sum: { monto: true },
      }),
      prisma.ventaPrimaria.aggregate({
        where: { compradorWallet: wallet },
        _count: { _all: true },
        _sum: { cantidadKg: true, valorTotal: true },
      }),
      prisma.certificadoRetiro.aggregate({
        where: { compradorWallet: wallet },
        _count: { _all: true },
        _sum: { cantidadKg: true },
      }),
    ]);

    return {
      wallet,
      comoSeparador: {
        entregas: entregasHechas._count._all,
        pesoGramosTotal: entregasHechas._sum.pesoGramos?.toString() ?? "0",
      },
      comoIntermediarioOTransformador: {
        entregasRecibidas: entregasRecibidas._count._all,
        pesoGramosTotal: entregasRecibidas._sum.pesoGramos?.toString() ?? "0",
      },
      pagos: {
        acreditados: pagosAcreditados._count._all,
        montoAcreditadoTotal: pagosAcreditados._sum.monto?.toString() ?? "0",
        retirados: pagosRetirados._count._all,
        montoRetiradoTotal: pagosRetirados._sum.monto?.toString() ?? "0",
      },
      comoComprador: {
        ventas: ventasCompradas._count._all,
        kgCompradosTotal: ventasCompradas._sum.cantidadKg?.toString() ?? "0",
        valorPagadoTotal: ventasCompradas._sum.valorTotal?.toString() ?? "0",
        certificadosRetirados: certificadosRetirados._count._all,
        kgRetiradosTotal: certificadosRetirados._sum.cantidadKg?.toString() ?? "0",
      },
    };
  });
}
