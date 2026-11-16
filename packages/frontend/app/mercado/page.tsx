import Link from "next/link";
import { API_URL } from "@/lib/apiUrl";
import { MATERIALES } from "@/lib/catalogos";

// Catalogo de emisiones con kilos disponibles para venta primaria. Antes el comprador tenia
// que teclear el id de emision a mano (plan de produccion, C3).
const MATERIAL_KEYS = ["Plastico", "CartonPapel", "Tetrapack", "Vidrio", "Metales"] as const;

interface EmisionRow {
  id: string;
  material: string;
  transformadorWallet: string;
  kgTransformadosOriginal: string;
  kgDisponiblesPrimario: string;
  precioUSDTporKg: string;
  createdAt: string;
}

function nombreMaterial(key: string) {
  const idx = (MATERIAL_KEYS as readonly string[]).indexOf(key);
  return idx === -1 ? key : MATERIALES[idx];
}

export default async function MercadoPage({ searchParams }: { searchParams: Promise<{ material?: string }> }) {
  const { material } = await searchParams;
  let emisiones: EmisionRow[] = [];
  let errorApi = false;
  try {
    const res = await fetch(`${API_URL}/api/emisiones?pageSize=100${material ? `&material=${material}` : ""}`, { cache: "no-store" });
    if (res.ok) emisiones = ((await res.json()) as { data: EmisionRow[] }).data;
    else errorApi = true;
  } catch {
    errorApi = true;
  }

  const disponibles = emisiones.filter((e) => BigInt(e.kgDisponiblesPrimario) > BigInt(0));
  const agotadas = emisiones.length - disponibles.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Catálogo de certificados</h1>
        <p className="text-sm text-foreground/70 max-w-2xl mt-1">
          Emisiones con kilos disponibles para compra primaria. Cada fila es un lote transformado
          real; el precio lo fijó el transformador. Podés comprar una parte o todo.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/mercado" className={`label-mono px-3 py-1.5 border ${!material ? "border-forest text-forest bg-surface-warm" : "border-neutral-300"}`}>
          Todos
        </Link>
        {MATERIAL_KEYS.map((key, idx) => (
          <Link key={key} href={`/mercado?material=${key}`} className={`label-mono px-3 py-1.5 border ${material === key ? "border-forest text-forest bg-surface-warm" : "border-neutral-300"}`}>
            {MATERIALES[idx]}
          </Link>
        ))}
      </div>

      {errorApi ? (
        <p className="text-sm text-red-600">No se pudo consultar la API.</p>
      ) : disponibles.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay emisiones con kilos disponibles ahora mismo{agotadas > 0 ? ` (${agotadas} ya vendidas por completo)` : ""}.
        </p>
      ) : (
        <div className="overflow-x-auto border border-neutral-300">
          <table className="w-full text-sm">
            <thead className="bg-surface-warm">
              <tr>
                <th className="text-left p-2 label-mono">Emisión</th>
                <th className="text-left p-2 label-mono">Material</th>
                <th className="text-left p-2 label-mono">Transformador</th>
                <th className="text-right p-2 label-mono">Disponible (kg)</th>
                <th className="text-right p-2 label-mono">Precio (USDT/kg)</th>
                <th className="text-right p-2 label-mono">Total si comprás todo</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {disponibles.map((e) => {
                const precio = Number(e.precioUSDTporKg) / 1_000_000;
                const kg = Number(e.kgDisponiblesPrimario);
                return (
                  <tr key={e.id} className="border-t border-neutral-200">
                    <td className="p-2 font-mono">#{e.id}</td>
                    <td className="p-2">{nombreMaterial(e.material)}</td>
                    <td className="p-2 font-mono text-xs">{e.transformadorWallet.slice(0, 6)}…{e.transformadorWallet.slice(-4)}</td>
                    <td className="p-2 text-right tabular-nums">{kg.toLocaleString("es-CR")} <span className="text-foreground/50">/ {Number(e.kgTransformadosOriginal).toLocaleString("es-CR")}</span></td>
                    <td className="p-2 text-right tabular-nums">{precio.toFixed(2)}</td>
                    <td className="p-2 text-right tabular-nums">{(precio * kg).toLocaleString("es-CR", { maximumFractionDigits: 2 })} USDT</td>
                    <td className="p-2 text-right">
                      <Link href={`/mercado/comprar?emision=${e.id}`} className="rounded-sm bg-forest px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-white hover:bg-forest-light">
                        Comprar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-foreground/60">
        ¿Sin USDT de prueba? <Link href="/mercado/faucet" className="text-forest hover:underline">Pedí USDT y POL de prueba</Link>.
      </p>
    </div>
  );
}
