import { parseGwei } from "viem";

/**
 * Parametros de gas para las escrituras on-chain. Los usa lib/useEscribir.ts, que es el unico
 * camino por el que el sitio manda transacciones.
 *
 * Limite de gas: ya NO es fijo. Antes se mandaban siempre 3,000,000 (porque la estimacion del
 * RPC que tenia MetaMask, dRPC, devolvia valores absurdos como 49M). Pero 3M no alcanza para
 * operaciones sobre lotes grandes: medido en packages/contracts/test/Gas.test.ts, transformar un
 * lote de 60 separadores usa ~7.8M y dividirlo ~10.4M. Ahora se estima con el RPC del propio
 * sitio (publicnode) y se le suma MARGEN_GAS_PORCENTAJE. Ademas un limite fijo alto obligaria
 * a cada usuario a tener POL de sobra: la wallet exige saldo para limite x precio maximo.
 *
 * Propina (priority fee): Polygon rechaza transacciones con propina menor a ~25 gwei ("gas tip
 * cap below minimum") y MetaMask a veces propone menos. Se fuerza un piso.
 */
export const PROPINA_MINIMA = parseGwei("30");
export const MARGEN_GAS_PORCENTAJE = 30;
// Techo absoluto: el tope por transaccion de EIP-7825 es 2^24 (~16.7M). El contrato limita
// los lotes (60 separadores) para que ninguna operacion se acerque a esto.
export const GAS_MAXIMO = BigInt(16_000_000);

// Respaldo si la consulta de precios al RPC falla: los valores fijos que se usaban antes.
export const FEES_RESPALDO = {
  maxPriorityFeePerGas: PROPINA_MINIMA,
  maxFeePerGas: parseGwei("100"),
} as const;
