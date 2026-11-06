import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function statsRoutes(app: FastifyInstance) {
  app.get("/stats", async () => {
    const [
      totalSeparadores,
      totalIntermediarios,
      totalIntermediariosVerificados,
      totalTransformadores,
      totalTransformadoresVerificados,
      totalCompradores,
      totalLotes,
      totalEntregas,
      totalEmisiones,
      totalVentas,
      porMaterial,
    ] = await prisma.$transaction([
      prisma.separador.count(),
      prisma.intermediario.count(),
      prisma.intermediario.count({ where: { verificado: true } }),
      prisma.transformador.count(),
      prisma.transformador.count({ where: { verificado: true } }),
      prisma.comprador.count(),
      prisma.lote.count(),
      prisma.entrega.count(),
      prisma.emision.count(),
      prisma.ventaPrimaria.count(),
      prisma.emision.groupBy({
        by: ["material"],
        _sum: { kgTransformadosOriginal: true },
        _count: { _all: true },
      }),
    ]);

    return {
      totales: {
        separadores: totalSeparadores,
        intermediarios: totalIntermediarios,
        intermediariosVerificados: totalIntermediariosVerificados,
        transformadores: totalTransformadores,
        transformadoresVerificados: totalTransformadoresVerificados,
        compradores: totalCompradores,
        lotes: totalLotes,
        entregas: totalEntregas,
        emisiones: totalEmisiones,
        ventas: totalVentas,
      },
      porMaterial: porMaterial.map((row) => ({
        material: row.material,
        emisiones: row._count._all,
        kgTransformadosTotal: row._sum.kgTransformadosOriginal?.toString() ?? "0",
      })),
    };
  });

  // Estadisticas por provincia/canton para el mapa del dashboard -- el peso separado se
  // atribuye a la residencia del Separador que entrego el material (origen de la entrega).
  app.get("/stats/geografia", async () => {
    const [separadoresPorCanton, intermediariosPorCanton, pesoPorCanton] = await Promise.all([
      prisma.separador.groupBy({ by: ["provincia", "cantonId"], _count: { _all: true } }),
      prisma.intermediario.groupBy({
        by: ["provincia", "cantonId"],
        where: { verificado: true },
        _count: { _all: true },
      }),
      prisma.$queryRaw<{ provincia: string; cantonId: number; pesoGramosTotal: string | null }[]>`
        SELECT s.provincia as "provincia", s."cantonId" as "cantonId",
               SUM(e."pesoGramos")::text as "pesoGramosTotal"
        FROM entregas e
        JOIN separadores s ON s.wallet = e."separadorWallet"
        GROUP BY s.provincia, s."cantonId"
      `,
    ]);

    interface Fila {
      provincia: string;
      cantonId: number;
      separadores: number;
      intermediariosVerificados: number;
      pesoGramosTotal: string;
    }

    const porCanton = new Map<string, Fila>();
    function obtener(provincia: string, cantonId: number): Fila {
      const clave = `${provincia}-${cantonId}`;
      let fila = porCanton.get(clave);
      if (!fila) {
        fila = { provincia, cantonId, separadores: 0, intermediariosVerificados: 0, pesoGramosTotal: "0" };
        porCanton.set(clave, fila);
      }
      return fila;
    }

    for (const row of separadoresPorCanton) {
      obtener(row.provincia, row.cantonId).separadores = row._count._all;
    }
    for (const row of intermediariosPorCanton) {
      obtener(row.provincia, row.cantonId).intermediariosVerificados = row._count._all;
    }
    for (const row of pesoPorCanton) {
      obtener(row.provincia, row.cantonId).pesoGramosTotal = row.pesoGramosTotal ?? "0";
    }

    return { data: Array.from(porCanton.values()) };
  });
}
