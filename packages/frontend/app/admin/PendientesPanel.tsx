"use client";

import { useEffect, useState } from "react";
import {
  useWriteRegistroEntidadesVerificarIntermediario,
  useWriteRegistroEntidadesVerificarTransformador,
} from "@/lib/generated";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";
import { API_URL } from "@/lib/apiUrl";

interface Pendiente {
  wallet: string;
  nombreHash: string;
  provincia: string;
  cantonId: number;
}

export function PendientesPanel({
  registroAddress,
  tipo,
}: {
  registroAddress: `0x${string}`;
  tipo: "intermediario" | "transformador";
}) {
  const [pendientes, setPendientes] = useState<Pendiente[] | null>(null);
  const [recargar, setRecargar] = useState(0);

  useEffect(() => {
    let cancelado = false;
    fetch(`${API_URL}/api/${tipo === "intermediario" ? "intermediarios" : "transformadores"}/pendientes`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelado) setPendientes(data);
      })
      .catch(() => {
        if (!cancelado) setPendientes([]);
      });
    return () => {
      cancelado = true;
    };
  }, [tipo, recargar]);

  if (pendientes === null) {
    return <p className="text-sm text-neutral-500">Cargando...</p>;
  }

  if (pendientes.length === 0) {
    return <p className="text-sm text-neutral-500">No hay nadie pendiente de verificación.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {pendientes.map((p) => (
        <FilaPendiente
          key={p.wallet}
          pendiente={p}
          registroAddress={registroAddress}
          tipo={tipo}
          onVerificado={() => setRecargar((n) => n + 1)}
        />
      ))}
    </ul>
  );
}

function FilaPendiente({
  pendiente,
  registroAddress,
  tipo,
  onVerificado,
}: {
  pendiente: Pendiente;
  registroAddress: `0x${string}`;
  tipo: "intermediario" | "transformador";
  onVerificado: () => void;
}) {
  const intermediarioWrite = useWriteRegistroEntidadesVerificarIntermediario();
  const transformadorWrite = useWriteRegistroEntidadesVerificarTransformador();
  const write = tipo === "intermediario" ? intermediarioWrite : transformadorWrite;
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(write.data);

  if (isSuccess) onVerificado();

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded border border-neutral-200 p-3 text-sm">
      <div>
        <span className="font-mono text-xs">{pendiente.wallet}</span>
        <span className="text-neutral-500 text-xs ml-2">
          {pendiente.provincia} &middot; cantón {pendiente.cantonId}
        </span>
      </div>
      <TxButton
        onClick={() =>
          write.writeContract({
            address: registroAddress,
            args: [pendiente.wallet as `0x${string}`],
            ...GAS_FEE_OVERRIDES,
          })
        }
        isPending={write.isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={write.error ?? revertedError}
      >
        Verificar
      </TxButton>
    </li>
  );
}
