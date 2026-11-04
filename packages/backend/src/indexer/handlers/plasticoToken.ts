import type { ethers } from "ethers";
import type { prisma as PrismaClientInstance } from "../../lib/prisma.js";

type Prisma = typeof PrismaClientInstance;

export async function handleTokensMinteados(prisma: Prisma, log: ethers.EventLog) {
  const [destinatario, cantidad, transaccionId] = log.args as unknown as [string, bigint, bigint];

  await prisma.tokenMintEvent.upsert({
    where: { txHash_logIndex: { txHash: log.transactionHash, logIndex: log.index } },
    create: {
      destinatario,
      cantidad: cantidad.toString(),
      transaccionId,
      blockNumber: BigInt(log.blockNumber),
      txHash: log.transactionHash,
      logIndex: log.index,
    },
    update: {},
  });
}
