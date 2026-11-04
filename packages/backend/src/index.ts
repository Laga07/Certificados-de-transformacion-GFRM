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
import { usuariosRoutes } from "./routes/usuarios.js";
import { walletsRoutes } from "./routes/wallets.js";
import { centrosRoutes } from "./routes/centros.js";
import { municipalidadesRoutes } from "./routes/municipalidades.js";
import { transaccionesRoutes } from "./routes/transacciones.js";
import { lotesRoutes } from "./routes/lotes.js";
import { statsRoutes } from "./routes/stats.js";

const PORT = Number(process.env.PORT ?? 4000);

async function main() {
  const app = Fastify({ loggerInstance: logger });

  await app.register(cors, { origin: true });
  await app.register(sensible);

  await app.register(swagger, {
    openapi: {
      info: {
        title: "GreenMaterialsDAPP API",
        description: "API REST de lectura sobre los datos indexados de la DApp (PostgreSQL)",
        version: "1.0.0",
      },
    },
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  await app.register(healthRoutes, { prefix: "/api" });
  await app.register(authRoutes, { prefix: "/api" });
  await app.register(usuariosRoutes, { prefix: "/api" });
  await app.register(walletsRoutes, { prefix: "/api" });
  await app.register(centrosRoutes, { prefix: "/api" });
  await app.register(municipalidadesRoutes, { prefix: "/api" });
  await app.register(transaccionesRoutes, { prefix: "/api" });
  await app.register(lotesRoutes, { prefix: "/api" });
  await app.register(statsRoutes, { prefix: "/api" });

  await app.listen({ port: PORT, host: "0.0.0.0" });
  logger.info(`API escuchando en http://localhost:${PORT} (docs en /docs)`);
}

main().catch((error) => {
  logger.error({ error }, "Fallo fatal al iniciar la API");
  process.exitCode = 1;
});
