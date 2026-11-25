"use client";

import { useEffect, useState } from "react";
import { useEnVista, usePrefiereMenosMovimiento } from "./useEnVista";

// Reparto real del ejemplo del documento: venta de 9.506 certificados a 1 USDT. Las bases se
// calculan sobre los 10.000 kg aceptados en origen; la merma se descuenta a quien la genero.
const TOTAL = 9506;
const PARTES = [
  { quien: "Separadores", base: "35 %", monto: 3500, detalle: "35 % de 10.000, en proporción a lo que entregó cada uno", color: "bg-forest" },
  { quien: "Intermediarios", base: "20 %", monto: 1800, detalle: "1.000 al acopio · 800 al compactador (1.000 − 200 de su merma)", color: "bg-forest-light" },
  { quien: "Transformador", base: "30 %", monto: 2706, detalle: "3.000 − 294 de su propia merma", color: "bg-clay" },
  { quien: "Plataforma", base: "15 %", monto: 1500, detalle: "Green Foot. Nunca cobra por la merma de otro", color: "bg-gold" },
];

function Contador({ hasta, activo, reducido }: { hasta: number; activo: boolean; reducido: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!activo) return;
    if (reducido) {
      void Promise.resolve().then(() => setV(hasta));
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const paso = (t: number) => {
      const p = Math.min(1, (t - t0) / 1400);
      setV(Math.round(hasta * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [activo, hasta, reducido]);
  return <>{v.toLocaleString("es-CR")}</>;
}

export function RepartoAnimado() {
  const { ref, visible } = useEnVista<HTMLDivElement>({ unaVez: true, umbral: 0.4 });
  const reducido = usePrefiereMenosMovimiento();
  const activo = visible === true;

  return (
    <div ref={ref} className="flex flex-col gap-5">
      <div className="flex h-10 w-full overflow-hidden rounded-sm border border-neutral-300 bg-background" role="img"
        aria-label="Reparto de una venta de 9.506 USDT: separadores 3.500, intermediarios 1.800, transformador 2.706, plataforma 1.500">
        {PARTES.map((p, i) => (
          <div
            key={p.quien}
            className={`sin-movimiento-reducido ${p.color} h-full transition-[width] duration-[1100ms] ease-out`}
            style={{
              width: activo || reducido ? `${(p.monto / TOTAL) * 100}%` : "0%",
              transitionDelay: `${i * 160}ms`,
              marginRight: i < PARTES.length - 1 ? "2px" : 0,
            }}
          />
        ))}
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PARTES.map((p) => (
          <li key={p.quien} className="flex gap-3">
            <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-sm ${p.color}`} aria-hidden="true" />
            <div className="flex flex-col gap-0.5">
              <span className="label-mono">
                {p.quien} · base {p.base}
              </span>
              <span className="font-heading text-2xl font-semibold text-navy tabular-nums">
                <Contador hasta={p.monto} activo={activo} reducido={reducido} /> <span className="text-sm text-foreground/60">USDT</span>
              </span>
              <span className="text-xs text-foreground/65">{p.detalle}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-sm text-foreground/70">
        Total: <strong className="tabular-nums">9.506 USDT</strong>, exactamente lo que pagó la empresa. Ni un centavo queda
        en manos de la plataforma más allá de su 15 %: cada participante retira lo suyo directamente del contrato.
      </p>
    </div>
  );
}
