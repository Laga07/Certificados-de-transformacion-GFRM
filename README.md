# DAPP Certificado de Transformación

DApp de Green Foot para trazabilidad multi-material de residuos valorizables en Costa Rica,
que concluye el ciclo con la emisión de un **Certificado de Transformación** (token ERC20,
1 = 1 kg efectivamente transformado) sobre **Polygon Amoy testnet**.

> **Estado: en diseño.** Este repo nació el 2026-11-03 como copia de trabajo de
> [`DAPP Plástico Tesis`](../GreenMaterialsDAPP) (el entregable de la tesis de economía,
> congelado y sin tocar). Son dos proyectos **totalmente separados**: carpetas, repos, base de
> datos y contratos propios — no comparten nada en runtime.
>
> El contrato heredado (`packages/contracts/contracts/PlasticExchange.sol`) es el de la tesis
> (solo plástico, sin Certificado de Transformación) y sirve de punto de partida, no de
> arquitectura final. El diseño del contrato nuevo — modelo de dos tokens, catálogo de 5
> materiales, los 5 roles de la cadena, reparto no custodial y cascada de merma — está en
> **[`docs/arquitectura-certificado-transformacion.md`](docs/arquitectura-certificado-transformacion.md)**.
> Hasta que ese contrato se escriba y despliegue, el frontend/backend heredados no van a
> funcionar en contra de datos reales de este proyecto.

## Arquitectura (heredada de la base; ver doc de diseño para el estado objetivo)

```
                         ┌─────────────────────┐
                         │   Polygon Amoy       │
                         │   (contratos UUPS)    │
                         └──────────┬───────────┘
                                    │ eventos (logs)
                                    ▼
┌──────────────┐          ┌──────────────────┐          ┌──────────────────┐
│   Frontend    │  REST    │   Backend         │  Prisma  │   PostgreSQL      │
│   Next.js     │◄────────►│   Fastify API     │◄────────►│   (Docker)        │
│   (wagmi +    │          │   + Indexer       │          │                   │
│   RainbowKit) │          │   (ethers.js)     │          │                   │
└───────┬───────┘          └──────────────────┘          └──────────────────┘
        │ lecturas directas (wagmi/viem)
        └─────────────────────────────────────► Polygon Amoy
```

- **`packages/contracts`** — Hardhat 3, contratos upgradeables UUPS. Hoy todavía tiene el set
  heredado de la tesis (`PlasticoToken`, `RegistroEntidades`, `TransaccionesPlastico`,
  `MockUSDT`) — va a ser reemplazado por el diseño de dos tokens (custodia + certificado).
- **`packages/backend`** — Node.js/TypeScript. Indexer (`src/indexer`) + API REST (Fastify)
  sobre Postgres vía Prisma.
- **`packages/frontend`** — Next.js (App Router) + Tailwind + wagmi/RainbowKit.

## Requisitos

- Node.js 22+
- Docker Desktop (para PostgreSQL local — contenedor y puerto propios, ver abajo)
- Una wallet de testnet con POL de Amoy (faucet: https://faucet.polygon.technology, red "Polygon Amoy")
- Opcional: cuenta gratuita en [WalletConnect Cloud](https://cloud.walletconnect.com) para el
  `projectId` de RainbowKit

## Arranque desde cero

```bash
# 1. Instalar dependencias de los 3 workspaces
npm install

# 2. Levantar PostgreSQL (puerto de host 5433 -- distinto al de DAPP Plastico Tesis,
#    para poder correr ambos proyectos al mismo tiempo sin que choquen)
npm run db:up

# 3. Configurar variables de entorno copiando cada .env.example
cp packages/contracts/.env.example packages/contracts/.env
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.local.example packages/frontend/.env.local
# -> editar packages/backend/.env : DATABASE_URL debe apuntar al puerto 5433

# 4-9: igual que antes (compilar/test/deploy/export/migrate/generate/dev) --
# pendiente hasta que el contrato nuevo este escrito (ver docs/arquitectura-certificado-transformacion.md)
```

## Variables de entorno

Misma tabla que la base (ver `docs/arquitectura-certificado-transformacion.md` para lo que
cambia: nuevas direcciones de contrato, posible `USDT_ADDRESS` para el pago del certificado).
Diferencia clave ya aplicada: `packages/backend/.env` → `DATABASE_URL` debe usar el puerto
**5433** (no 5432), y `POSTGRES_DB=certificado_transformacion` (ver `docker-compose.yml`).

## Notas de seguridad del contrato (heredadas, siguen aplicando como principios de diseño)

- Reentrancy guard en toda función que mueve fondos/tokens.
- Una wallet = un solo rol — evita autoasignación en ambos extremos de una transacción.
- `pause()/unpause()` para poder congelar el contrato ante un incidente.
- Antes de manejar fondos reales: rol admin/upgrader en multisig, auditoría externa.
- **Nuevo en este proyecto**: la plataforma no custodia fondos de terceros — el reparto del
  valor del certificado tiene que salir en la misma transacción de la venta (push, no balance
  acumulado). Ver el documento de diseño para el detalle.
