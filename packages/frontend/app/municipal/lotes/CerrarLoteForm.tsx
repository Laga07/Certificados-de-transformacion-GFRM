"use client";

import { useCallback, useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import {
  transaccionesPlasticoAbi,
  useWriteTransaccionesPlasticoCerrarLotePorTipo,
} from "@/lib/generated";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { TIPOS_PLASTICO } from "@/lib/catalogos";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ResumenTipo = readonly [boolean, boolean, bigint, bigint, bigint, bigint];

interface TipoInfo {
  tipo: (typeof TIPOS_PLASTICO)[number];
  reconciliado: boolean;
  pesoDeclaradoTotal: bigint;
  pesoActualTotal: bigint;
  pesoOficialGramos: bigint;
  factorAjuste: bigint;
}

export function CerrarLoteForm({
  transaccionesAddress,
  loteIdInicial,
}: {
  transaccionesAddress: `0x${string}`;
  loteIdInicial?: bigint | null;
}) {
  const [loteId, setLoteId] = useState(1);

  useEffect(() => {
    if (loteIdInicial != null) setLoteId(Number(loteIdInicial));
  }, [loteIdInicial]);

  // Solo para la ruta (dato informativo, no critico) -- el resto viene directo del contrato
  // abajo, para no depender de que el indexer ya haya procesado los eventos de cierre.
  const [rutaId, setRutaId] = useState<number | null>(null);
  useEffect(() => {
    let cancelado = false;
    fetch(`${API_URL}/api/lotes/${loteId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelado) setRutaId(data?.rutaId ?? null);
      })
      .catch(() => {
        if (!cancelado) setRutaId(null);
      });
    return () => {
      cancelado = true;
    };
  }, [loteId]);

  // Se pregunta al contrato, en un solo batch, el estado real de cada uno de los 8 tipos
  // posibles para este lote (cerrado o no, cuanto declaro el usuario vs cuanto aprobo la
  // muni). Al leer directo de la chain, esta pantalla nunca queda desactualizada por atraso
  // del indexer, y el contrato mismo impide re-cerrar un tipo ya reconciliado.
  const {
    data: resultados,
    refetch,
    isLoading: cargando,
  } = useReadContracts({
    contracts: TIPOS_PLASTICO.map((_, index) => ({
      address: transaccionesAddress,
      abi: transaccionesPlasticoAbi,
      functionName: "resumenTipoEnLote",
      args: [BigInt(loteId), index] as const,
    })),
    query: { staleTime: 0, refetchOnMount: "always" as const },
  });

  const tiposInfo: TipoInfo[] = TIPOS_PLASTICO.map((tipo, index) => {
    const entry = resultados?.[index];
    if (!entry || entry.status !== "success") return null;
    const [presente, reconciliado, pesoDeclaradoTotal, pesoActualTotal, pesoOficialGramos, factorAjuste] =
      entry.result as unknown as ResumenTipo;
    if (!presente) return null;
    return { tipo, reconciliado, pesoDeclaradoTotal, pesoActualTotal, pesoOficialGramos, factorAjuste };
  }).filter((t): t is TipoInfo => t !== null);

  const cerrados = tiposInfo.filter((t) => t.reconciliado);
  const pendientes = tiposInfo.filter((t) => !t.reconciliado);
  const loteCompleto = tiposInfo.length > 0 && pendientes.length === 0;

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <label className="flex flex-col gap-1 text-sm">
        ID del lote
        <input
          type="number"
          min={1}
          value={loteId}
          onChange={(event) => setLoteId(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      {cargando ? (
        <p className="text-xs text-neutral-500">Consultando el contrato...</p>
      ) : tiposInfo.length === 0 ? (
        <p className="text-xs text-neutral-500">
          Este lote no existe o todavía no tiene entregas registradas.
        </p>
      ) : (
        <>
          <p className="text-xs text-neutral-500">
            Ruta <strong className="text-navy">{rutaId ?? "?"}</strong>
            {loteCompleto ? " · lote completamente cerrado" : ""}
          </p>

          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide -mb-1">
            Cierre por tipo de plástico &middot; {cerrados.length} de {tiposInfo.length} tipos
            cerrados
          </p>
          {pendientes.length > 0 ? (
            <p className="text-xs text-amber-700 -mb-1">
              El lote no se cierra hasta que cierres los {pendientes.length} tipo(s) de abajo,
              uno por uno. La sección punteada al final es solo para un caso especial (un tipo
              sin entregas en la app) &mdash; no cierra el lote entero.
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            {cerrados.map((t) => (
              <div
                key={t.tipo}
                className="flex flex-col gap-0.5 rounded border border-neutral-200 bg-surface-warm px-3 py-2 text-xs"
              >
                <span className="text-forest font-medium">✓ {t.tipo}</span>
                <span className="text-neutral-500">
                  declarado por el usuario: {t.pesoDeclaradoTotal.toString()} g &middot; aprobado
                  por la municipalidad: {t.pesoOficialGramos.toString()} g &middot; factor{" "}
                  {(Number(t.factorAjuste) / 100).toFixed(2)}%
                </span>
              </div>
            ))}

            {pendientes.map((t) => (
              <CerrarTipoRow
                key={t.tipo}
                loteId={loteId}
                tipo={t.tipo}
                sumaDeclarada={t.pesoDeclaradoTotal}
                transaccionesAddress={transaccionesAddress}
                onCerrado={refetch}
              />
            ))}
          </div>

          {!loteCompleto ? (
            <DeclararTipoSinEntregas
              loteId={loteId}
              tiposYaUsados={new Set(tiposInfo.map((t) => t.tipo))}
              transaccionesAddress={transaccionesAddress}
              onCerrado={refetch}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

function CerrarTipoRow({
  loteId,
  tipo,
  sumaDeclarada,
  transaccionesAddress,
  onCerrado,
}: {
  loteId: number;
  tipo: string;
  sumaDeclarada: bigint;
  transaccionesAddress: `0x${string}`;
  onCerrado: () => void;
}) {
  const [pesoOficial, setPesoOficial] = useState(0);

  const { writeContract, data: hash, isPending, error } =
    useWriteTransaccionesPlasticoCerrarLotePorTipo();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  useEffect(() => {
    if (isSuccess) onCerrado();
  }, [isSuccess, onCerrado]);

  const factorPreview =
    sumaDeclarada > BigInt(0) ? (BigInt(pesoOficial || 0) * BigInt(10000)) / sumaDeclarada : null;

  return (
    <div className="flex flex-col gap-1 rounded border border-neutral-200 px-3 py-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-navy">{tipo}</span>
        <span className="text-neutral-500">declarado: {sumaDeclarada.toString()} g</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={pesoOficial}
          onChange={(event) => setPesoOficial(Number(event.target.value))}
          placeholder="Peso oficial (g)"
          className="flex-1 rounded border border-neutral-300 bg-white px-2 py-1 text-sm"
        />
        <TxButton
          onClick={() =>
            writeContract({
              address: transaccionesAddress,
              args: [BigInt(loteId), TIPOS_PLASTICO.indexOf(tipo as (typeof TIPOS_PLASTICO)[number]), BigInt(pesoOficial)],
              ...GAS_FEE_OVERRIDES,
            })
          }
          isPending={isPending}
          isConfirming={isConfirming}
          isSuccess={isSuccess}
          error={error ?? revertedError}
        >
          Cerrar {tipo}
        </TxButton>
      </div>
      {factorPreview !== null ? (
        <p className="text-xs text-neutral-500">
          Factor estimado: {(Number(factorPreview) / 100).toFixed(2)}%
        </p>
      ) : null}
    </div>
  );
}

function DeclararTipoSinEntregas({
  loteId,
  tiposYaUsados,
  transaccionesAddress,
  onCerrado,
}: {
  loteId: number;
  tiposYaUsados: Set<string>;
  transaccionesAddress: `0x${string}`;
  onCerrado: () => void;
}) {
  // "Desconocido" no es un tipo real que una municipalidad deba poder cerrar a mano -- se
  // excluye para que el desplegable nunca tenga puesto por defecto algo que parezca "cerrar
  // todo" (fue justo la confusion que causo este mismo componente antes de este fix).
  const disponibles = TIPOS_PLASTICO.filter((t) => t !== "Desconocido" && !tiposYaUsados.has(t));
  const [tipo, setTipo] = useState(disponibles[0]);
  const [pesoOficial, setPesoOficial] = useState(0);

  const { writeContract, data: hash, isPending, error } =
    useWriteTransaccionesPlasticoCerrarLotePorTipo();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  useEffect(() => {
    if (isSuccess) onCerrado();
  }, [isSuccess, onCerrado]);

  if (disponibles.length === 0) return null;

  return (
    <details className="rounded border border-dashed border-neutral-300 px-3 py-2">
      <summary className="cursor-pointer text-xs font-medium text-neutral-500">
        Caso especial: declarar un tipo que no pasó por la app
      </summary>
      <p className="text-xs text-neutral-500 mt-2">
        Esto es solo para un tipo de plástico que la municipalidad recibió sin que quedara
        registrado en el sitio (ej. una entrega en papel) &mdash; <strong>no cierra el lote
        completo</strong>, solo agrega y cierra ese tipo puntual. Para los tipos que ya tienen
        entregas en la app, usa los botones de arriba.
      </p>
      <div className="flex items-center gap-2 mt-2">
        <select
          value={tipo}
          onChange={(event) => setTipo(event.target.value as (typeof TIPOS_PLASTICO)[number])}
          className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm"
        >
          {disponibles.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          value={pesoOficial}
          onChange={(event) => setPesoOficial(Number(event.target.value))}
          placeholder="Peso oficial (g)"
          className="flex-1 rounded border border-neutral-300 bg-white px-2 py-1 text-sm"
        />
      </div>
      <TxButton
        onClick={() =>
          writeContract({
            address: transaccionesAddress,
            args: [BigInt(loteId), TIPOS_PLASTICO.indexOf(tipo), BigInt(pesoOficial)],
            ...GAS_FEE_OVERRIDES,
          })
        }
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError}
      >
        Declarar y cerrar {tipo}
      </TxButton>
    </details>
  );
}
