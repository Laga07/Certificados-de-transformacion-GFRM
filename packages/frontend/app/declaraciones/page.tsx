import Link from "next/link";
import { apiFetchServer } from "@/lib/api.server";
import type { Declaracion } from "@/lib/api";
import { MATERIALES } from "@/lib/catalogos";

export default async function DeclaracionesPage() {
  const res = await apiFetchServer<{ data: Declaracion[] }>("/api/declaraciones");
  const lista = res?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Mis declaraciones</h1>
          <p className="text-sm text-foreground/70 max-w-2xl mt-1">
            Archivo de los certificados que usaste en informes de cumplimiento. Cada constancia
            confirmada tiene un código QR que cualquiera puede verificar.
          </p>
        </div>
        <Link
          href="/declaraciones/nueva"
          className="rounded-sm bg-forest px-4 py-2 font-mono text-xs uppercase tracking-wider text-white hover:bg-forest-light"
        >
          Nueva declaración
        </Link>
      </div>

      {res === null ? (
        <p className="text-sm text-red-600">No se pudo consultar la API.</p>
      ) : lista.length === 0 ? (
        <p className="text-sm text-foreground/70">
          Todavía no hiciste ninguna declaración.{" "}
          <Link href="/mercado/certificados" className="text-forest hover:underline">
            Ver mis certificados
          </Link>
          .
        </p>
      ) : (
        <div className="overflow-x-auto border border-neutral-300">
          <table className="w-full text-sm">
            <thead className="bg-surface-warm">
              <tr>
                <th className="text-left p-2 label-mono">Código</th>
                <th className="text-left p-2 label-mono">Material</th>
                <th className="text-right p-2 label-mono">Kg</th>
                <th className="text-left p-2 label-mono">Período</th>
                <th className="text-left p-2 label-mono">Entidad</th>
                <th className="text-left p-2 label-mono">Estado</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((d) => (
                <tr key={d.id} className="border-t border-neutral-200">
                  <td className="p-2 font-mono">
                    <Link href={`/declaraciones/${d.id}`} className="text-forest hover:underline">
                      {d.codigo}
                    </Link>
                  </td>
                  <td className="p-2">{MATERIALES[d.materialIndex]}</td>
                  <td className="p-2 text-right tabular-nums">{Number(d.cantidadKg).toLocaleString("es-CR")}</td>
                  <td className="p-2">{d.periodoTexto}</td>
                  <td className="p-2">{d.entidadDestino}</td>
                  <td className="p-2">
                    {d.estado === "CONFIRMADA" ? (
                      <span className="text-forest">Confirmada</span>
                    ) : (
                      <span className="text-amber-700">Pendiente de firma</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
