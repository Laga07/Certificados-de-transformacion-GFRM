import "./lib/bigintJson.js";
import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { logger } from "./lib/logger.js";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { separadoresRoutes } from "./routes/separadores.js";
import { intermediariosRoutes } from "./routes/intermediarios.js";
import { transformadoresRoutes } from "./routes/transformadores.js";
import { compradoresRoutes } from "./routes/compradores.js";
import { lotesRoutes } from "./routes/lotes.js";
import { emisionesRoutes } from "./routes/emisiones.js";
import { walletsRoutes } from "./routes/wallets.js";
import { statsRoutes } from "./routes/stats.js";

const PORT = Number(process.env.PORT ?? 4000);

async function main() {
  const app = Fastify({ loggerInstance: logger });

  await app.register(cors, { origin: true });
  await app.register(sensible);

  await app.register(swagger, {
    openapi: {
      info: {
        title: "DAPP Certificado de Transformacion API",
        description: "API REST de lectura sobre los datos indexados de la DApp (PostgreSQL)",
        version: "0.1.0",
      },
    },
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  await app.register(healthRoutes, { prefix: "/api" });
  await app.register(authRoutes, { prefix: "/api" });
  await app.register(separadoresRoutes, { prefix: "/api" });
  await app.register(intermediariosRoutes, { prefix: "/api" });
  await app.register(transformadoresRoutes, { prefix: "/api" });
  await app.register(compradoresRoutes, { prefix: "/api" });
  await app.register(lotesRoutes, { prefix: "/api" });
  await app.register(emisionesRoutes, { prefix: "/api" });
  await app.register(walletsRoutes, { prefix: "/api" });
  await app.register(statsRoutes, { prefix: "/api" });

  await app.listen({ port: PORT, host: "0.0.0.0" });
  logger.info(`API escuchando en http://localhost:${PORT} (docs en /docs)`);
}

main().catch((error) => {
  logger.error({ error }, "Fallo fatal al iniciar la API");
  process.exitCode = 1;
});
