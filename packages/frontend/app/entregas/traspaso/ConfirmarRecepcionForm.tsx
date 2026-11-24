"use client";

import { useState } from "react";
import { tokenCustodiaAbi } from "@/lib/generated";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { useEscribir } from "@/lib/useEscribir";

const QUIEN_ABSORBE = ["Quien envía", "Quien recibe", "Mitad y mitad"] as const;

export function ConfirmarRecepcionForm({
  custodiaAddress,
  loteInicial = "",
}: {
  custodiaAddress: `0x${string}`;
  loteInicial?: string;
}) {
  const [loteId, setLoteId] = useState(loteInicial);
  const [pesoRecibido, setPesoRecibido] = useState(0);
  const [quienAbsorbe, setQuienAbsorbe] = useState(2);

  const { enviar, data: hash, isPending, error } =
    useEscribir(tokenCustodiaAbi, "confirmarRecepcion");
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  function handleSubmit() {
    if (!loteId || pesoRecibido <= 0) return;

    enviar(custodiaAddress, [BigInt(loteId), BigInt(pesoRecibido), quienAbsorbe]);
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
