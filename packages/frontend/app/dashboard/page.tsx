import { StatsBarChart, type StatsBarChartDatum } from "@/components/StatsBarChart";
import { CantonMap, type CantonRow } from "@/components/CantonMap";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Stats {
  totales: {
    separadores: number;
    intermediarios: number;
    intermediariosVerificados: number;
    transformadores: number;
    transformadoresVerificados: number;
    compradores: number;
    lotes: number;
    entregas: number;
    emisiones: number;
    ventas: number;
  };
  porMaterial: { material: string; emisiones: number; kgTransformadosTotal: string }[];
}

interface EmisionRow {
  id: string;
  material: string;
  transformadorWallet: string;
  kgTransformadosOriginal: string;
  kgDisponiblesPrimario: string;
  precioUSDTporKg: string;
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
  const [stats, emisiones, geografia] = await Promise.all([
    getJson<Stats>("/api/stats"),
    getJson<{ data: EmisionRow[] }>("/api/emisiones?pageSize=10"),
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

  const kgPorMaterial: StatsBarChartDatum[] = stats.porMaterial
    .filter((row) => row.emisiones > 0)
    .map((row) => ({ categoria: row.material, valor: Number(row.kgTransformadosTotal) }));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatTile label="Separadores" value={stats.totales.separadores} />
        <StatTile
          label="Intermediarios"
          value={stats.totales.intermediarios}
          sub={`${stats.totales.intermediariosVerificados} verificados`}
        />
        <StatTile
          label="Transformadores"
          value={stats.totales.transformadores}
          sub={`${stats.totales.transformadoresVerificados} verificados`}
        />
        <StatTile label="Compradores" value={stats.totales.compradores} />
        <StatTile label="Entregas" value={stats.totales.entregas} accent="gold" />
        <StatTile label="Certificados emitidos" value={stats.totales.emisiones} sub={`${stats.totales.ventas} ventas`} />
      </section>

      <section>
        <h2 className="font-medium mb-2 text-navy">Separadores e intermediarios por provincia y cantón</h2>
        <p className="text-sm text-neutral-500 mb-3">
          El peso se atribuye a la residencia del separador que entregó el material.
        </p>
        <CantonMap data={geografia?.data ?? []} />
      </section>

      <section>
        <h2 className="font-medium mb-2 text-navy">Kg transformados por material</h2>
        <StatsBarChart data={kgPorMaterial} valueLabel="kg" accent="gold" />
      </section>

      <section>
        <h2 className="font-medium mb-2 text-navy">Últimas emisiones de certificado</h2>
        {!emisiones || emisiones.data.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin emisiones todavía.</p>
        ) : (
          <div className="overflow-x-auto border border-neutral-300">
            <table className="w-full text-sm">
              <thead className="bg-surface-warm">
                <tr>
                  <th className="text-left p-2 label-mono">ID</th>
                  <th className="text-left p-2 label-mono">Material</th>
                  <th className="text-left p-2 label-mono">Transformador</th>
                  <th className="text-right p-2 label-mono">Kg transformados</th>
                  <th className="text-right p-2 label-mono">Disponible</th>
                  <th className="text-right p-2 label-mono">Precio (USDT/kg)</th>
                </tr>
              </thead>
              <tbody>
                {emisiones.data.map((emision) => (
                  <tr key={emision.id} className="border-t border-neutral-200">
                    <td className="p-2 font-mono">{emision.id}</td>
                    <td className="p-2">{emision.material}</td>
                    <td className="p-2 font-mono">{acortar(emision.transformadorWallet)}</td>
                    <td className="p-2 text-right tabular-nums">{emision.kgTransformadosOriginal}</td>
                    <td className="p-2 text-right tabular-nums">{emision.kgDisponiblesPrimario}</td>
                    <td className="p-2 text-right tabular-nums">
                      {(Number(emision.precioUSDTporKg) / 1_000_000).toFixed(2)}
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
