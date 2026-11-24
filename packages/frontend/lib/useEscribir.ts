"use client";

import { useState } from "react";
import type { Abi, ContractFunctionArgs, ContractFunctionName } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { FEES_RESPALDO, GAS_MAXIMO, MARGEN_GAS_PORCENTAJE, PROPINA_MINIMA } from "./gasOverrides";

type Mutable = "nonpayable" | "payable";

/**
 * Unico camino para mandar transacciones desde el sitio. Antes de abrir la wallet:
 *
 * 1. Simula y estima el gas con el RPC del sitio (no el de la wallet). Si la transaccion va a
 *    revertir, el error con el motivo del contrato aparece ACA, sin hacerle firmar nada al
 *    usuario ni gastarle gas.
 * 2. Limite = estimado + MARGEN_GAS_PORCENTAJE (tope GAS_MAXIMO).
 * 3. Precio segun la red en ese momento (doble del base fee como techo + propina con piso de
 *    30 gwei), con valores fijos de respaldo si la consulta falla.
 *
 * Uso:
 *   const { enviar, data: hash, isPending, error } = useEscribir(tokenCustodiaAbi, "dividirLote");
 *   enviar(custodiaAddress, [loteId, pesos]);
 */
export function useEscribir<
  const abi extends Abi,
  functionName extends ContractFunctionName<abi, Mutable>,
>(abi: abi, functionName: functionName) {
  const escritura = useWriteContract();
  const publicClient = usePublicClient();
  const { address: cuenta } = useAccount();
  const [preparando, setPreparando] = useState(false);
  const [errorPrevio, setErrorPrevio] = useState<Error | null>(null);

  async function enviar(address: `0x${string}`, args: ContractFunctionArgs<abi, Mutable, functionName>) {
    setErrorPrevio(null);
    escritura.reset();
    if (!publicClient || !cuenta) {
      setErrorPrevio(new Error("Connector not connected"));
      return;
    }
    setPreparando(true);
    try {
      const llamada = { abi, address, functionName, args, account: cuenta } as never;
      const estimado = await publicClient.estimateContractGas(llamada);
      let gas = (estimado * BigInt(100 + MARGEN_GAS_PORCENTAJE)) / BigInt(100);
      if (gas > GAS_MAXIMO) gas = estimado > GAS_MAXIMO ? estimado : GAS_MAXIMO;

      let fees: { maxFeePerGas: bigint; maxPriorityFeePerGas: bigint } = { ...FEES_RESPALDO };
      try {
        const red = await publicClient.estimateFeesPerGas();
        const propina = red.maxPriorityFeePerGas > PROPINA_MINIMA ? red.maxPriorityFeePerGas : PROPINA_MINIMA;
        fees = { maxPriorityFeePerGas: propina, maxFeePerGas: red.maxFeePerGas * BigInt(2) + propina };
      } catch {
        // se usan los valores de respaldo
      }

      escritura.writeContract({ abi, address, functionName, args, gas, ...fees } as never);
    } catch (e) {
      setErrorPrevio(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setPreparando(false);
    }
  }

  return {
    enviar,
    data: escritura.data,
    isPending: escritura.isPending || preparando,
    error: (escritura.error as Error | null) ?? errorPrevio,
    reset: () => {
      escritura.reset();
      setErrorPrevio(null);
    },
  };
}
