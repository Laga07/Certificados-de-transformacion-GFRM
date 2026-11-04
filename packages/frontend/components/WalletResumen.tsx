"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Resumen {
  totales: {
    transacciones: number;
    pesoGramosTotal: string;
  };
  porTipoPlastico: { tipoPlastico: string; transacciones: number; pesoGramosTotal: string }[];
}

export function WalletResumen({ address }: { address: `0x${string}` }) {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setCargando(true);
      try {
        const res = await fetch(`${API_URL}/api/wallets/${address}/resumen`);
        const data = res.ok ? await res.json() : null;
        if (!cancelado) setResumen(data);
      } catch {
        if (!cancelado) setResumen(null);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [address]);

  if (cargando) {
    return <p className="text-sm text-neutral-500">Cargando tu historial de reciclaje...</p>;
  }

  if (!resumen || resumen.totales.transacciones === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Todavía no tenés transacciones registradas en el indexer.
      </p>
    );
  }

  const kg = Number(BigInt(resumen.totales.pesoGramosTotal) / BigInt(1000));

  return (
    <div className="rounded-xl border border-neutral-200 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap gap-6">
        <div>
          <p className="text-3xl font-heading font-semibold text-forest">
            {kg.toLocaleString("es-CR")} kg
          </p>
          <p className="text-xs text-neutral-500 mt-1">Plástico total reciclado</p>
        </div>
        <div>
          <p className="text-3xl font-heading font-semibold text-gold">
            {resumen.totales.transacciones}
          </p>
          <p className="text-xs text-neutral-500 mt-1">Transacciones registradas</p>
        </div>
      </div>

      {resumen.porTipoPlastico.length > 0 ? (
        <div>
          <p className="text-xs text-neutral-500 mb-2">Por tipo de plástico</p>
          <ul className="flex flex-wrap gap-2">
            {resumen.porTipoPlastico.map((row) => (
              <li
                key={row.tipoPlastico}
                className="rounded-full border border-neutral-200 bg-surface-warm px-3 py-1 text-xs text-foreground/70"
              >
                <span className="font-medium text-navy">{row.tipoPlastico}</span>{" "}
                &middot; {(Number(BigInt(row.pesoGramosTotal) / BigInt(1000))).toLocaleString("es-CR")} kg
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
