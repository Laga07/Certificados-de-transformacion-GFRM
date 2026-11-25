"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconCoin,
  IconRecyclingTriangle,
  IconShieldCheck,
  IconTruck,
  IconWallet,
  IconLayers,
} from "@/components/icons";
import { useEnVista, usePrefiereMenosMovimiento } from "./useEnVista";

// El recorrido de un lote real, con los numeros del ejemplo del documento de la plataforma
// (Tabla 12): 10.000 kg aceptados en origen -> 200 kg de merma en el compactador -> 294 kg
// de merma en la transformacion -> 9.506 kg transformados = 9.506 certificados.
const ESTACIONES = [
  {
    rol: "Separador",
    titulo: "Separa y entrega",
    detalle:
      "Una familia de Heredia entrega PET al centro de acopio de su cantón. Queda registrado a su nombre: quién, cuánto, dónde y cuándo.",
    kg: 10000,
    merma: 0,
    quienMerma: "",
    Icono: IconWallet,
  },
  {
    rol: "Centro de acopio",
    titulo: "Recibe y registra",
    detalle:
      "El centro, verificado por Green Foot, pesa el material, busca al separador por su cédula y registra la entrega. Él paga la transacción. Nace el lote.",
    kg: 10000,
    merma: 0,
    quienMerma: "",
    Icono: IconLayers,
  },
  {
    rol: "Compactador",
    titulo: "Traspaso en dos pasos",
    detalle:
      "El acopio declara el envío y el compactador confirma lo que de verdad llegó a su báscula. Lo que falta no desaparece: queda a cargo de quien lo perdió.",
    kg: 9800,
    merma: 200,
    quienMerma: "la absorbe el compactador",
    Icono: IconTruck,
  },
  {
    rol: "Transformador",
    titulo: "Transforma y emite",
    detalle:
      "La planta convierte el material en materia prima y declara los kilos efectivamente transformados. Por cada kilo se emite un Certificado de Transformación.",
    kg: 9506,
    merma: 294,
    quienMerma: "la absorbe el transformador",
    Icono: IconRecyclingTriangle,
  },
  {
    rol: "Empresa compradora",
    titulo: "Compra y se reparte",
    detalle:
      "Una empresa paga 9.506 USDT. En la misma transacción el contrato acredita a cada participante su parte, y cada uno la retira cuando quiere.",
    kg: 9506,
    merma: 0,
    quienMerma: "",
    Icono: IconCoin,
  },
  {
    rol: "Constancia",
    titulo: "Declara y verifica",
    detalle:
      "La empresa retira los certificados para su informe ante el Ministerio de Salud y archiva una constancia con QR. Cualquiera puede verificarla; nadie puede usar esos kilos de nuevo.",
    kg: 9506,
    merma: 0,
    quienMerma: "",
    Icono: IconShieldCheck,
  },
];

const INTERVALO_MS = 3600;

// Interpola el numero que se muestra entre el valor anterior y el nuevo.
function useNumeroAnimado(objetivo: number, reducido: boolean) {
  const [valor, setValor] = useState(objetivo);
  const desde = useRef(objetivo);
  useEffect(() => {
    const inicio = desde.current;
    if (reducido || inicio === objetivo) {
      desde.current = objetivo;
      void Promise.resolve().then(() => setValor(objetivo));
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const duracion = 900;
    const paso = (t: number) => {
      const p = Math.min(1, (t - t0) / duracion);
      const suave = 1 - Math.pow(1 - p, 3);
      setValor(Math.round(inicio + (objetivo - inicio) * suave));
      if (p < 1) raf = requestAnimationFrame(paso);
      else desde.current = objetivo;
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [objetivo, reducido]);
  return valor;
}

export function RecorridoLote() {
  const [paso, setPaso] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(true);
  const { ref, visible } = useEnVista<HTMLDivElement>({ unaVez: false, umbral: 0.35 });
  const reducido = usePrefiereMenosMovimiento();
  const activo = reproduciendo && visible === true && !reducido;

  useEffect(() => {
    if (!activo) return;
    const id = setInterval(() => setPaso((p) => (p + 1) % ESTACIONES.length), INTERVALO_MS);
    return () => clearInterval(id);
  }, [activo]);

  const estacion = ESTACIONES[paso];
  const kg = useNumeroAnimado(estacion.kg, reducido);
  const ultimo = ESTACIONES.length - 1;
  const avance = (paso / ultimo) * 100;
  const mermaAcumulada = ESTACIONES.slice(0, paso + 1).reduce((acc, e) => acc + e.merma, 0);

  function irA(i: number) {
    setPaso(i);
    setReproduciendo(false);
  }

  return (
    <div ref={ref} className="flex flex-col gap-8">
      {/* Pista */}
      <div className="px-3 sm:px-6 pt-14 pb-2">
       <div className="relative">
        {/* Marcador del lote, viaja sobre la pista (left = mismo % que el avance) */}
        <div
          className="sin-movimiento-reducido absolute -top-14 -translate-x-1/2 transition-[left] duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
          style={{ left: `${avance}%` }}
          aria-hidden="true"
        >
          <div className="flex flex-col items-center">
            <span className="whitespace-nowrap rounded-sm bg-gold px-2 py-1 font-mono text-[0.7rem] font-bold text-navy tabular-nums shadow-sm">
              {kg.toLocaleString("es-CR")} kg
            </span>
            <span className="h-3 w-px bg-gold" />
          </div>
        </div>

        {/* Linea base punteada (ruta) y avance */}
        <div className="relative h-1">
          <div className="absolute inset-0 border-t-2 border-dashed border-white/25" />
          <div
            className="sin-movimiento-reducido absolute left-0 top-0 h-[3px] -translate-y-px bg-gold transition-[width] duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
            style={{ width: `${avance}%` }}
          />
        </div>

        {/* Estaciones */}
        <ol className="relative -mt-[13px] flex justify-between">
          {ESTACIONES.map((e, i) => {
            const alcanzada = i <= paso;
            const actual = i === paso;
            return (
              <li key={e.rol} className="flex flex-col items-center gap-2 w-0">
                <button
                  type="button"
                  onClick={() => irA(i)}
                  aria-label={`Paso ${i + 1}: ${e.rol}`}
                  aria-current={actual ? "step" : undefined}
                  className={`h-6 w-6 shrink-0 rounded-full border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                    alcanzada ? "border-gold bg-gold" : "border-white/40 bg-navy"
                  } ${actual && activo ? "latido" : ""}`}
                />
                <span
                  className={`hidden sm:block whitespace-nowrap font-mono text-[0.62rem] uppercase tracking-wider ${
                    actual ? "text-gold" : alcanzada ? "text-white/80" : "text-white/40"
                  }`}
                >
                  {e.rol}
                </span>
              </li>
            );
          })}
        </ol>
       </div>
      </div>

      {/* Ficha del paso actual */}
      <div className="grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-start min-h-[11rem]">
        <span className="hidden md:flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 text-gold">
          <estacion.Icono className="h-7 w-7" />
        </span>
        <div key={paso} className="aparecer flex flex-col gap-2 max-w-xl">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-gold">
            Paso {paso + 1} de {ESTACIONES.length} · {estacion.rol}
          </span>
          <h3 className="text-2xl font-heading italic font-semibold text-white">{estacion.titulo}</h3>
          <p className="text-white/75 leading-relaxed">{estacion.detalle}</p>
          {estacion.merma > 0 ? (
            <p className="w-fit rounded-sm border border-clay/60 bg-clay/15 px-2 py-1 font-mono text-[0.7rem] text-[#f0b48a]">
              −{estacion.merma.toLocaleString("es-CR")} kg de merma · {estacion.quienMerma}
            </p>
          ) : null}
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-1 gap-3 font-mono text-xs text-white/70 md:text-right">
          <div>
            <dt className="uppercase tracking-wider text-white/45">Aceptado en origen</dt>
            <dd className="text-base text-white tabular-nums">{ESTACIONES[0].kg.toLocaleString("es-CR")} kg</dd>
          </div>
          <div>
            <dt className="uppercase tracking-wider text-white/45">Merma acumulada</dt>
            <dd className="text-base text-white tabular-nums">{mermaAcumulada.toLocaleString("es-CR")} kg</dd>
          </div>
        </dl>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setReproduciendo((r) => !r)}
          className="rounded-sm border border-white/30 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider text-white hover:border-gold hover:text-gold"
        >
          {reproduciendo && !reducido ? "Pausar" : "Reproducir"}
        </button>
        <button
          type="button"
          onClick={() => irA(Math.max(0, paso - 1))}
          disabled={paso === 0}
          className="rounded-sm px-2 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider text-white/70 hover:text-gold disabled:opacity-30"
        >
          ← Anterior
        </button>
        <button
          type="button"
          onClick={() => irA(Math.min(ultimo, paso + 1))}
          disabled={paso === ultimo}
          className="rounded-sm px-2 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider text-white/70 hover:text-gold disabled:opacity-30"
        >
          Siguiente →
        </button>
        <span className="font-mono text-[0.65rem] text-white/40">Tocá una estación para ir directo</span>
      </div>
    </div>
  );
}
