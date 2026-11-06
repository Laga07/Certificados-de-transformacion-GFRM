import { parseGwei } from "viem";

/**
 * Polygon (Amoy y mainnet) rechaza transacciones con una propina (priority fee) por debajo
 * de un minimo de red (~25 gwei) -- MetaMask a veces propone menos, y la red la rechaza antes
 * de intentarla ("gas tip cap ... below minimum"), sin que sea un revert del contrato.
 *
 * No alcanza con configurar esto a nivel de chain en wagmi (ver lib/wagmi.ts): para una wallet
 * inyectada, viem le delega el calculo de gas entero a la wallet y nunca aplica el default de
 * la chain. La unica forma confiable es pasar el fee explicito en cada escritura, para que
 * MetaMask lo use en vez de su propio estimado.
 *
 * Se sobreescribe el priority fee (y un techo de maxFeePerGas generoso, EIP-1559 devuelve lo
 * que no se gasta).
 *
 * `gas` (limite, no precio) tambien se fija explicito: dejarlo en manos de la estimacion
 * automatica (eth_estimateGas) significa confiar en el RPC que la wallet tenga configurado
 * en ese momento -- y no todos estiman igual. Con dRPC se vio un estimado de 49,000,000 para
 * una escritura comun del contrato heredado (que en la practica gastaba unos cientos de
 * miles), superando el tope del nodo (33,554,432) y tumbando la transaccion antes de
 * intentarla. 3,000,000 queda comodo bajo ese tope y da margen a las funciones que iteran
 * sobre listas de tamaño variable (comprarCertificado recorre separadores + eslabones de
 * una emision, consumirParaTransformacion recorre los lotes consumidos).
 */
export const GAS_FEE_OVERRIDES = {
  maxPriorityFeePerGas: parseGwei("30"),
  maxFeePerGas: parseGwei("100"),
  gas: BigInt(3_000_000),
} as const;
