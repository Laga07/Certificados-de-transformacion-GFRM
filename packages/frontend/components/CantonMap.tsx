import { PROVINCIAS, PROVINCIA_ENUM_KEYS } from "@/lib/catalogos";

export interface CantonRow {
  provincia: string;
  cantonId: number;
  separadores: number;
  intermediariosVerificados: number;
  pesoGramosTotal: string;
}

export function CantonMap({ data }: { data: CantonRow[] }) {
  const porProvincia = PROVINCIA_ENUM_KEYS.map((key, index) => {
    const cantones = data
      .filter((row) => row.provincia === key)
      .sort((a, b) => a.cantonId - b.cantonId);

    const totales = cantones.reduce(
      (acc, c) => ({
        separadores: acc.separadores + c.separadores,
        intermediariosVerificados: acc.intermediariosVerificados + c.intermediariosVerificados,
        pesoGramos: acc.pesoGramos + BigInt(c.pesoGramosTotal),
      }),
      { separadores: 0, intermediariosVerificados: 0, pesoGramos: BigInt(0) },
    );

    return { key, nombre: PROVINCIAS[index], cantones, totales };
  });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {porProvincia.map((p) => (
        <details
          key={p.key}
          className="group rounded-xl border border-neutral-200 open:border-forest transition-colors"
        >
          <summary className="cursor-pointer list-none p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-navy">{p.nombre}</h3>
              <span className="text-foreground/40 group-open:rotate-180 transition-transform">
                &darr;
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
              <span>
                <strong className="text-forest">{p.totales.separadores}</strong> separadores
              </span>
              <span>
                <strong className="text-forest">{p.totales.intermediariosVerificados}</strong> intermediarios
              </span>
              <span>
                <strong className="text-gold">
                  {Number(p.totales.pesoGramos / BigInt(1000)).toLocaleString("es-CR")} kg
                </strong>
              </span>
            </div>
          </summary>
          <div className="px-4 pb-4">
            {p.cantones.length === 0 ? (
              <p className="text-xs text-neutral-500">
                Sin datos registrados todavía en esta provincia.
              </p>
            ) : (
              <ul className="flex flex-col gap-1 text-xs text-foreground/70 border-t border-neutral-100 pt-2">
                {p.cantones.map((c) => (
                  <li key={c.cantonId} className="flex justify-between gap-2">
                    <span>Cantón {c.cantonId}</span>
                    <span className="text-right">
                      {c.separadores} separadores &middot; {c.intermediariosVerificados} intermediarios &middot;{" "}
                      {Number(BigInt(c.pesoGramosTotal) / BigInt(1000)).toLocaleString("es-CR")} kg
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
