import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function statsRoutes(app: FastifyInstance) {
  app.get("/stats", async () => {
    const [
      totalUsuarios,
      totalCentros,
      totalCentrosVerificados,
      totalMunicipalidades,
      totalTransacciones,
      totalLotes,
      totalLotesCerrados,
      porTipoPlastico,
      porTipoTransaccion,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.collectionCenter.count(),
      prisma.collectionCenter.count({ where: { verificado: true } }),
      prisma.municipality.count(),
      prisma.transaccion.count(),
      prisma.municipalBatch.count(),
      prisma.municipalBatch.count({ where: { cerrado: true } }),
      prisma.transaccion.groupBy({
        by: ["tipoPlastico"],
        _sum: { pesoGramos: true, tokensMinteados: true },
        _count: { _all: true },
      }),
      prisma.transaccion.groupBy({
        by: ["tipo"],
        _count: { _all: true },
      }),
    ]);

    return {
      totales: {
        usuarios: totalUsuarios,
        centros: totalCentros,
        centrosVerificados: totalCentrosVerificados,
        municipalidades: totalMunicipalidades,
        transacciones: totalTransacciones,
        lotes: totalLotes,
        lotesCerrados: totalLotesCerrados,
      },
      porTipoPlastico: porTipoPlastico.map((row) => ({
        tipoPlastico: row.tipoPlastico,
        transacciones: row._count._all,
        pesoGramosTotal: row._sum.pesoGramos?.toString() ?? "0",
        tokensMinteadosTotal: row._sum.tokensMinteados?.toString() ?? "0",
      })),
      porTipoTransaccion: porTipoTransaccion.map((row) => ({
        tipo: row.tipo,
        transacciones: row._count._all,
      })),
    };
  });

  // Estadisticas por provincia/canton para el mapa del dashboard. El peso reciclado se
  // atribuye a la residencia del Usuario que entrego el plastico (origen de la transaccion),
  // no a donde lo recibio el Centro/Municipalidad.
  app.get("/stats/geografia", async () => {
    const [usuariosPorCanton, centrosPorCanton, pesoPorCanton] = await Promise.all([
      prisma.user.groupBy({
        by: ["provincia", "cantonId"],
        _count: { _all: true },
      }),
      prisma.collectionCenter.groupBy({
        by: ["provincia", "cantonId"],
        where: { verificado: true },
        _count: { _all: true },
      }),
      prisma.$queryRaw<{ provincia: string; cantonId: number; pesoGramosTotal: string | null }[]>`
        SELECT u.provincia as "provincia", u."cantonId" as "cantonId",
               SUM(t."pesoGramos")::text as "pesoGramosTotal"
        FROM transacciones t
        JOIN users u ON u.wallet = t.origen
        GROUP BY u.provincia, u."cantonId"
      `,
    ]);

    interface Fila {
      provincia: string;
      cantonId: number;
      usuarios: number;
      centrosVerificados: number;
      pesoGramosTotal: string;
    }

    const porCanton = new Map<string, Fila>();
    function obtener(provincia: string, cantonId: number): Fila {
      const clave = `${provincia}-${cantonId}`;
      let fila = porCanton.get(clave);
      if (!fila) {
        fila = { provincia, cantonId, usuarios: 0, centrosVerificados: 0, pesoGramosTotal: "0" };
        porCanton.set(clave, fila);
      }
      return fila;
    }

    for (const row of usuariosPorCanton) {
      obtener(row.provincia, row.cantonId).usuarios = row._count._all;
    }
    for (const row of centrosPorCanton) {
      obtener(row.provincia, row.cantonId).centrosVerificados = row._count._all;
    }
    for (const row of pesoPorCanton) {
      obtener(row.provincia, row.cantonId).pesoGramosTotal = row.pesoGramosTotal ?? "0";
    }

    return { data: Array.from(porCanton.values()) };
  });
}
