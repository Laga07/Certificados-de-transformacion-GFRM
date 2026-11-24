import type { FastifyInstance } from "fastify";
import { ethers } from "ethers";
import { prisma } from "../lib/prisma.js";

// Dos endpoints a proposito:
//
// - /health/live: "el proceso de la API responde". Sin base ni RPC. Lo usan el healthcheck de
//   Docker y deploy.sh -- si dependieran del indexer, un RPC caido marcaria la API como
//   enferma, Docker la reiniciaria en bucle y el sitio entero dependeria de un proveedor ajeno.
//
// - /health: estado REAL del sistema, para el monitoreo externo (UptimeRobot). Devuelve 503
//   si la base no responde o si el indexer esta trabado, para que llegue la alerta. Antes
//   devolvia 200 siempre: el 13-16 nov 2026 el indexer quedo 150k bloques atras (dRPC caido)
//   y nada aviso.
const MAX_LAG_BLOCKS = Number(process.env.HEALTH_MAX_LAG_BLOCKS ?? 600); // ~20 min en Polygon (~2 s/bloque)
const MAX_STALE_MS = Number(process.env.HEALTH_MAX_STALE_MINUTES ?? 15) * 60_000;

// Un solo provider reutilizado (antes se creaba uno por request).
let provider: ethers.JsonRpcProvider | null = null;
function getProvider(): ethers.JsonRpcProvider | null {
  const url = process.env.AMOY_RPC_URL;
  if (!url) return null;
  if (!provider) provider = new ethers.JsonRpcProvider(url, undefined, { staticNetwork: true, batchMaxCount: 1 });
  return provider;
}

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health/live", async () => ({ status: "ok" }));

  app.get("/health", async (_request, reply) => {
    let states;
    try {
      states = await prisma.indexerState.findMany();
    } catch {
      return reply.code(503).send({ status: "error", database: "unreachable" });
    }

    let chainHead: number | null = null;
    const rpc = getProvider();
    if (rpc) {
      try {
        chainHead = await rpc.getBlockNumber();
      } catch {
        chainHead = null;
      }
    }

    const ahora = Date.now();
    const indexer = states.map((state) => {
      const blocksBehind = chainHead !== null ? chainHead - Number(state.lastBlockNumber) : null;
      const msDesdeUltimoAvance = ahora - state.updatedAt.getTime();
      return {
        chainId: state.chainId,
        lastBlockNumber: state.lastBlockNumber.toString(),
        updatedAt: state.updatedAt,
        blocksBehind,
        minutosSinAvanzar: Math.floor(msDesdeUltimoAvance / 60_000),
        atrasado: (blocksBehind !== null && blocksBehind > MAX_LAG_BLOCKS) || msDesdeUltimoAvance > MAX_STALE_MS,
      };
    });

    // Sin ningun estado todavia = el indexer nunca arranco (o se reseteo la base).
    const problemas: string[] = [];
    if (indexer.length === 0) problemas.push("indexer sin estado");
    if (indexer.some((i) => i.atrasado)) problemas.push("indexer atrasado");

    const body = {
      status: problemas.length === 0 ? "ok" : "degradado",
      problemas,
      database: "connected",
      indexer,
      chainHead,
      umbrales: { maxBloquesAtraso: MAX_LAG_BLOCKS, maxMinutosSinAvanzar: MAX_STALE_MS / 60_000 },
    };
    return problemas.length === 0 ? body : reply.code(503).send(body);
  });
}
