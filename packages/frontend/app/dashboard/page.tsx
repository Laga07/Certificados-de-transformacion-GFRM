import { StatsBarChart, type StatsBarChartDatum } from "@/components/StatsBarChart";
import { CantonMap, type CantonRow } from "@/components/CantonMap";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Stats {
  totales: {
    usuarios: number;
    centros: number;
    centrosVerificados: number;
    municipalidades: number;
    transacciones: number;
    lotes: number;
    lotesCerrados: number;
  };
  porTipoPlastico: { tipoPlastico: string; transacciones: number; pesoGramosTotal: string }[];
  porTipoTransaccion: { tipo: string; transacciones: number }[];
}

interface TransaccionRow {
  id: string;
  origen: string;
  destino: string;
  pesoGramos: string;
  tipo: string;
  tipoPlastico: string;
  txHash: string;
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function acortar(direccion: string) {
  return `${direccion.slice(0, 6)}...${direccion.slice(-4)}`;
}

export default async function DashboardPage() {
  const [stats, transacciones, geografia] = await Promise.all([
    getJson<Stats>("/api/stats"),
    getJson<{ data: TransaccionRow[] }>("/api/transacciones?pageSize=10"),
    getJson<{ data: CantonRow[] }>("/api/stats/geografia"),
  ]);

  if (!stats) {
    return (
      <p className="text-neutral-500">
        No se pudo conectar con la API ({API_URL}). Corré{" "}
        <code className="text-forest">npm run dev:api</code> en{" "}
        <code>packages/backend</code> (y asegurate de que PostgreSQL esté arriba con{" "}
        <code className="text-forest">npm run db:up</code>).
      </p>
    );
  }

  const pesoPorTipo: StatsBarChartDatum[] = stats.porTipoPlastico
    .filter((row) => row.transacciones > 0)
    .map((row) => ({
      categoria: row.tipoPlastico,
      valor: Number(BigInt(row.pesoGramosTotal) / BigInt(1000)), // gramos -> kg
    }));

  const txPorTipo: StatsBarChartDatum[] = stats.porTipoTransaccion.map((row) => ({
    categoria: row.tipo,
    valor: row.transacciones,
  }));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatTile label="Usuarios" value={stats.totales.usuarios} />
        <StatTile
          label="Centros"
          value={stats.totales.centros}
          sub={`${stats.totales.centrosVerificados} verificados`}
        />
        <StatTile label="Municipalidades" value={stats.totales.municipalidades} />
        <StatTile label="Transacciones" value={stats.totales.transacciones} accent="gold" />
        <StatTile
          label="Lotes municipales"
          value={stats.totales.lotes}
          sub={`${stats.totales.lotesCerrados} cerrados`}
        />
      </section>

      <section>
        <h2 className="font-medium mb-2 text-navy">Actividad por provincia y cantón</h2>
        <p className="text-sm text-neutral-500 mb-3">
          El peso se atribuye a la residencia del usuario que entregó el plástico. Toca una
          provincia para ver el detalle por cantón.
        </p>
        <CantonMap data={geografia?.data ?? []} />
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-medium mb-2 text-navy">Peso reciclado por tipo de plástico (kg)</h2>
          <StatsBarChart data={pesoPorTipo} valueLabel="kg" accent="gold" />
        </div>
        <div>
          <h2 className="font-medium mb-2 text-navy">Transacciones por tipo</h2>
          <StatsBarChart data={txPorTipo} valueLabel="transacciones" accent="forest" />
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-2 text-navy">Últimas transacciones</h2>
        {!transacciones || transacciones.data.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin transacciones todavía.</p>
        ) : (
          <div className="overflow-x-auto border border-neutral-300">
            <table className="w-full text-sm">
              <thead className="bg-surface-warm">
                <tr>
                  <th className="text-left p-2 label-mono">ID</th>
                  <th className="text-left p-2 label-mono">Origen</th>
                  <th className="text-left p-2 label-mono">Destino</th>
                  <th className="text-right p-2 label-mono">Peso (g)</th>
                  <th className="text-left p-2 label-mono">Tipo</th>
                  <th className="text-left p-2 label-mono">Plástico</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.data.map((tx) => (
                  <tr key={tx.id} className="border-t border-neutral-200">
                    <td className="p-2 font-mono">{tx.id}</td>
                    <td className="p-2 font-mono">{acortar(tx.origen)}</td>
                    <td className="p-2 font-mono">{acortar(tx.destino)}</td>
                    <td className="p-2 text-right tabular-nums">{tx.pesoGramos}</td>
                    <td className="p-2">{tx.tipo}</td>
                    <td className="p-2">{tx.tipoPlastico}</td>
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

function StatTile({
  label,
  value,
  sub,
  accent = "forest",
}: {
  label: string;
  value: number;
  sub?: string;
  accent?: "forest" | "gold";
}) {
  return (
    <div className="border border-neutral-300 p-3">
      <p className="label-mono">{label}</p>
      <p className={`text-2xl font-heading font-semibold mt-1 ${accent === "gold" ? "text-gold" : "text-forest"}`}>
        {value.toLocaleString("es-CR")}
      </p>
      {sub ? <p className="text-xs text-neutral-500 mt-1">{sub}</p> : null}
    </div>
  );
}
