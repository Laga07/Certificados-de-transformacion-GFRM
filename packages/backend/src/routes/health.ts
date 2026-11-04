import type { FastifyInstance } from "fastify";
import { ethers } from "ethers";
import { prisma } from "../lib/prisma.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    const states = await prisma.indexerState.findMany();

    let chainHead: number | null = null;
    if (process.env.AMOY_RPC_URL) {
      try {
        const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
        chainHead = await provider.getBlockNumber();
      } catch {
        chainHead = null;
      }
    }

    return {
      status: "ok",
      database: "connected",
      indexer: states.map((state) => ({
        chainId: state.chainId,
        lastBlockNumber: state.lastBlockNumber.toString(),
        updatedAt: state.updatedAt,
        blocksBehind:
          chainHead !== null ? chainHead - Number(state.lastBlockNumber) : null,
      })),
      chainHead,
    };
  });
}
