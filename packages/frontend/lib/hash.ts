import { keccak256, toBytes } from "viem";

/**
 * Calcula el hash keccak256 de un valor sensible (cedula, nombre, etc.) en el cliente.
 * El valor real (ej. numero de cedula) nunca debe viajar al backend ni a la chain,
 * solo este hash bytes32.
 */
export function hashValue(value: string): `0x${string}` {
  return keccak256(toBytes(value.trim()));
}
