# Imagen unica del backend: la misma se usa para la API, el indexer y el paso de migraciones
# (cambia solo el comando, ver docker-compose.prod.yml). Contexto de build: raiz del monorepo.

# ---- 1. Dependencias (cache por package-lock) ----
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY packages/backend/package.json packages/backend/
COPY packages/contracts/package.json packages/contracts/
COPY packages/frontend/package.json packages/frontend/
# Solo el workspace del backend (incluye devDependencies: hacen falta tsc y el CLI de Prisma).
RUN npm ci --workspace=packages/backend --include-workspace-root=false --no-audit --no-fund \
  && mkdir -p packages/backend/node_modules
# (npm deja en packages/backend/node_modules solo las versiones que chocan con las de la raiz;
# el mkdir garantiza que la carpeta exista para el COPY del runtime aunque quede vacia.)

# ---- 2. Build ----
FROM deps AS build
WORKDIR /app/packages/backend
COPY packages/backend/ ./
# prisma generate no se conecta a la base, pero prisma.config.ts lee DATABASE_URL.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate \
  && npm run build

# ---- 3. Runtime ----
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates tini \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/packages/backend/node_modules ./packages/backend/node_modules
COPY --from=build /app/packages/backend/dist ./packages/backend/dist
COPY --from=build /app/packages/backend/src/generated ./packages/backend/src/generated
COPY --from=build /app/packages/backend/prisma ./packages/backend/prisma
COPY --from=build /app/packages/backend/prisma.config.ts /app/packages/backend/package.json ./packages/backend/
# ABIs y direcciones desplegadas: el backend las lee de ../contracts (ver src/lib/contracts.ts).
COPY packages/contracts/exported ./packages/contracts/exported
COPY packages/contracts/deployments ./packages/contracts/deployments

WORKDIR /app/packages/backend
RUN mkdir -p /data/uploads && chown -R node:node /data
USER node
ENV UPLOADS_DIR=/data/uploads PORT=4001
EXPOSE 4001
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/index.js"]
