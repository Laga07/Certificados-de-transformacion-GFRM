# Frontend Next.js en modo standalone. Contexto de build: raiz del monorepo.
#
# OJO: las variables NEXT_PUBLIC_* se "hornean" en el JavaScript del navegador al construir,
# por eso entran como build args y no como variables de entorno del contenedor. Cambiarlas
# requiere reconstruir la imagen. JWT_SECRET y API_INTERNAL_URL si son de runtime.

# ---- 1. Dependencias ----
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/backend/package.json packages/backend/
COPY packages/contracts/package.json packages/contracts/
COPY packages/frontend/package.json packages/frontend/
RUN npm ci --workspace=packages/frontend --include-workspace-root=false --no-audit --no-fund

# ---- 2. Build ----
FROM deps AS build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_AMOY_RPC_URL
ARG NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_AMOY_RPC_URL=$NEXT_PUBLIC_AMOY_RPC_URL \
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=$NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
# Direcciones desplegadas (las lee lib/addresses.server.ts en runtime; el trazado de
# standalone las copia solo).
COPY packages/contracts/deployments ./packages/contracts/deployments
COPY packages/frontend ./packages/frontend
RUN npm run build --workspace=packages/frontend

# ---- 3. Runtime ----
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends tini && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3001 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/packages/frontend/.next/standalone ./
COPY --from=build --chown=node:node /app/packages/frontend/.next/static ./packages/frontend/.next/static
COPY --from=build --chown=node:node /app/packages/frontend/public ./packages/frontend/public
USER node
EXPOSE 3001
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "packages/frontend/server.js"]
