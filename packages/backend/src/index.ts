import "./lib/bigintJson.js";
import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { logger } from "./lib/logger.js";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { perfilRoutes } from "./routes/perfil.js";
import { adminRoutes } from "./routes/admin.js";
import { separadoresRoutes } from "./routes/separadores.js";
import { intermediariosRoutes } from "./routes/intermediarios.js";
import { transformadoresRoutes } from "./routes/transformadores.js";
import { compradoresRoutes } from "./routes/compradores.js";
import { lotesRoutes } from "./routes/lotes.js";
import { emisionesRoutes } from "./routes/emisiones.js";
import { walletsRoutes } from "./routes/wallets.js";
import { statsRoutes } from "./routes/stats.js";
import { declaracionesRoutes } from "./routes/declaraciones.js";

const PORT = Number(process.env.PORT ?? 4001);
const ES_PRODUCCION = process.env.NODE_ENV === "production";

// Origenes permitidos para el navegador. En desarrollo, el frontend local; en produccion,
// SOLO el dominio real (CORS_ORIGINS=https://app.midominio.com,https://midominio.com).
const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? "http://localhost:3001")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

async function main() {
  // trustProxy: detras de Caddy/Cloudflare la IP real viene en X-Forwarded-For; sin esto el
  // rate limit veria una sola IP (la del proxy) para todo el mundo.
  const app = Fastify({ loggerInstance: logger, trustProxy: ES_PRODUCCION });

  app.decorateRequest("account", null);

  await app.register(helmet, {
    // La API no sirve HTML propio (salvo Swagger en desarrollo), asi que una CSP estricta no
    // rompe nada; en desarrollo se relaja para que Swagger UI cargue sus assets.
    contentSecurityPolicy: ES_PRODUCCION ? undefined : false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });
  await app.register(cors, { origin: CORS_ORIGINS, credentials: true });
  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: "1 minute",
    // Las rutas de autenticacion fijan limites mas bajos via config.rateLimit por ruta.
  });
  await app.register(sensible);
  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024, files: 1 } });

  if (!ES_PRODUCCION) {
    await app.register(swagger, {
      openapi: {
        info: {
          title: "DAPP Certificado de Transformacion API",
          description: "API REST de la DApp: datos indexados (lectura publica), cuentas, perfiles y panel admin",
          version: "0.2.0",
        },
      },
    });
    await app.register(swaggerUi, { routePrefix: "/docs" });
  }

  await app.register(healthRoutes, { prefix: "/api" });
  await app.register(authRoutes, { prefix: "/api" });
  await app.register(perfilRoutes, { prefix: "/api" });
  await app.register(adminRoutes, { prefix: "/api" });
  await app.register(separadoresRoutes, { prefix: "/api" });
  await app.register(intermediariosRoutes, { prefix: "/api" });
  await app.register(transformadoresRoutes, { prefix: "/api" });
  await app.register(compradoresRoutes, { prefix: "/api" });
  await app.register(lotesRoutes, { prefix: "/api" });
  await app.register(emisionesRoutes, { prefix: "/api" });
  await app.register(walletsRoutes, { prefix: "/api" });
  await app.register(statsRoutes, { prefix: "/api" });
  await app.register(declaracionesRoutes, { prefix: "/api" });

  await app.listen({ port: PORT, host: "0.0.0.0" });
  logger.info(
    `API escuchando en http://localhost:${PORT}${ES_PRODUCCION ? "" : " (docs en /docs)"} -- CORS: ${CORS_ORIGINS.join(", ")}`,
  );
}

main().catch((error) => {
  logger.error({ error }, "Fallo fatal al iniciar la API");
  process.exitCode = 1;
});
