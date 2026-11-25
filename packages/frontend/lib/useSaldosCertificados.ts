"use client";

import { useReadContracts } from "wagmi";
import { certificadoTransformacionAbi } from "@/lib/generated";

const UNIDAD = BigInt("1000000000000000000"); // 1 kg = 1e18 (18 decimales)

/**
 * Saldo de Certificado de Transformacion de una wallet, por material, en kg enteros.
 * Un ERC-20 clonado por material (direcciones en deployments/amoy.json).
 */
export function useSaldosCertificados(direcciones: (`0x${string}` | undefined)[], wallet: `0x${string}` | undefined) {
  const contratos = direcciones.map((address) => ({
    address: address ?? "0x0000000000000000000000000000000000000000",
    abi: certificadoTransformacionAbi,
    functionName: "balanceOf" as const,
    args: [wallet ?? "0x0000000000000000000000000000000000000000"] as const,
  }));

  const lectura = useReadContracts({
    contracts: contratos,
    query: { enabled: Boolean(wallet), staleTime: 0, refetchOnMount: "always" },
  });

  const kg = direcciones.map((dir, i) => {
    const r = lectura.data?.[i];
    if (!dir || !r || r.status !== "success") return null;
    return (r.result as bigint) / UNIDAD;
  });

  return { kg, cargando: lectura.isLoading, refetch: lectura.refetch };
}
