# DAPP Certificado de Transformación

DApp de Green Foot para trazabilidad multi-material de residuos valorizables en Costa Rica,
que concluye el ciclo con la emisión de un **Certificado de Transformación** (token ERC20,
1 = 1 kg efectivamente transformado) sobre **Polygon Amoy testnet**.

> Nació el 2026-11-03 como copia de trabajo de [`DAPP Plástico Tesis`](../GreenMaterialsDAPP)
> (el entregable de la tesis de economía, congelado y sin tocar). Son dos proyectos
> **totalmente separados**: carpetas, repos, contratos y base de datos propios — ni siquiera
> comparten el servidor de PostgreSQL. Ver `docs/arquitectura-certificado-transformacion.md`
> para el diseño completo del contrato.

## Estado

- **Contratos**: Fase 1 completa y desplegada en Amoy — `RegistroEntidades`, `TokenCustodia`,
  `CertificadoTransformacion`, `MercadoCertificados`. Compilan limpio, 46/46 tests pasando
  (incluye una regresión que reproduce el ejemplo numérico exacto del documento de
  arquitectura). Direcciones reales en `packages/contracts/deployments/amoy.json`. Incluye
  gobernanza operativa: desactivar/reactivar entidades, revocar verificaciones,
  `setPlataforma` y rescate del remanente no acreditado.
- **Backend**: schema de Prisma + indexer + API reescritos contra los contratos nuevos,
  corriendo contra datos reales de Amoy. Typecheck y lint limpios.
- **Frontend**: reconstruido contra los contratos nuevos (los 5 roles, entregas, traspasos,
  transformación, compra de certificado). Typecheck y lint limpios, probado end-to-end.
- **Camino a producción**: ver `docs/plan-produccion.md` — revisión completa, lista de
  tareas por prioridad y orden de sprints. Es el documento que gobierna qué sigue.

## Operación de los contratos

```bash
# Separar llaves operativas de la llave admin (plan de produccion, A5). Idempotente.
VERIFIER_WALLET=0x... PAUSER_WALLET=0x... PLATAFORMA_WALLET=0x... \
  npx hardhat run scripts/grant-roles.ts --network amoy        # desde packages/contracts

# Subir una implementacion nueva a un proxy UUPS (la direccion publica no cambia)
CONTRACT=MercadoCertificados npx hardhat run scripts/upgrade.ts --network amoy

# Verificar el codigo en Polygonscan (requiere ETHERSCAN_API_KEY en packages/contracts/.env)
npx hardhat verify --network amoy <direccion>
```

Después de cualquier deploy o upgrade: `npm run contracts:export && npm run frontend:generate`.
Si el deploy es completo (direcciones nuevas), además hay que vaciar las tablas indexadas
(`npm run backend:reset-indexed`, con indexer y API detenidos; conserva las cuentas de usuario)
y poner el `startBlock` nuevo en `INDEXER_START_BLOCK` de `packages/backend/.env` — la base de
datos refleja UNA instancia de los contratos; mezclar dos deploys en la misma DB corrompe los
ids de lote y emisión.

## Arquitectura

```
                         ┌─────────────────────┐
                         │   Polygon Amoy       │
                         │   (contratos UUPS)    │
                         └──────────┬───────────┘
                                    │ eventos (logs)
                                    ▼
┌──────────────┐          ┌──────────────────┐          ┌──────────────────┐
│   Frontend    │  REST    │   Backend         │  Prisma  │   PostgreSQL      │
│   Next.js     │◄────────►│   Fastify API     │◄────────►│   (instancia      │
│   (wagmi +    │          │   + Indexer       │          │   nativa propia)  │
│   RainbowKit) │          │   (ethers.js)     │          │                   │
└───────┬───────┘          └──────────────────┘          └──────────────────┘
        │ lecturas directas (wagmi/viem)
        └─────────────────────────────────────► Polygon Amoy
```

- **`packages/contracts`** — Hardhat 3, contratos upgradeables UUPS (`RegistroEntidades`,
  `TokenCustodia`, `MercadoCertificados`) + `CertificadoTransformacion` (implementación
  clonada vía EIP-1167, una vez por material) + `MockUSDT`.
- **`packages/backend`** — Node.js/TypeScript. Indexer (`src/indexer`) + API REST (Fastify)
  sobre Postgres vía Prisma.
- **`packages/frontend`** — Next.js (App Router) + Tailwind + wagmi/RainbowKit.

## Puertos — separados a propósito de DAPP Plástico Tesis

Los dos proyectos comparten el mismo stack (Next.js + Fastify), así que por *default* usan
los mismos puertos (3000/4000). Para poder correr ambos al mismo tiempo sin que choquen, este
proyecto usa puertos propios en todas partes:

| | DAPP Plástico Tesis | **Este proyecto** |
|---|---|---|
| Frontend | `3000` | **`3001`** |
| API | `4000` | **`4001`** |
| PostgreSQL | `5432` (proceso nativo propio) | **`5433`** (otro proceso nativo, totalmente aparte) |

Si alguna vez `curl localhost:3000` o `:4000` responde con algo de este proyecto, algo quedó
mal configurado — ver `packages/frontend/package.json` (`dev`/`start` con `-p 3001`) y
`PORT`/`NEXT_PUBLIC_API_URL` en los `.env`.

## Requisitos

- Node.js 22+
- PostgreSQL 18 instalado en la máquina (sin Docker — ver "Base de datos" abajo). Si tenés
  Docker Desktop, `docker-compose.yml` es una alternativa válida.
- Una wallet de testnet con POL de Amoy (faucet: https://faucet.polygon.technology, red "Polygon Amoy")
- Opcional: cuenta gratuita en [WalletConnect Cloud](https://cloud.walletconnect.com) para el
  `projectId` de RainbowKit

## Base de datos

Esta máquina no tiene Docker Desktop instalado. En vez de un contenedor, el proyecto corre su
**propia instancia nativa de PostgreSQL** — proceso, carpeta de datos (`.pgdata/`, nunca se
trackea) y puerto (5433) completamente separados de cualquier otro proyecto en la máquina,
usando los mismos binarios de PostgreSQL ya instalados (`C:\Program Files\PostgreSQL\18\bin`).

```bash
npm run db:up      # arranca la instancia (scripts/db.mjs)
npm run db:status  # confirma que esta corriendo
npm run db:down    # la detiene
```

La primera vez hay que crearla (ya hecho en este checkout, documentado por si hace falta
recrearla en otra máquina):

```powershell
& "C:\Program Files\PostgreSQL\18\bin\initdb.exe" -D .pgdata -U postgres --pwfile=<archivo-con-password>
# editar .pgdata/postgresql.conf: port = 5433
npm run db:up
& "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres -p 5433 -h localhost certificado_transformacion
```

## Arranque desde cero

```bash
# 1. Instalar dependencias de los 3 workspaces
npm install

# 2. Levantar PostgreSQL (ver seccion de arriba)
npm run db:up

# 3. Configurar variables de entorno copiando cada .env.example
cp packages/contracts/.env.example packages/contracts/.env
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.local.example packages/frontend/.env.local
# -> packages/backend/.env: DATABASE_URL ya apunta al puerto 5433 en este checkout

# 4. Compilar y probar los contratos
npm run contracts:compile
npm run contracts:test

# 5. Desplegar a Polygon Amoy (requiere AMOY_RPC_URL y DEPLOYER_PRIVATE_KEY en packages/contracts/.env)
npm run contracts:deploy:amoy

# 6. Exportar ABIs + direcciones para backend/frontend
npm run contracts:export

# 7. Migrar la base de datos
npm run backend:migrate

# 8. Generar los hooks tipados de wagmi para el frontend
npm run frontend:generate

# 9. Levantar todo (API + indexer + frontend) en paralelo
npm run dev
```

## Variables de entorno

| Archivo | Variable | Descripción |
|---|---|---|
| `packages/contracts/.env` | `AMOY_RPC_URL` | RPC de Polygon Amoy para deploys. publicnode (`https://polygon-amoy-bor-rpc.publicnode.com`) es el más estable medido desde esta máquina; dRPC gratis da 408 intermitentes en `eth_estimateGas` de creación de contratos; `rpc-amoy.polygon.technology` no resuelve DNS aquí |
| | `DEPLOYER_PRIVATE_KEY` | Clave privada de una wallet **exclusiva para testnet** |
| `packages/backend/.env` | `DATABASE_URL` | Apunta a `localhost:5433` (instancia propia, ver arriba) |
| | `NETWORK_NAME` | `amoy` por default |
| | `AMOY_RPC_URL` | dRPC, igual que en contracts |
| | `INDEXER_BLOCK_WINDOW` | **50** — el límite real de dRPC gratis para `eth_getLogs` con filtro de address, no los 10,000 que dice su propio mensaje de error (ver comentario en `sync.ts`) |
| | `PORT` | **4001** (no 4000 — ver tabla de puertos arriba) |
| `packages/frontend/.env.local` | `NEXT_PUBLIC_API_URL` | `http://localhost:4001` |

## Notas de seguridad del contrato

- Reentrancy guard en toda función que mueve fondos/tokens.
- Una wallet = un solo rol — evita autoasignación en ambos extremos de una operación.
- `pause()/unpause()` en los tres contratos UUPS, para poder congelar ante un incidente.
- La plataforma no custodia fondos de terceros: el reparto de cada venta se acredita a un
  ledger de saldos pendientes (patrón `PaymentSplitter`) con retiro permissionless, en vez de
  empujar USDT a cada destinatario dentro de la misma venta — ver sección 2.3 de
  `docs/arquitectura-certificado-transformacion.md` para el razonamiento completo.
- Antes de manejar fondos reales: rol admin/upgrader en multisig, auditoría externa.
