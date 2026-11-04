import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";
import { getIndexedContracts, getProvider, loadDeployment } from "../lib/contracts.js";
import { syncOnce } from "./sync.js";

const POLL_INTERVAL_MS = 8_000;
const CONFIRMATIONS = Number(process.env.INDEXER_CONFIRMATIONS ?? 5);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const provider = getProvider();
  const contracts = await getIndexedContracts(provider);
  const deployment = await loadDeployment();

  const startBlock = Number(process.env.INDEXER_START_BLOCK ?? deployment.startBlock ?? 0);

  logger.info(
    { network: deployment.network, chainId: deployment.chainId, startBlock, CONFIRMATIONS },
    "Indexer iniciado",
  );

  // Loop infinito: en produccion se correria como proceso de larga duracion (pm2, systemd, contenedor, etc.)
  while (true) {
    try {
      const result = await syncOnce(prisma, provider, contracts, {
        confirmations: CONFIRMATIONS,
        startBlock,
      });

      if (result.eventsProcesados > 0) {
        logger.info(result, "Bloques sincronizados");
      } else {
        logger.debug(result, "Sin eventos nuevos");
      }
    } catch (error) {
      logger.error({ error }, "Error durante la sincronizacion; se reintentara en el proximo ciclo");
    }

    await sleep(POLL_INTERVAL_MS);
  }
}

main().catch((error) => {
  logger.error({ error }, "Fallo fatal del indexer");
  process.exitCode = 1;
});
