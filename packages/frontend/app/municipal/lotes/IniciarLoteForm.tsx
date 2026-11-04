"use client";

import { useEffect, useState } from "react";
import { decodeEventLog, type TransactionReceipt } from "viem";
import { transaccionesPlasticoAbi, useWriteTransaccionesPlasticoIniciarLoteMunicipal } from "@/lib/generated";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

// El loteId lo asigna el contrato (contador interno, evita colisiones) -- no lo elige quien
// inicia el lote. Por eso hay que leerlo del evento LoteMunicipalIniciado una vez confirmada
// la transaccion, en vez de dejar que el usuario lo "invente".
function extraerLoteId(receipt: TransactionReceipt | undefined, address: string) {
  if (!receipt) return null;
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== address.toLowerCase()) continue;
    try {
      const decoded = decodeEventLog({
        abi: transaccionesPlasticoAbi,
        eventName: "LoteMunicipalIniciado",
        data: log.data,
        topics: log.topics as [signature: `0x${string}`, ...args: `0x${string}`[]],
      });
      return decoded.args.loteId as bigint;
    } catch {
      continue;
    }
  }
  return null;
}

export function IniciarLoteForm({
  transaccionesAddress,
  onLoteCreado,
}: {
  transaccionesAddress: `0x${string}`;
  onLoteCreado?: (loteId: bigint) => void;
}) {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [rutaId, setRutaId] = useState(1);

  const { writeContract, data: hash, isPending, error } =
    useWriteTransaccionesPlasticoIniciarLoteMunicipal();
  const { isConfirming, isSuccess, revertedError, receipt } = useTxReceipt(hash);

  const loteCreado = isSuccess ? extraerLoteId(receipt, transaccionesAddress) : null;

  useEffect(() => {
    if (loteCreado !== null) onLoteCreado?.(loteCreado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loteCreado]);

  function handleSubmit() {
    const fechaRecoleccion = BigInt(Math.floor(new Date(fecha).getTime() / 1000));
    writeContract({
      address: transaccionesAddress,
      args: [fechaRecoleccion, rutaId],
      ...GAS_FEE_OVERRIDES,
    });
  }

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <label className="flex flex-col gap-1 text-sm">
        Fecha de recolección
        <input
          type="date"
          value={fecha}
          onChange={(event) => setFecha(event.target.value)}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Ruta (ID numérico definido por tu municipalidad)
        <input
          type="number"
          min={0}
          value={rutaId}
          onChange={(event) => setRutaId(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>
      <p className="text-xs text-neutral-500">
        El número de lote lo asigna el contrato automáticamente (evita que dos personas creen
        el mismo ID); aparece aquí abajo apenas se confirma.
      </p>
      <TxButton
        onClick={handleSubmit}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError}
      >
        Iniciar lote
      </TxButton>
      {loteCreado !== null ? (
        <p className="text-sm text-forest font-medium">
          Lote creado: #{loteCreado.toString()} &mdash; ya se copió a los siguientes pasos.
        </p>
      ) : null}
    </div>
  );
}
