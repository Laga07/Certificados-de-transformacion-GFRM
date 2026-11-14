# Frontend — DAPP Certificado de Transformación

Next.js (App Router) + Tailwind + wagmi/RainbowKit. Ver el README de la raíz del monorepo para
el arranque completo (contratos, base de datos, API e indexer).

```bash
npm run dev          # http://localhost:3001  (no 3000 -- ver tabla de puertos en la raiz)
npm run generate     # regenera lib/generated.ts (hooks de wagmi) desde packages/contracts
npm run typecheck && npm run lint
```

## Convenciones

- Cada página sigue el patrón `page.tsx` (Server Component, lee las direcciones desplegadas
  con `getDeploymentAddresses()`) + `*Form.tsx` (Client Component, usa el hook generado por
  wagmi + `TxButton` + `useTxReceipt`).
- Toda escritura on-chain pasa `GAS_FEE_OVERRIDES` (ver `lib/gasOverrides.ts`): Polygon exige
  una propina mínima que MetaMask a veces subestima.
- Los getters de structs generados por wagmi devuelven tuplas posicionales, no objetos con
  nombre, aunque el ABI nombre cada campo.
- `BigInt(0)` en vez del literal `0n` (el target de TypeScript del proyecto no lo admite).
- La URL de la API sale únicamente de `lib/apiUrl.ts`.
- Datos sensibles (cédula, nombre) nunca viajan en claro a la cadena: se envía un hash
  (`lib/hash.ts`). Pendiente: firmarlo del lado del servidor (plan de producción, B6).
