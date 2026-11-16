"use client";

import { useState } from "react";
import { useReadTokenCustodiaLoteInfo, useWriteTokenCustodiaDividirLote } from "@/lib/generated";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

export function DividirLoteForm({ custodiaAddress }: { custodiaAddress: `0x${string}` }) {
  const [loteIdTexto, setLoteIdTexto] = useState("");
  const [pesosTexto, setPesosTexto] = useState("");

  const loteIdValido = /^\d+$/.test(loteIdTexto);
  const { data: info } = useReadTokenCustodiaLoteInfo({
    address: custodiaAddress,
    args: loteIdValido ? ([BigInt(loteIdTexto)] as const) : undefined,
    query: { enabled: loteIdValido, staleTime: 0 },
  });
  // loteInfo devuelve una tupla posicional: material, varianteId, custodioActual, pesoActual,
  // pesoAceptadoOrigen, activo.
  const pesoActual = info ? info[3] : undefined;

  const pesos = pesosTexto.split(",").map((s) => s.trim()).filter(Boolean);
  const pesosValidos = pesos.length >= 2 && pesos.every((p) => /^\d+$/.test(p) && Number(p) > 0);
  const suma = pesosValidos ? pesos.reduce((acc, p) => acc + BigInt(p), BigInt(0)) : BigInt(0);
  const sumaCoincide = pesoActual !== undefined && suma === pesoActual;

  const { writeContract, data: hash, isPending, error } = useWriteTokenCustodiaDividirLote();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Id del lote a dividir
        <input
          type="text"
          value={loteIdTexto}
          onChange={(e) => setLoteIdTexto(e.target.value)}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
        {pesoActual !== undefined ? (
          <span className="text-xs text-foreground/60">Peso actual del lote: {pesoActual.toString()} g</span>
        ) : null}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Pesos de las piezas en gramos (separados por coma; deben sumar el peso actual)
        <input
          type="text"
          value={pesosTexto}
          onChange={(e) => setPesosTexto(e.target.value)}
          placeholder="6000, 4000"
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
        {pesosValidos && pesoActual !== undefined ? (
          <span className={`text-xs ${sumaCoincide ? "text-forest" : "text-red-600"}`}>
            Suma: {suma.toString()} g {sumaCoincide ? "(coincide)" : `(faltan ${(pesoActual - suma).toString()} g)`}
          </span>
        ) : null}
      </label>

      <TxButton
        onClick={() =>
          writeContract({
            address: custodiaAddress,
            args: [BigInt(loteIdTexto), pesos.map((p) => BigInt(p))],
            ...GAS_FEE_OVERRIDES,
          })
        }
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError}
        disabled={!loteIdValido || !pesosValidos || !sumaCoincide}
      >
        Dividir lote
      </TxButton>
    </div>
  );
}
