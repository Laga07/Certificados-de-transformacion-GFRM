"use client";

import { useCallback, useEffect } from "react";
import { useState } from "react";
import { useWriteRegistroEntidadesVerificarCentro } from "@/lib/generated";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { TxButton } from "@/components/TxButton";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface CentroPendiente {
  wallet: string;
  provincia: string;
  cantonId: number;
  esPublico: boolean;
  registradoEn: string;
  txHash: string;
}

export function CentrosPendientesPanel({ registroAddress }: { registroAddress: `0x${string}` }) {
  const [centros, setCentros] = useState<CentroPendiente[] | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/centros?verificado=false&pageSize=100`);
      const data = res.ok ? await res.json() : null;
      setCentros(data?.data ?? []);
    } catch {
      setCentros([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={cargar}
        className="text-forest hover:underline text-xs w-fit"
      >
        Actualizar lista
      </button>

      {cargando ? (
        <p className="text-sm text-neutral-500">Cargando centros pendientes...</p>
      ) : !centros || centros.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay centros pendientes de verificación.</p>
      ) : (
        <div className="overflow-x-auto border border-neutral-300">
          <table className="w-full text-sm">
            <thead className="bg-surface-warm">
              <tr>
                <th className="text-left p-2 label-mono">Wallet</th>
                <th className="text-left p-2 label-mono">Provincia</th>
                <th className="text-left p-2 label-mono">Cantón</th>
                <th className="text-left p-2 label-mono">Tipo</th>
                <th className="text-left p-2 label-mono">Registrado</th>
                <th className="text-left p-2 label-mono">Acción</th>
              </tr>
            </thead>
            <tbody>
              {centros.map((centro) => (
                <CentroRow
                  key={centro.wallet}
                  centro={centro}
                  registroAddress={registroAddress}
                  onVerificado={cargar}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-neutral-500">
        Esta lista viene del indexer, no directo de la chain: después de verificar un centro
        puede tardar unos segundos en desaparecer de acá mientras el indexer sincroniza el
        bloque. Usa &quot;Actualizar lista&quot; si no se refresca sola.
      </p>
    </div>
  );
}

function CentroRow({
  centro,
  registroAddress,
  onVerificado,
}: {
  centro: CentroPendiente;
  registroAddress: `0x${string}`;
  onVerificado: () => void;
}) {
  const { writeContract, data: hash, isPending, error } = useWriteRegistroEntidadesVerificarCentro();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  useEffect(() => {
    if (isSuccess) onVerificado();
  }, [isSuccess, onVerificado]);

  return (
    <tr className="border-t border-neutral-200">
      <td className="p-2 font-mono">
        {centro.wallet.slice(0, 6)}...{centro.wallet.slice(-4)}
      </td>
      <td className="p-2">{centro.provincia}</td>
      <td className="p-2">{centro.cantonId}</td>
      <td className="p-2">{centro.esPublico ? "Público" : "Privado"}</td>
      <td className="p-2">{new Date(centro.registradoEn).toLocaleDateString("es-CR")}</td>
      <td className="p-2">
        <TxButton
          onClick={() =>
            writeContract({
              address: registroAddress,
              args: [centro.wallet as `0x${string}`],
              ...GAS_FEE_OVERRIDES,
            })
          }
          isPending={isPending}
          isConfirming={isConfirming}
          isSuccess={isSuccess}
          error={error ?? revertedError}
        >
          Verificar
        </TxButton>
      </td>
    </tr>
  );
}
