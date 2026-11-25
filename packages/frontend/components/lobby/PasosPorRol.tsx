"use client";

import Link from "next/link";
import { useState } from "react";

// Pasos concretos para empezar, segun el rol. Es una secuencia real (cada paso necesita el
// anterior), por eso va numerada.
const ROLES = [
  {
    id: "separador",
    nombre: "Separador",
    quien: "Hogar, comercio, institución o recuperador",
    gana: "35 % de cada venta, en proporción a los kilos que entregaste",
    pasos: [
      { t: "Creá tu cuenta", d: "Con tu correo. Confirmalo desde el enlace que te llega." },
      { t: "Completá tus datos y vinculá tu wallet", d: "Nombre, cédula y cantón. A la blockchain solo viaja una huella irreversible de tu cédula." },
      { t: "Registrate como separador", d: "Una sola vez, desde tu wallet." },
      { t: "Entregá tu material", d: "El centro de acopio te busca por cédula y registra el peso. No pagás nada por entregar." },
      { t: "Cobrá", d: "Cuando se vende el certificado de tu material, tu parte queda acreditada en “Mis pagos”." },
    ],
    cta: { href: "/registro/separador", texto: "Registrarme como separador" },
  },
  {
    id: "intermediario",
    nombre: "Intermediario",
    quien: "Recolector, centro de acopio, ruta municipal, compactador, transportista",
    gana: "20 % de cada venta, repartido entre quienes movieron el lote",
    pasos: [
      { t: "Creá tu cuenta y cargá tu entidad", d: "Razón social, cédula jurídica, contacto y documentos (personería, permisos)." },
      { t: "Registrate y esperá la verificación", d: "Green Foot revisa tus documentos y te habilita on-chain." },
      { t: "Registrá entregas", d: "Recibís material de separadores y armás lotes (hasta 60 separadores por lote)." },
      { t: "Traspasá lotes", d: "En dos pasos: vos declarás el envío, quien recibe confirma el peso real." },
    ],
    cta: { href: "/registro/intermediario", texto: "Registrarme como intermediario" },
  },
  {
    id: "transformador",
    nombre: "Transformador",
    quien: "Planta que convierte el material en materia prima",
    gana: "30 % de cada venta del certificado que emitís",
    pasos: [
      { t: "Creá tu cuenta y cargá tu entidad", d: "Con los permisos de funcionamiento de la planta." },
      { t: "Registrate y esperá la verificación", d: "Green Foot revisa y te habilita on-chain." },
      { t: "Recibí lotes", d: "Confirmás el peso que de verdad entra a tu planta." },
      { t: "Transformá y emití", d: "Declarás los kilos transformados y fijás el precio. Se emite un certificado por kilo." },
    ],
    cta: { href: "/registro/transformador", texto: "Registrarme como transformador" },
  },
  {
    id: "comprador",
    nombre: "Comprador",
    quien: "Empresa que necesita demostrar material transformado",
    gana: "Certificados verificables para sus informes de cumplimiento (Ley 9786)",
    pasos: [
      { t: "Creá la cuenta de tu empresa", d: "Razón social y cédula jurídica: van en tus constancias." },
      { t: "Registrate como comprador", d: "Inmediato, sin verificación previa." },
      { t: "Comprá en el catálogo", d: "Elegís material y kilos. Pagás en USDT y el reparto ocurre en la misma transacción." },
      { t: "Declará y archivá", d: "Retirás los certificados para tu informe y guardás la constancia con QR verificable." },
    ],
    cta: { href: "/registro/comprador", texto: "Registrarme como comprador" },
  },
];

export function PasosPorRol({ conSesion }: { conSesion: boolean }) {
  const [activo, setActivo] = useState(ROLES[0].id);
  const rol = ROLES.find((r) => r.id === activo)!;

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="Elegí tu rol" className="flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            id={`tab-${r.id}`}
            aria-selected={activo === r.id}
            aria-controls={`panel-${r.id}`}
            onClick={() => setActivo(r.id)}
            className={`rounded-sm border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              activo === r.id ? "border-forest bg-forest text-white" : "border-neutral-300 text-foreground hover:border-forest hover:text-forest"
            }`}
          >
            {r.nombre}
          </button>
        ))}
      </div>

      <div
        key={rol.id}
        role="tabpanel"
        id={`panel-${rol.id}`}
        aria-labelledby={`tab-${rol.id}`}
        className="aparecer grid gap-6 lg:grid-cols-[1fr_1.4fr] border border-neutral-300 bg-surface-warm p-6"
      >
        <div className="flex flex-col gap-3">
          <span className="label-mono">Quién</span>
          <p className="text-foreground/80">{rol.quien}</p>
          <span className="label-mono mt-2">Qué recibe</span>
          <p className="font-heading text-lg font-semibold text-navy">{rol.gana}</p>
          <Link
            href={conSesion ? rol.cta.href : "/crear-cuenta"}
            className="mt-2 w-fit rounded-sm bg-forest px-4 py-2 font-mono text-xs uppercase tracking-wider text-white hover:bg-forest-light"
          >
            {conSesion ? rol.cta.texto : "Crear cuenta para empezar"}
          </Link>
        </div>
        <ol className="flex flex-col gap-4">
          {rol.pasos.map((p, i) => (
            <li key={p.t} className="aparecer flex gap-4" style={{ animationDelay: `${i * 90}ms` }}>
              <span className="font-heading italic text-2xl text-gold w-6 shrink-0 leading-none">{i + 1}</span>
              <div>
                <p className="font-semibold text-navy">{p.t}</p>
                <p className="text-sm text-foreground/70">{p.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
