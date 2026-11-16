"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { apiFetch } from "@/lib/api";
import { MATERIALES, VARIANTES_POR_MATERIAL } from "@/lib/catalogos";

const MATERIAL_KEYS = ["Plastico", "CartonPapel", "Tetrapack", "Vidrio", "Metales"] as const;

interface LoteRow {
  id: string;
  material: string;
  varianteId: number;
  pesoActual: string;
  pesoAceptadoOrigen: string;
  activo: boolean;
  traspasoPendiente: { hacia: string; pesoEnviado: string } | null;
}

interface TraspasoRow {
  id: number;
  loteId: string;
  de: string;
  pesoEnviado: string;
  precioUSDTporKg: string;
  lote: { material: string; varianteId: number };
}

function materialNombre(key: string) {
  const idx = (MATERIAL_KEYS as readonly string[]).indexOf(key);
  return idx === -1 ? key : MATERIALES[idx];
}

function varianteNombre(key: string, varianteId: number) {
  const idx = (MATERIAL_KEYS as readonly string[]).indexOf(key);
  if (idx === -1) return `variante ${varianteId}`;
  return VARIANTES_POR_MATERIAL[MATERIALES[idx]][varianteId] ?? `variante ${varianteId}`;
}

function kg(gramos: string) {
  return (Number(gramos) / 1000).toLocaleString("es-CR", { maximumFractionDigits: 3 });
}

function corto(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function MisLotes() {
  const { address } = useAccount();
  const [lotes, setLotes] = useState<LoteRow[] | null>(null);
  const [entrantes, setEntrantes] = useState<TraspasoRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!address) return;
    setError(null);
    try {
      const [l, t] = await Promise.all([
        apiFetch<{ data: LoteRow[] }>(`/api/lotes?custodio=${address}&activo=true&pageSize=100`),
        apiFetch<{ data: TraspasoRow[] }>(`/api/traspasos/pendientes?hacia=${address}`),
      ]);
      setLotes(l.data);
      setEntrantes(t.data);
    } catch {
      setError("No se pudo consultar la API. Los datos salen del indexer: puede tardar unos segundos en reflejar la última transacción.");
      setLotes([]);
      setEntrantes([]);
    }
  }, [address]);

  useEffect(() => {
    // Diferido a una microtarea: ver nota en admin/RevisionEntidades.tsx.
    void Promise.resolve().then(cargar);
  }, [cargar]);

  if (!address) return null;

  return (
    <div className="flex flex-col gap-8">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading font-semibold text-navy">Envíos que me esperan</h2>
          <button type="button" onClick={cargar} className="label-mono text-forest hover:underline">
            Actualizar
          </button>
        </div>
        {entrantes === null ? (
          <p className="text-sm text-neutral-500">Cargando...</p>
        ) : entrantes.length === 0 ? (
          <p className="text-sm text-neutral-500">Nadie te declaró un envío pendiente.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {entrantes.map((t) => (
              <li key={t.id} className="border border-amber-300 bg-amber-50 p-3 text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="font-mono">Lote #{t.loteId}</span>
                <span>{materialNombre(t.lote.material)} · {varianteNombre(t.lote.material, t.lote.varianteId)}</span>
                <span>{kg(t.pesoEnviado)} kg declarados</span>
                <span className="text-foreground/60">de {corto(t.de)}</span>
                <Link href={`/entregas/traspaso?lote=${t.loteId}&paso=confirmar`} className="ml-auto rounded-sm bg-forest px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-white hover:bg-forest-light">
                  Confirmar recepción
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading font-semibold text-navy">En mi custodia</h2>
        {lotes === null ? (
          <p className="text-sm text-neutral-500">Cargando...</p>
        ) : lotes.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No tenés lotes activos. Registrá una entrega o esperá a que te confirmen un traspaso.
          </p>
        ) : (
          <div className="overflow-x-auto border border-neutral-300">
            <table className="w-full text-sm">
              <thead className="bg-surface-warm">
                <tr>
                  <th className="text-left p-2 label-mono">Lote</th>
                  <th className="text-left p-2 label-mono">Material</th>
                  <th className="text-right p-2 label-mono">Peso actual</th>
                  <th className="text-right p-2 label-mono">Aceptado en origen</th>
                  <th className="text-left p-2 label-mono">Estado</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {lotes.map((l) => (
                  <tr key={l.id} className="border-t border-neutral-200">
                    <td className="p-2 font-mono">#{l.id}</td>
                    <td className="p-2">{materialNombre(l.material)} · {varianteNombre(l.material, l.varianteId)}</td>
                    <td className="p-2 text-right tabular-nums">{kg(l.pesoActual)} kg</td>
                    <td className="p-2 text-right tabular-nums">{kg(l.pesoAceptadoOrigen)} kg</td>
                    <td className="p-2">
                      {l.traspasoPendiente ? (
                        <span className="text-amber-700">En tránsito hacia {corto(l.traspasoPendiente.hacia)}</span>
                      ) : (
                        <span className="text-forest">Disponible</span>
                      )}
                    </td>
                    <td className="p-2 text-right whitespace-nowrap">
                      {l.traspasoPendiente ? null : (
                        <span className="flex gap-3 justify-end">
                          <Link href={`/entregas/registrar?lote=${l.id}`} className="text-forest hover:underline text-xs">
                            Agregar entrega
                          </Link>
                          <Link href={`/entregas/traspaso?lote=${l.id}&paso=enviar`} className="text-forest hover:underline text-xs">
                            Enviar
                          </Link>
                          <Link href={`/entregas/transformar?lotes=${l.id}`} className="text-forest hover:underline text-xs">
                            Transformar
                          </Link>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
