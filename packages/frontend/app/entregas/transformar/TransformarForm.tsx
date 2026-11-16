"use client";

import { useState } from "react";
import { useWriteMercadoCertificadosRegistrarTransformacion } from "@/lib/generated";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

export function TransformarForm({
  mercadoAddress,
  lotesInicial = "",
}: {
  mercadoAddress: `0x${string}`;
  lotesInicial?: string;
}) {
  const [loteIdsTexto, setLoteIdsTexto] = useState(lotesInicial);
  const [kgTransformados, setKgTransformados] = useState(0);
  const [precioUSDTporKg, setPrecioUSDTporKg] = useState(1);

  const { writeContract, data: hash, isPending, error } =
    useWriteMercadoCertificadosRegistrarTransformacion();
  const { isConfirming, isSuccess, revertedError, receipt } = useTxReceipt(hash);

  const loteIds = loteIdsTexto
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const loteIdsValidos = loteIds.length > 0 && loteIds.every((id) => /^\d+$/.test(id));

  function handleSubmit() {
    if (!loteIdsValidos || kgTransformados <= 0 || precioUSDTporKg <= 0) return;

    writeContract({
      address: mercadoAddress,
      args: [loteIds.map((id) => BigInt(id)), BigInt(kgTransformados), BigInt(Math.round(precioUSDTporKg * 1_000_000))],
      ...GAS_FEE_OVERRIDES,
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Ids de los lotes a consumir (separados por coma — tenés que ser el custodio actual de todos)
        <input
          type="text"
          value={loteIdsTexto}
          onChange={(event) => setLoteIdsTexto(event.target.value)}
          placeholder="1, 2, 3"
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Kg efectivamente transformados (el resto, vs. el peso recibido, es tu propia merma)
        <input
          type="number"
          min={1}
          value={kgTransformados}
          onChange={(event) => setKgTransformados(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Precio del certificado (USDT por kg)
        <input
          type="number"
          min={0.01}
          step="0.01"
          value={precioUSDTporKg}
          onChange={(event) => setPrecioUSDTporKg(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <TxButton
        onClick={handleSubmit}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError}
        disabled={!loteIdsValidos || kgTransformados <= 0 || precioUSDTporKg <= 0}
      >
        Registrar transformación
      </TxButton>

      {isSuccess && receipt ? (
        <p className="text-xs text-neutral-500">
          Confirmada en el bloque {receipt.blockNumber.toString()}. Revisá tu certificado en{" "}
          <a href="/mercado/comprar" className="text-forest underline">
            el mercado
          </a>
          .
        </p>
      ) : null}
    </div>
  );
}
