"use client";

import { useState } from "react";
import { useWriteTokenCustodiaConfirmarRecepcion } from "@/lib/generated";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

const QUIEN_ABSORBE = ["Quien envía", "Quien recibe", "Mitad y mitad"] as const;

export function ConfirmarRecepcionForm({ custodiaAddress }: { custodiaAddress: `0x${string}` }) {
  const [loteId, setLoteId] = useState("");
  const [pesoRecibido, setPesoRecibido] = useState(0);
  const [quienAbsorbe, setQuienAbsorbe] = useState(2);

  const { writeContract, data: hash, isPending, error } =
    useWriteTokenCustodiaConfirmarRecepcion();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  function handleSubmit() {
    if (!loteId || pesoRecibido <= 0) return;

    writeContract({
      address: custodiaAddress,
      args: [BigInt(loteId), BigInt(pesoRecibido), quienAbsorbe],
      ...GAS_FEE_OVERRIDES,
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Id del lote (tenés que ser el destinatario declarado en el paso 1)
        <input
          type="text"
          value={loteId}
          onChange={(event) => setLoteId(event.target.value)}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Peso que de verdad recibiste en tu báscula (gramos)
        <input
          type="number"
          min={0}
          value={pesoRecibido}
          onChange={(event) => setPesoRecibido(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Si el peso recibido es menor al enviado, ¿quién absorbe la diferencia?
        <select
          value={quienAbsorbe}
          onChange={(event) => setQuienAbsorbe(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        >
          {QUIEN_ABSORBE.map((nombre, index) => (
            <option key={nombre} value={index}>
              {nombre}
            </option>
          ))}
        </select>
      </label>

      <TxButton
        onClick={handleSubmit}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError}
        disabled={!loteId || pesoRecibido <= 0}
      >
        Confirmar recepción
      </TxButton>
    </div>
  );
}
