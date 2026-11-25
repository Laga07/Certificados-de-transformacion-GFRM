"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { apiFetch, apiPost, ApiError, type Cuenta, type Declaracion } from "@/lib/api";
import { MATERIALES } from "@/lib/catalogos";
import { useSaldosCertificados } from "@/lib/useSaldosCertificados";
import { RetirarYConfirmar } from "../RetirarYConfirmar";

type TipoPeriodo = "anual" | "semestral" | "trimestral" | "mensual";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"];
const OPCIONES_NUMERO: Record<TipoPeriodo, string[]> = {
  anual: [],
  semestral: ["1.er semestre", "2.º semestre"],
  trimestral: ["1.er trimestre", "2.º trimestre", "3.er trimestre", "4.º trimestre"],
  mensual: MESES,
};

const ENTIDADES_SUGERIDAS = [
  "Ministerio de Salud de Costa Rica",
  "Auditoría interna / reporte de sostenibilidad",
  "Municipalidad",
];

export function NuevaDeclaracionForm({
  mercadoAddress,
  certificados,
  materialInicial,
}: {
  mercadoAddress: `0x${string}`;
  certificados: (`0x${string}` | undefined)[];
  materialInicial: number;
}) {
  const { address } = useAccount();
  const { kg: saldos } = useSaldosCertificados(certificados, address);
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);

  const anioActual = new Date().getFullYear();
  const [material, setMaterial] = useState(materialInicial);
  const [cantidadKg, setCantidadKg] = useState("");
  const [tipo, setTipo] = useState<TipoPeriodo>("anual");
  const [anio, setAnio] = useState(anioActual);
  const [numero, setNumero] = useState(1);
  const [entidad, setEntidad] = useState(ENTIDADES_SUGERIDAS[0]);
  const [referencia, setReferencia] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [declaracion, setDeclaracion] = useState<Declaracion | null>(null);

  useEffect(() => {
    apiFetch<{ cuenta: Cuenta }>("/api/auth/me")
      .then((r) => setCuenta(r.cuenta))
      .catch(() => setCuenta(null));
  }, []);

  const saldo = saldos[material];
  const kgNumero = /^\d+$/.test(cantidadKg) ? BigInt(cantidadKg) : BigInt(0);
  const excedeSaldo = saldo !== null && kgNumero > saldo;
  const walletVinculada = cuenta?.wallet ?? null;
  const walletCoincide = Boolean(address && walletVinculada && address.toLowerCase() === walletVinculada.toLowerCase());
  const puedeCrear =
    walletCoincide && kgNumero > BigInt(0) && !excedeSaldo && entidad.trim().length >= 3 && (tipo === "anual" || numero >= 1);

  async function crear() {
    setError(null);
    setCreando(true);
    try {
      const { declaracion: d } = await apiPost<{ declaracion: Declaracion }>("/api/declaraciones", {
        materialIndex: material,
        cantidadKg: Number(kgNumero),
        periodo: { tipo, anio, numero: tipo === "anual" ? 0 : numero },
        entidadDestino: entidad.trim(),
        referencia: referencia.trim() || null,
        descripcion: descripcion.trim() || null,
      });
      setDeclaracion(d);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo preparar la declaración.");
    } finally {
      setCreando(false);
    }
  }

  // Paso 2: los datos quedaron guardados con su huella; falta el retiro on-chain.
  if (declaracion) {
    return (
      <div className="flex flex-col gap-5 max-w-2xl">
        <section className="border border-forest bg-surface-warm p-5 flex flex-col gap-2 text-sm">
          <span className="label-mono text-forest">Paso 2 de 2 · Declaración preparada</span>
          <p>
            <strong>{declaracion.cantidadKg} kg</strong> de {MATERIALES[declaracion.materialIndex].toLowerCase()} para{" "}
            <strong>{declaracion.entidadDestino}</strong>, {declaracion.periodoTexto.toLowerCase()}.
          </p>
          <p className="text-foreground/70">
            Código de la constancia: <span className="font-mono">{declaracion.codigo}</span>
            <br />
            Huella digital (va a quedar grabada on-chain):{" "}
            <span className="font-mono text-xs break-all">{declaracion.informeRef}</span>
          </p>
        </section>
        <p className="text-sm text-foreground/70">
          Al firmar, tu wallet quema {declaracion.cantidadKg} certificados de{" "}
          {MATERIALES[declaracion.materialIndex].toLowerCase()}. Esta operación es definitiva.
        </p>
        <RetirarYConfirmar declaracion={declaracion} mercadoAddress={mercadoAddress} />
        <p className="text-xs text-foreground/60">
          Si no firmás ahora, la declaración queda como pendiente en{" "}
          <Link href="/declaraciones" className="text-forest hover:underline">
            Mis declaraciones
          </Link>{" "}
          y podés completarla o borrarla después.
        </p>
      </div>
    );
  }

  if (cuenta && !walletVinculada) {
    return (
      <p className="text-sm text-amber-700">
        Para declarar, primero vinculá tu wallet de comprador a tu cuenta en{" "}
        <Link href="/cuenta" className="text-forest hover:underline">
          Mi cuenta
        </Link>
        . La declaración queda a nombre de la empresa de tu perfil y de esa wallet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {walletVinculada && !walletCoincide ? (
        <p className="text-sm text-amber-700">
          La wallet conectada no es la vinculada a tu cuenta ({walletVinculada.slice(0, 6)}…{walletVinculada.slice(-4)}).
          Cambiala en MetaMask para continuar.
        </p>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="font-heading font-semibold text-navy">Qué declarás</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Material
            <select value={material} onChange={(e) => setMaterial(Number(e.target.value))} className="rounded border border-neutral-300 bg-white px-3 py-2">
              {MATERIALES.map((nombre, i) => (
                <option key={nombre} value={i}>
                  {nombre} — {saldos[i] === null ? "…" : `${saldos[i]!.toLocaleString("es-CR")} kg disponibles`}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Cantidad (kg enteros)
            <input
              type="number"
              min={1}
              step={1}
              value={cantidadKg}
              onChange={(e) => setCantidadKg(e.target.value)}
              className="rounded border border-neutral-300 bg-white px-3 py-2"
            />
            {excedeSaldo ? <span className="text-xs text-red-600">Tenés {saldo!.toLocaleString("es-CR")} kg de este material.</span> : null}
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading font-semibold text-navy">Para qué informe</h2>
        <label className="flex flex-col gap-1 text-sm">
          Entidad a la que se presenta
          <input list="entidades" value={entidad} onChange={(e) => setEntidad(e.target.value)} className="rounded border border-neutral-300 bg-white px-3 py-2" />
          <datalist id="entidades">
            {ENTIDADES_SUGERIDAS.map((e) => (
              <option key={e} value={e} />
            ))}
          </datalist>
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            Período
            <select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value as TipoPeriodo);
                setNumero(1);
              }}
              className="rounded border border-neutral-300 bg-white px-3 py-2"
            >
              <option value="anual">Anual</option>
              <option value="semestral">Semestral</option>
              <option value="trimestral">Trimestral</option>
              <option value="mensual">Mensual</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Año
            <select value={anio} onChange={(e) => setAnio(Number(e.target.value))} className="rounded border border-neutral-300 bg-white px-3 py-2">
              {[anioActual - 1, anioActual, anioActual + 1].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          {tipo !== "anual" ? (
            <label className="flex flex-col gap-1 text-sm">
              {tipo === "mensual" ? "Mes" : tipo === "trimestral" ? "Trimestre" : "Semestre"}
              <select value={numero} onChange={(e) => setNumero(Number(e.target.value))} className="rounded border border-neutral-300 bg-white px-3 py-2">
                {OPCIONES_NUMERO[tipo].map((texto, i) => (
                  <option key={texto} value={i + 1}>
                    {texto}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        <label className="flex flex-col gap-1 text-sm">
          Número de expediente o referencia del informe (opcional)
          <input value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ej. MS-DPAH-2026-00123" className="rounded border border-neutral-300 bg-white px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Descripción (opcional)
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            placeholder="Ej. Compensación de envases PET puestos en el mercado durante 2026, según Ley 9786."
            className="rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
        <p className="text-xs text-foreground/60">
          Estos datos forman parte de la constancia pública: cualquiera que tenga el código puede verlos.
        </p>
      </section>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={crear}
          disabled={!puedeCrear || creando}
          className="w-fit rounded bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-light disabled:opacity-50"
        >
          {creando ? "Preparando..." : "Continuar: preparar la declaración"}
        </button>
        <span className="text-xs text-foreground/60">Paso 1 de 2. Todavía no se quema nada: eso pasa en el paso 2, cuando firmás.</span>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
