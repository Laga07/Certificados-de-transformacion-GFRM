"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  useReadRegistroEntidadesUsuarios,
  useWriteTransaccionesPlasticoRegistrarEntregaUsuario,
} from "@/lib/generated";
import { PROVINCIAS, PROVINCIA_ENUM_KEYS } from "@/lib/catalogos";
import { TxButton } from "@/components/TxButton";
import { PlasticoTypeField } from "@/components/PlasticoTypeField";
import { ValorInfo } from "@/components/ValorInfo";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface LoteSugerido {
  id: string;
  rutaId: number;
  fechaRecoleccion: string;
  municipalidadWallet: string;
}

export function EntregaLoteUsuarioForm({
  registroAddress,
  transaccionesAddress,
}: {
  registroAddress: `0x${string}`;
  transaccionesAddress: `0x${string}`;
}) {
  const { address } = useAccount();

  const { data: usuario } = useReadRegistroEntidadesUsuarios({
    address: registroAddress,
    args: address ? ([address] as const) : undefined,
    query: { enabled: Boolean(address), staleTime: 0, refetchOnMount: "always" },
  });

  const miProvinciaIndex = usuario ? Number(usuario[2].provincia) : null;
  const miCantonId = usuario ? Number(usuario[2].cantonId) : null;

  const [lotesSugeridos, setLotesSugeridos] = useState<LoteSugerido[] | null>(null);
  const [cargandoLotes, setCargandoLotes] = useState(false);

  useEffect(() => {
    if (miProvinciaIndex === null || miCantonId === null) return;
    let cancelado = false;

    async function buscarLotes() {
      setCargandoLotes(true);
      try {
        const provinciaKey = PROVINCIA_ENUM_KEYS[miProvinciaIndex as number];
        const res = await fetch(
          `${API_URL}/api/lotes?provincia=${provinciaKey}&cantonId=${miCantonId}&cerrado=false&pageSize=20`,
        );
        const data = res.ok ? await res.json() : null;
        if (!cancelado) setLotesSugeridos(data?.data ?? []);
      } catch {
        if (!cancelado) setLotesSugeridos(null);
      } finally {
        if (!cancelado) setCargandoLotes(false);
      }
    }

    buscarLotes();
    return () => {
      cancelado = true;
    };
  }, [miProvinciaIndex, miCantonId]);

  const [loteId, setLoteId] = useState<number | null>(null);
  const [pesoGramos, setPesoGramos] = useState(100);
  const [tipoPlastico, setTipoPlastico] = useState(1);
  const [rutaId, setRutaId] = useState(1);

  const { writeContract, data: hash, isPending, error } =
    useWriteTransaccionesPlasticoRegistrarEntregaUsuario();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  function elegirLote(lote: LoteSugerido) {
    setLoteId(Number(lote.id));
    setRutaId(lote.rutaId);
  }

  function handleSubmit() {
    if (loteId === null) return;
    writeContract({
      address: transaccionesAddress,
      args: [BigInt(loteId), BigInt(pesoGramos), tipoPlastico, rutaId],
      ...GAS_FEE_OVERRIDES,
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <p className="text-sm text-neutral-500">
        Cuando el camión de tu municipalidad recoja tu plástico, reporta aquí tu propia entrega
        (tú pagas el gas). La municipalidad pesará todo junto al final del día y ajustará los
        pesos reportados proporcionalmente al peso oficial de la báscula.
      </p>

      <div className="rounded-lg border border-neutral-200 p-3">
        <h2 className="text-sm font-medium mb-2 text-navy">Lotes abiertos en tu zona</h2>
        {miProvinciaIndex === null ? (
          <p className="text-xs text-neutral-500">Cargando tu ubicación registrada...</p>
        ) : (
          <p className="text-xs text-neutral-500 mb-2">
            Según tu registro: {PROVINCIAS[miProvinciaIndex]}, cantón {miCantonId}
          </p>
        )}

        {cargandoLotes ? (
          <p className="text-xs text-neutral-500">Buscando lotes abiertos...</p>
        ) : !lotesSugeridos || lotesSugeridos.length === 0 ? (
          <p className="text-xs text-neutral-500">
            No hay lotes abiertos todavía para tu provincia/cantón. Pídele el ID del lote a tu
            municipalidad, o espera a que se abra uno.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {lotesSugeridos.map((lote) => (
              <li key={lote.id}>
                <button
                  type="button"
                  onClick={() => elegirLote(lote)}
                  className={`w-full text-left rounded border px-2 py-1 text-xs ${
                    loteId === Number(lote.id)
                      ? "border-forest bg-forest/10"
                      : "border-neutral-200 hover:border-forest"
                  }`}
                >
                  Lote #{lote.id} - Ruta {lote.rutaId} -{" "}
                  {new Date(lote.fechaRecoleccion).toLocaleDateString("es-CR")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="flex flex-col gap-1 text-sm">
        ID del lote (elige uno de arriba, o ingrésalo manualmente si ya lo conoces)
        <input
          type="number"
          min={1}
          value={loteId ?? ""}
          onChange={(event) => setLoteId(event.target.value ? Number(event.target.value) : null)}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Peso entregado (gramos)
        <input
          type="number"
          min={1}
          value={pesoGramos}
          onChange={(event) => setPesoGramos(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <PlasticoTypeField value={tipoPlastico} onChange={setTipoPlastico} />

      <label className="flex flex-col gap-1 text-sm">
        Ruta (se llena sola al elegir un lote de la lista)
        <input
          type="number"
          min={0}
          value={rutaId}
          onChange={(event) => setRutaId(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <ValorInfo />

      <TxButton
        onClick={handleSubmit}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError}
        disabled={loteId === null}
      >
        Reportar mi entrega
      </TxButton>
    </div>
  );
}
