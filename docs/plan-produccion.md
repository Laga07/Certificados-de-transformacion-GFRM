# Plan de salida a producción — DAPP Certificado de Transformación

Revisión hecha el 2026-11-12 sobre el commit `0c07318`. Objetivo: dejar el sistema listo
para público real **sobre Polygon Amoy (testnet)**, con dominio y servidores propios, de modo
que el paso a mainnet sea solo un redeploy de contratos y un cambio de `.env`.

Convención: **[B]** = bloqueante para abrir al público, **[M]** = necesario antes de mainnet,
**[R]** = recomendado / calidad.

---

## 0. Diagnóstico en una página

**Lo que ya está bien hecho** (no tocar sin motivo):

- Contratos con patrón sólido: UUPS + `Pausable` + reentrancy guard, custodia ERC-1155 no
  transferible, certificados ERC-20 clonados por material, reparto no custodial con ledger +
  retiro permissionless, invariante `totalAcreditado <= valorTotal`. 39 tests que incluyen la
  Tabla 12 exacta del documento y los dos casos borde de merma.
- Indexer con ventana configurable, reintentos, detección de reorg y progreso persistido por
  ventana. API REST paginada con validación `zod`.
- Separación real del proyecto de tesis: carpeta, DB, puertos.
- Gate de sesión (email + contraseña) antes de cualquier página.

**Lo que impide abrirlo al público hoy** (detalle en las secciones siguientes):

1. La portada, el footer y varios textos siguen siendo los de la tesis: enlaces a rutas que
   no existen (`/transacciones/*`, `/registro/usuario`), "Token PLST", "GreenMaterialsDAPP".
2. No existe el repo en GitHub (`git remote -v` está vacío). Todo el código vive en una sola
   máquina; el CI nunca ha corrido.
3. El verificador aprueba intermediarios y transformadores **a ciegas**: el panel solo muestra
   wallet y `nombreHash`. No hay dónde guardar razón social, cédula jurídica, contacto ni
   documentos. Sin eso no se puede operar con terceros reales.
4. Las cuentas no tienen rol: cualquier persona logueada ve `/admin`; no hay verificación de
   correo, ni recuperar contraseña, ni vínculo cuenta ↔ wallet.
5. El hash de cédula (`keccak256(cédula)`) se revierte por fuerza bruta en segundos (espacio
   de ~10^9 valores). Publicado en una cadena pública equivale a publicar las cédulas.
6. Todo corre en tu PC: no hay dominio, TLS, supervisor de procesos ni backups.
7. La API está abierta sin rate limit ni CORS restringido; `/api/auth/register` se puede
   inundar con cuentas.

---

## A. Contratos

| # | Prioridad | Qué | Dónde |
|---|---|---|---|
| A1 | [M] | `plataforma` se fija en `initialize` y no tiene setter. Agregar `setPlataforma(address)` (solo admin, con evento) para poder apuntar a un Safe sin redeploy. | `MercadoCertificados.sol` |
| A2 | [B] | No hay revocación: `activo` nunca pasa a `false` y no existe `desverificar*`. Un intermediario fraudulento no se puede sacar del sistema. Agregar `desactivarSeparador/Intermediario/Transformador/Comprador` y `revocarVerificacion*` (VERIFIER_ROLE), con eventos, y reflejarlo en indexer + frontend. | `RegistroEntidades.sol` |
| A3 | [M] | Loops sin tope: `_repartirVenta` recorre todos los separadores de la emisión y `_fusionarAportesYMerma` todos los de cada lote. Una ruta municipal con cientos de separadores puede superar el gas (el frontend fija 3,000,000). Opciones: (a) tope de separadores distintos por lote validado en `registrarEntrega`/`unirLotes` (p. ej. 150) y documentarlo; (b) reparto por Merkle con reclamo. Escribir un test de gas con N=100/200/400 separadores para fijar el límite con datos. | `MercadoCertificados.sol`, `TokenCustodia.sol` |
| A4 | [M] | Remanente huérfano: en el caso extremo de merma el contrato se queda con USDT sin acreditar a nadie (comentado en `_repartirVenta`). Agregar contabilidad explícita (`remanenteNoAcreditado`) y una función admin para rescatarlo, para que nunca quede atrapado. | `MercadoCertificados.sol` |
| A5 | [B] | Separar llaves. Hoy una sola EOA es admin, upgrader, pauser, verificador, `plataforma` y owner de MockUSDT. Mínimo ya: `VERIFIER_ROLE` a una wallet operativa distinta y `PAUSER_ROLE` a otra. Antes de mainnet: `DEFAULT_ADMIN_ROLE` y `plataforma` en un Safe (Gnosis Safe funciona en Amoy y en Polygon). | `scripts/deploy.ts`, nuevo `scripts/grant-roles.ts` |
| A6 | [M] | La clave del deployer actual se pegó en un chat: tratarla como comprometida. Sirve para testnet; **nunca** reutilizarla en mainnet. Generar la wallet de mainnet en hardware o directamente como Safe. | `.env` |
| A7 | [B] | Verificar los contratos en Polygonscan (`hardhat verify`, ya está configurado; falta `ETHERSCAN_API_KEY`). Sin esto nadie puede leer el código desde el explorador y la confianza del comprador cae. | `hardhat.config.ts` |
| A8 | [M] | Análisis estático con Slither (gratis) y, antes de mainnet, auditoría externa (presupuestar). | CI |
| A9 | [R] | Tests que faltan: `validateUpgrade` de OpenZeppelin para los 3 proxies, cada función bajo `pause()`, snapshot de gas, y el test de N separadores de A3. | `test/` |
| A10 | [R] | `registrarTransformacion` no lleva `nonReentrant` (TokenCustodia es de confianza, pero conviene por consistencia). | `MercadoCertificados.sol` |
| A11 | [B] | Limpiar scripts heredados de la tesis que referencian `TransaccionesPlastico` (`smoke-interactions.ts`, `upgrade-transacciones.ts`, `verify-centro.ts`) y crear `upgrade-<contrato>.ts` para los 3 proxies nuevos. También `types/ethers-contracts/PlasticExchange.sol/*` (regenerar con `compile`). | `scripts/` |
| A12 | [M] | Plan de mainnet: USDT real de Polygon PoS (6 decimales, igual que el mock; confirmar la dirección oficial en Polygonscan/Tether antes de pasarla a `initialize`), `deployments/polygon.json` nuevo, `startBlock` nuevo, indexer con `NETWORK_NAME=polygon`. | `deploy.ts`, `.env` |

## B. Backend (API + indexer)

| # | Prioridad | Qué |
|---|---|---|
| B1 | [B] | No hay build de producción: solo `tsx watch`. Agregar `build` (`tsc` → `dist/`), `start:api`, `start:indexer`, y usar `prisma migrate deploy` (no `migrate dev`) en el servidor. |
| B2 | [B] | Seguridad HTTP: `@fastify/rate-limit` (global + más estricto en `/auth/*`), `@fastify/helmet`, CORS con lista explícita de orígenes (`https://app.<dominio>`), Swagger solo en desarrollo o detrás de auth. |
| B3 | [B] | Cuentas: verificación de correo, recuperación de contraseña, campo `rol` (`USER`/`ADMIN`) en `Account`, bloqueo tras N intentos fallidos. Endpoints de admin protegidos con JWT + rol. |
| B4 | [B] | Vínculo cuenta ↔ wallet con **SIWE** (Sign-In With Ethereum): la wallet firma un mensaje y queda asociada a la cuenta. Sin esto no hay forma de saber qué persona está detrás de qué dirección. |
| B5 | [B] | Perfil off-chain de entidades (resuelve el punto 3 del diagnóstico): tabla `EntidadPerfil` {wallet, tipo, razón social, cédula física/jurídica, teléfono, correo, dirección, documentos adjuntos (almacenados en Cloudflare R2 o similar), estado de revisión, notas del verificador}. El formulario de registro guarda esto en la API **antes** de la transacción on-chain; el panel de admin lo muestra junto al botón "Verificar". |
| B6 | [B] | Hash de identidad con sal secreta: la API expone `POST /identidad/hash` que devuelve `HMAC-SHA256(pepper, cédula normalizada)` (o keccak sobre eso) y el frontend manda **ese** valor al contrato. Así la cadena sigue sin exponer cédulas aunque alguien las enumere. (Los registros actuales en Amoy usan el hash débil; al redeploy quedan atrás.) |
| B7 | [M] | Indexer: pasar a un RPC con mejor cuota (Alchemy free tier permite `eth_getLogs` de hasta 2,000 bloques → `INDEXER_BLOCK_WINDOW=2000`, backfill ~40× más rápido). Medir el límite real antes de fijarlo, como ya se hizo con dRPC. |
| B8 | [M] | Reorgs: el rollback borra filas creadas después del bloque de corte, pero no revierte actualizaciones in-place (p. ej. `custodioActual` de un lote creado antes). Con `INDEXER_CONFIRMATIONS=5` en Polygon el riesgo es bajo; subirlo a 10–15 en mainnet y documentar la limitación. |
| B9 | [R] | Logger: `pino-pretty` solo en desarrollo; JSON plano en producción (para que Grafana/Loki o el propio `docker logs` lo entiendan). |
| B10 | [R] | Tests de backend: hoy hay cero. Mínimo: handlers de `CertificadoComprado`/`PagoAcreditado` y `RecepcionConfirmada` contra una DB de prueba. |
| B11 | [R] | `/api/health` crea un `JsonRpcProvider` por request; reutilizar uno. Exponer también `blocksBehind` como métrica para alertar. |
| B12 | [B] | Backups automáticos de Postgres (`pg_dump` diario a R2/B2) y **probar un restore** una vez. |

## C. Frontend

| # | Prioridad | Qué |
|---|---|---|
| C1 | [B] | Portada nueva para este producto (hoy `app/page.tsx` es la de la tesis con enlaces rotos). Footer (`GreenMaterialsDAPP`), `metadata`, `appName` de wagmi, favicon y OG image. |
| C2 | [B] | Páginas `error.tsx`, `not-found.tsx` y `loading.tsx` (hoy un error en cualquier página muestra la pantalla por defecto de Next). |
| C3 | [B] | Mercado real: listado de emisiones disponibles con material, kg disponibles, precio y botón "Comprar" (hoy hay que teclear el id de emisión a mano). La API `/api/emisiones` ya existe. |
| C4 | [B] | "Mis lotes": tabla de lotes donde la wallet es custodio + traspasos pendientes de confirmar, con acciones directas (declarar envío, confirmar, unir, dividir, transformar). Hoy hay que teclear ids de lote en todos los formularios. La API `/api/lotes` ya existe y el frontend no la usa. |
| C5 | [B] | Registrar entrega buscando al separador por cédula o QR (depende de B5), no pegando `0x...`. |
| C6 | [B] | Selector de cantón real (los 84 cantones por provincia) en vez de "ID numérico". |
| C7 | [B] | Faucet dentro de la app para testnet: botón "Obtener USDT de prueba" (`MockUSDT.faucet` es público) y enlace al faucet de POL. Hoy el texto dice "pedile la dirección a quien maneja el proyecto". |
| C8 | [B] | Ocultar "Administración" en el menú y proteger `/admin` por rol de cuenta (B3) además del gate on-chain. |
| C9 | [B] | Páginas legales: Términos de uso, Política de privacidad (Ley 8968 de Costa Rica), aviso permanente de "red de prueba, sin valor económico" mientras esté en Amoy. |
| C10 | [B] | Onboarding para personas no técnicas: guía de instalar MetaMask, agregar Amoy y conseguir POL. A mediano plazo, wallet embebida (Privy, Web3Auth o Coinbase Smart Wallet) para que un separador no necesite MetaMask. |
| C11 | [R] | Monitoreo de errores (Sentry, plan gratuito) y analítica ligera (Umami o Plausible). |
| C12 | [R] | Revisión en móvil de todos los formularios y accesibilidad básica (labels, foco, contraste). |
| C13 | [R] | Tres archivos siguen con fallback `http://localhost:4000` para `NEXT_PUBLIC_API_URL`; cambiar a 4001 o fallar en voz alta si la variable no está. |

## D. Infraestructura (comprar y montar ya, aunque siga en testnet)

Presupuesto objetivo: **USD 10–15 / mes** + dominio.

| Pieza | Recomendación | Costo aprox. |
|---|---|---|
| Dominio | `.com` en Cloudflare Registrar (precio de costo) o Namecheap. Opcional `.cr` por NIC.cr como redirección (más caro). | 10–15 USD/año (`.cr` 40–60) |
| DNS + TLS + WAF | Cloudflare (plan gratuito, proxy naranja). Subdominios: `app.`, `api.`, y `testnet.` mientras dure Amoy. | 0 |
| Servidor | **1 VPS**: Hetzner CX22 (2 vCPU, 4 GB, Alemania/EE. UU.) o DigitalOcean Basic 2 GB. Ubuntu 24.04. | 5–12 USD/mes |
| Orquestación | `docker-compose.prod.yml`: `postgres`, `api`, `indexer`, `web` (Next standalone), `caddy` (TLS automático). Un `Dockerfile` por paquete. | 0 |
| Backups | Snapshot del proveedor + `pg_dump` diario a Cloudflare R2 (10 GB gratis). | 0–2 USD/mes |
| RPC | Alchemy (plan gratuito) con una app para Amoy y otra para Polygon mainnet. Alternativa: dRPC de pago. | 0 |
| Correo transaccional | Resend o Brevo (plan gratuito) para verificación y recuperación de contraseña. | 0 |
| Monitoreo | UptimeRobot (web + `/api/health`), Sentry. | 0 |
| WalletConnect | Ya hay `projectId`; registrar el dominio real en la allowlist del proyecto. | 0 |
| CI/CD | GitHub Actions: `npm run ci` en cada PR; en `main`, construir imágenes y desplegar por SSH al VPS. Ambientes `testnet` y `mainnet` separados por `.env` y por archivo de deployment. | 0 |

Alternativa más cómoda y más cara: Vercel Pro (20 USD/mes; el plan Hobby no permite uso
comercial) para el frontend + Railway/Render para API, indexer y Postgres (10–20 USD/mes).
Con el presupuesto indicado, el VPS único es la opción correcta.

## E. Negocio y legal (para "empezar a cobrar")

- **Ingreso on-chain**: el 15 % de cada venta primaria se acredita a `plataforma` en USDT.
  En testnet ese USDT no vale nada; el modelo solo genera ingreso real en mainnet.
- **Cobrar antes de mainnet** solo es posible off-chain: suscripción o cuota a transformadores
  y compradores, cobrada por tarjeta (Tilopay o Stripe) con factura electrónica. Eso requiere
  pasarela, facturación y términos de servicio; decidir si vale la pena antes de mainnet.
- **Entidad y tributación**: sociedad constituida, factura electrónica ante Hacienda,
  tratamiento contable de ingresos en USDT. Consultar contador.
- **Datos personales**: Ley 8968 (Prodhab). Términos y política de privacidad firmados por
  intermediarios y transformadores; consentimiento explícito del separador al registrarse.
- **KYC básico** de compradores y transformadores (razón social, cédula jurídica, representante)
  queda cubierto por B5.
- **Wallet de la empresa** (`plataforma` y admin de contratos) = Safe multisig con 2 de 3 firmas.

## F. Orden sugerido

**Sprint 1 — Fundamentos (≈1 semana)**
1. Crear el repo privado `DAPP-Certificado-Transformacion` en GitHub, `git push`, confirmar CI
   verde.
2. Limpieza de herencia de tesis: portada, footer, `appName`, metadata, scripts (A11, C1).
3. `error.tsx` / `not-found.tsx` / `loading.tsx` (C2); fallbacks de puerto (C13).
4. Contratos: `setPlataforma` (A1), revocación/desactivación (A2), `nonReentrant` (A10),
   tests nuevos (A9), Slither en CI (A8). Redeploy a Amoy, nuevo `startBlock`, reindexar.
5. `hardhat verify` de los 6 contratos + 5 clones (A7).
6. Separar `VERIFIER_ROLE` y `PAUSER_ROLE` a wallets operativas (A5).

**Sprint 2 — Producto (≈2 semanas)**
7. Cuentas: rol, verificación de correo, reset de contraseña, rate limit (B2, B3).
8. SIWE y vínculo wallet (B4).
9. Perfil off-chain + documentos + panel de admin real (B5, C8).
10. Hash con pepper (B6).
11. Catálogo de emisiones (C3), "Mis lotes" (C4), búsqueda de separador (C5), cantones (C6),
    faucet en la app (C7).
12. Legales y aviso de testnet (C9); guía de onboarding (C10).

**Sprint 3 — Infraestructura (≈1 semana)**
13. Comprar dominio, crear VPS, Cloudflare, Dockerfiles, Compose, Caddy (D).
14. Build de producción del backend (B1), logger JSON (B9), Alchemy (B7).
15. Backups + restore probado (B12); UptimeRobot + Sentry (C11).
16. Pipeline de deploy desde `main`.

**Sprint 4 — Endurecimiento pre-mainnet**
17. Safe multisig para admin y `plataforma`; wallet de mainnet nueva (A5, A6).
18. Test de gas con N separadores y decisión de tope (A3); remanente (A4).
19. Auditoría externa; runbook de incidentes (quién pausa, cómo se comunica).
20. Plan de migración: USDT real, `deployments/polygon.json`, indexer `mainnet` (A12).

---

## G. Checklist corta

Avance 2026-11-13 (Sprint 1): repo `Laga07/Certificados-de-transformacion-GFRM` creado y
`main` publicado; contratos con gobernanza redesplegados en Amoy (`startBlock` 52807377) e
indexados desde cero; portada, footer, páginas de error y scripts limpios. Queda del sprint:
CI verde en GitHub (primer run pendiente de revisar), `hardhat verify` (falta
`ETHERSCAN_API_KEY`) y separar `VERIFIER_ROLE`/`PAUSER_ROLE` (faltan las wallets operativas;
el script `grant-roles.ts` ya está).

- [x] Repo en GitHub (CI: revisar el primer run)
- [x] Portada/footer/metadata propios; scripts de tesis eliminados
- [x] `error.tsx`, `not-found.tsx`, `loading.tsx`
- [x] `setPlataforma`, revocación, remanente, tests, redeploy Amoy
- [ ] Slither sin hallazgos altos (job informativo ya en CI); verify en Polygonscan
- [ ] `VERIFIER_ROLE` y `PAUSER_ROLE` en wallets operativas distintas
- [ ] Roles de cuenta, verificación de correo, reset, rate limit, CORS cerrado
- [ ] SIWE + perfil off-chain + panel admin con datos reales
- [ ] Hash de identidad con pepper
- [ ] Catálogo de emisiones, Mis lotes, búsqueda de separador, cantones, faucet
- [ ] Términos, privacidad, aviso testnet, guía de onboarding
- [ ] Dominio + VPS + Docker + Caddy + Cloudflare + backups + monitoreo
- [ ] Alchemy, build de producción, logger JSON, deploy automatizado
- [ ] Safe multisig, wallet nueva, auditoría, plan mainnet
