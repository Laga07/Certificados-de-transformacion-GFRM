"use client";

import { useEffect, useState } from "react";
import { formatUnits } from "viem";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Resumen {
  comoSeparador: { entregas: number; pesoGramosTotal: string };
  comoIntermediarioOTransformador: { entregasRecibidas: number; pesoGramosTotal: string };
  pagos: {
    acreditados: number;
    montoAcreditadoTotal: string;
    retirados: number;
    montoRetiradoTotal: string;
  };
  comoComprador: {
    ventas: number;
    kgCompradosTotal: string;
    valorPagadoTotal: string;
    certificadosRetirados: number;
    kgRetiradosTotal: string;
  };
}

function kg(gramos: string) {
  return Number(BigInt(gramos) / BigInt(1000)).toLocaleString("es-CR");
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
    return <p className="text-sm text-neutral-500">Cargando tu historial...</p>;
  }

  if (!resumen) {
    return <p className="text-sm text-neutral-500">No se pudo cargar tu historial del indexer.</p>;
  }

  const sinActividad =
    resumen.comoSeparador.entregas === 0 &&
    resumen.comoIntermediarioOTransformador.entregasRecibidas === 0 &&
    resumen.pagos.acreditados === 0 &&
    resumen.comoComprador.ventas === 0;

  if (sinActividad) {
    return <p className="text-sm text-neutral-500">Todavía no tenés actividad registrada en el indexer.</p>;
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap gap-6">
        {resumen.comoSeparador.entregas > 0 ? (
          <Metrica
            valor={`${kg(resumen.comoSeparador.pesoGramosTotal)} kg`}
            etiqueta={`Entregado como separador (${resumen.comoSeparador.entregas})`}
            color="forest"
          />
        ) : null}
        {resumen.comoIntermediarioOTransformador.entregasRecibidas > 0 ? (
          <Metrica
            valor={`${kg(resumen.comoIntermediarioOTransformador.pesoGramosTotal)} kg`}
            etiqueta={`Recibido como intermediario/transformador (${resumen.comoIntermediarioOTransformador.entregasRecibidas})`}
            color="gold"
          />
        ) : null}
        {resumen.pagos.acreditados > 0 ? (
          <Metrica
            valor={`${formatUnits(BigInt(resumen.pagos.montoAcreditadoTotal), 6)} USDT`}
            etiqueta={`Acreditado en ventas (${resumen.pagos.acreditados})`}
            color="forest"
          />
        ) : null}
        {resumen.comoComprador.ventas > 0 ? (
          <Metrica
            valor={`${kg(resumen.comoComprador.kgCompradosTotal)} kg`}
            etiqueta={`Certificados comprados (${resumen.comoComprador.ventas})`}
            color="gold"
          />
        ) : null}
      </div>
      <p className="text-xs text-neutral-500">
        Retirado hasta ahora: {formatUnits(BigInt(resumen.pagos.montoRetiradoTotal), 6)} USDT &middot; ver saldo
        pendiente en vivo en{" "}
        <a href="/mercado/pagos" className="text-forest hover:underline">
          Mis pagos
        </a>
        .
      </p>
    </div>
  );
}

function Metrica({ valor, etiqueta, color }: { valor: string; etiqueta: string; color: "forest" | "gold" }) {
  return (
    <div>
      <p className={`text-2xl font-heading font-semibold ${color === "forest" ? "text-forest" : "text-gold"}`}>
        {valor}
      </p>
      <p className="text-xs text-neutral-500 mt-1">{etiqueta}</p>
    </div>
  );
}
