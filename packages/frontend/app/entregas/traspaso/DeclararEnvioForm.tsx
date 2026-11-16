"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { useWriteTokenCustodiaDeclararEnvio } from "@/lib/generated";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

export function DeclararEnvioForm({
  custodiaAddress,
  loteInicial = "",
}: {
  custodiaAddress: `0x${string}`;
  loteInicial?: string;
}) {
  const [loteId, setLoteId] = useState(loteInicial);
  const [destinatario, setDestinatario] = useState("");
  const [pesoEnviado, setPesoEnviado] = useState(0);
  const [precioUSDTporKg, setPrecioUSDTporKg] = useState(0);

  const { writeContract, data: hash, isPending, error } = useWriteTokenCustodiaDeclararEnvio();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  const destinatarioValido = isAddress(destinatario);

  function handleSubmit() {
    if (!loteId || !destinatarioValido || pesoEnviado <= 0) return;

    writeContract({
      address: custodiaAddress,
      args: [
        BigInt(loteId),
        destinatario as `0x${string}`,
        BigInt(pesoEnviado),
        BigInt(Math.round(precioUSDTporKg * 1_000_000)),
      ],
      ...GAS_FEE_OVERRIDES,
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Id del lote (vos tenés que ser el custodio actual)
        <input
          type="text"
          value={loteId}
          onChange={(event) => setLoteId(event.target.value)}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Destinatario (intermediario o transformador verificado)
        <input
          type="text"
          value={destinatario}
          onChange={(event) => setDestinatario(event.target.value)}
          placeholder="0x..."
          className="rounded border border-neutral-300 bg-white px-3 py-2 font-mono text-xs"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Peso enviado (gramos — tiene que ser el peso completo del lote)
        <input
          type="number"
          min={1}
          value={pesoEnviado}
          onChange={(event) => setPesoEnviado(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Precio pactado (USDT por kg, opcional)
        <input
          type="number"
          min={0}
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
        disabled={!loteId || !destinatarioValido || pesoEnviado <= 0}
      >
        Declarar envío
      </TxButton>
    </div>
  );
}
