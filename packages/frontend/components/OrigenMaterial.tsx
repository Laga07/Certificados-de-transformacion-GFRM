import type { OrigenDeclaracion } from "@/lib/api";
import { nombreProvinciaPorClave, PROVINCIA_ENUM_KEYS } from "@/lib/catalogos";
import { nombreCantonPorClave } from "@/lib/cantones";

// Origen del material de una declaracion: de que emisiones (lotes transformados) salen los
// kg declarados, cuantos separadores e intermediarios participaron y en que cantones se
// separo el material. Se usa en la constancia privada y en la verificacion publica.
export function OrigenMaterial({ origen, sincronizando = false }: { origen: OrigenDeclaracion; sincronizando?: boolean }) {
  if (sincronizando) {
    return (
      <p className="text-sm text-foreground/70">
        El retiro se registró hace instantes. El detalle del origen (cantones, separadores e intermediarios) se
        completa en uno o dos minutos, cuando la plataforma termina de procesar ese bloque. Recargá la página.
      </p>
    );
  }
  if (origen.tramos.length === 0 && origen.kgSinOrigen === "0") return null;

  return (
    <div className="flex flex-col gap-3">
      {origen.tramos.map((t) => (
        <div key={`${t.emisionId}-${t.kg}`} className="border border-neutral-300 p-3 text-sm flex flex-col gap-2 break-inside-avoid">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span>
              <strong>{Number(t.kg).toLocaleString("es-CR")} kg</strong> de la emisión{" "}
              <span className="font-mono">#{t.emisionId}</span>
            </span>
            <span className="text-xs text-foreground/60">
              {t.separadores} separador{t.separadores === 1 ? "" : "es"} · {t.intermediarios} intermediario
              {t.intermediarios === 1 ? "" : "s"}
            </span>
          </div>
          {t.cantones.length > 0 ? (
            <div className="text-xs text-foreground/70">
              <span className="label-mono">Material separado en</span>{" "}
              {t.cantones
                .map(
                  (c) =>
                    `${nombreCantonPorClave(c.provincia, c.cantonId, PROVINCIA_ENUM_KEYS)} (${nombreProvinciaPorClave(c.provincia)}): ${Number(c.kgAportados).toLocaleString("es-CR")} kg`,
                )
                .join(" · ")}
            </div>
          ) : null}
        </div>
      ))}
      {origen.kgSinOrigen !== "0" ? (
        <p className="text-xs text-amber-800">
          {Number(origen.kgSinOrigen).toLocaleString("es-CR")} kg no provienen de compras primarias de esta wallet (por
          ejemplo, certificados recibidos por transferencia): su origen no se puede detallar acá.
        </p>
      ) : null}
    </div>
  );
}
