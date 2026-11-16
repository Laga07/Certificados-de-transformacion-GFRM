"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch, apiPut, ApiError, type Perfil, type TipoEntidad } from "@/lib/api";
import { API_URL } from "@/lib/apiUrl";
import { provinciaIdDesdeClave } from "@/lib/identidad";
import { SUBTIPOS_INTERMEDIARIO, TIPOS_SEPARADOR } from "@/lib/catalogos";
import { UbicacionField } from "@/components/UbicacionField";
import { EstadoBadge } from "@/components/EstadoBadge";

const TIPOS: { valor: TipoEntidad; label: string; ayuda: string }[] = [
  { valor: "SEPARADOR", label: "Separador", ayuda: "Hogar, comercio, industria, institución o recuperador." },
  { valor: "INTERMEDIARIO", label: "Intermediario", ayuda: "Recolector, centro de acopio, ruta municipal, compactador, transportista." },
  { valor: "TRANSFORMADOR", label: "Transformador", ayuda: "Convierte el material en materia prima y emite el certificado." },
  { valor: "COMPRADOR", label: "Comprador", ayuda: "Empresa que compra certificados para sus informes." },
];

const DOCUMENTOS_SUGERIDOS: Record<TipoEntidad, string> = {
  SEPARADOR: "Cédula de identidad (frente).",
  INTERMEDIARIO: "Cédula jurídica, personería vigente, permiso sanitario de funcionamiento (si aplica), cédula del representante.",
  TRANSFORMADOR: "Cédula jurídica, personería vigente, permiso sanitario de funcionamiento, cédula del representante.",
  COMPRADOR: "Cédula jurídica y cédula del representante.",
};

export function PerfilForm() {
  const [cargando, setCargando] = useState(true);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [tipo, setTipo] = useState<TipoEntidad>("SEPARADOR");
  const [razonSocial, setRazonSocial] = useState("");
  const [cedula, setCedula] = useState("");
  const [representante, setRepresentante] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correoContacto, setCorreoContacto] = useState("");
  const [direccion, setDireccion] = useState("");
  const [provinciaId, setProvinciaId] = useState(0);
  const [cantonId, setCantonId] = useState(1);
  const [subtipo, setSubtipo] = useState(0);
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const archivoRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    apiFetch<{ perfil: Perfil | null }>("/api/perfil")
      .then(({ perfil: p }) => {
        if (!p) return;
        setPerfil(p);
        setTipo(p.tipo);
        setRazonSocial(p.razonSocial);
        setCedula(p.cedula);
        setRepresentante(p.representante ?? "");
        setTelefono(p.telefono ?? "");
        setCorreoContacto(p.correoContacto ?? "");
        setDireccion(p.direccion ?? "");
        setProvinciaId(provinciaIdDesdeClave(p.provincia));
        setCantonId(p.cantonId);
        setSubtipo(p.subtipo ?? 0);
        setDescripcion(p.descripcion ?? "");
      })
      .catch(() => undefined)
      .finally(() => setCargando(false));
  }, []);

  async function guardar() {
    setGuardando(true);
    setMensaje(null);
    setError(null);
    try {
      const { perfil: p } = await apiPut<{ perfil: Perfil }>("/api/perfil", {
        tipo,
        razonSocial,
        cedula,
        representante: representante || null,
        telefono: telefono || null,
        correoContacto: correoContacto || null,
        direccion: direccion || null,
        provinciaId,
        cantonId,
        subtipo: tipo === "INTERMEDIARIO" || tipo === "SEPARADOR" ? subtipo : null,
        descripcion: descripcion || null,
      });
      setPerfil(p);
      setMensaje("Datos guardados.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function subirDocumento() {
    const archivo = archivoRef.current?.files?.[0];
    if (!archivo) return;
    setSubiendo(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("archivo", archivo);
      await apiFetch("/api/perfil/documentos", { method: "POST", body: form });
      const { perfil: p } = await apiFetch<{ perfil: Perfil }>("/api/perfil");
      setPerfil(p);
      if (archivoRef.current) archivoRef.current.value = "";
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo subir el documento.");
    } finally {
      setSubiendo(false);
    }
  }

  async function borrarDocumento(id: number) {
    try {
      await apiFetch(`/api/perfil/documentos/${id}`, { method: "DELETE" });
      const { perfil: p } = await apiFetch<{ perfil: Perfil }>("/api/perfil");
      setPerfil(p);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo borrar el documento.");
    }
  }

  if (cargando) return <p className="text-sm text-neutral-500">Cargando...</p>;

  const esPersonaFisica = tipo === "SEPARADOR";
  const puedeGuardar = razonSocial.trim().length >= 2 && cedula.trim().length >= 3;

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {perfil ? (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>Estado de revisión:</span>
          <EstadoBadge estado={perfil.estadoRevision} />
          {perfil.notasRevisor ? (
            <span className="text-foreground/70">Nota del verificador: {perfil.notasRevisor}</span>
          ) : null}
        </div>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="font-heading font-semibold text-navy">Identidad</h2>

        <fieldset className="grid gap-2 sm:grid-cols-2">
          <legend className="text-sm mb-2">¿Qué sos en la cadena de reciclaje?</legend>
          {TIPOS.map((t) => (
            <label
              key={t.valor}
              className={`border p-3 cursor-pointer flex flex-col gap-1 ${tipo === t.valor ? "border-forest bg-surface-warm" : "border-neutral-300"}`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <input type="radio" name="tipo" checked={tipo === t.valor} onChange={() => setTipo(t.valor)} />
                {t.label}
              </span>
              <span className="text-xs text-foreground/60">{t.ayuda}</span>
            </label>
          ))}
        </fieldset>

        <label className="flex flex-col gap-1 text-sm">
          {esPersonaFisica ? "Nombre completo" : "Razón social"}
          <input
            type="text"
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
            className="rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {esPersonaFisica ? "Cédula de identidad" : "Cédula jurídica"}
          <input
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            placeholder={esPersonaFisica ? "1-2345-6789" : "3-101-123456"}
            className="rounded border border-neutral-300 bg-white px-3 py-2"
          />
          <span className="text-xs text-foreground/60">
            Se guarda acá en claro (solo la ven los administradores). A la cadena viaja únicamente
            un hash que no se puede revertir.
          </span>
        </label>

        {!esPersonaFisica ? (
          <label className="flex flex-col gap-1 text-sm">
            Representante legal
            <input
              type="text"
              value={representante}
              onChange={(e) => setRepresentante(e.target.value)}
              className="rounded border border-neutral-300 bg-white px-3 py-2"
            />
          </label>
        ) : null}

        {tipo === "INTERMEDIARIO" ? (
          <label className="flex flex-col gap-1 text-sm">
            Tipo de intermediario
            <select value={subtipo} onChange={(e) => setSubtipo(Number(e.target.value))} className="rounded border border-neutral-300 bg-white px-3 py-2">
              {SUBTIPOS_INTERMEDIARIO.map((nombre, index) => (
                <option key={nombre} value={index}>{nombre}</option>
              ))}
            </select>
          </label>
        ) : null}
        {tipo === "SEPARADOR" ? (
          <label className="flex flex-col gap-1 text-sm">
            Tipo de separador
            <select value={subtipo} onChange={(e) => setSubtipo(Number(e.target.value))} className="rounded border border-neutral-300 bg-white px-3 py-2">
              {TIPOS_SEPARADOR.map((nombre, index) => (
                <option key={nombre} value={index}>{nombre}</option>
              ))}
            </select>
          </label>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading font-semibold text-navy">Contacto y ubicación</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Teléfono
            <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="rounded border border-neutral-300 bg-white px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Correo de contacto (si es distinto al de la cuenta)
            <input type="email" value={correoContacto} onChange={(e) => setCorreoContacto(e.target.value)} className="rounded border border-neutral-300 bg-white px-3 py-2" />
          </label>
        </div>
        <UbicacionField provinciaId={provinciaId} cantonId={cantonId} onChangeProvincia={setProvinciaId} onChangeCanton={setCantonId} />
        <label className="flex flex-col gap-1 text-sm">
          Dirección exacta
          <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} className="rounded border border-neutral-300 bg-white px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Descripción de la operación (opcional)
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            placeholder="Qué materiales manejás, volumen aproximado mensual, desde cuándo operás..."
            className="rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={guardar}
          disabled={!puedeGuardar || guardando}
          className="rounded bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-light disabled:opacity-50"
        >
          {guardando ? "Guardando..." : perfil ? "Guardar cambios" : "Guardar datos"}
        </button>
        {mensaje ? <span className="text-sm text-forest">{mensaje}</span> : null}
        {error ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>

      <section className="flex flex-col gap-3 border-t border-neutral-300 pt-6">
        <h2 className="font-heading font-semibold text-navy">Documentos</h2>
        <p className="text-sm text-foreground/70">
          Sugeridos para {TIPOS.find((t) => t.valor === tipo)?.label.toLowerCase()}: {DOCUMENTOS_SUGERIDOS[tipo]} PDF, JPG o
          PNG, máximo 5 MB cada uno.
        </p>
        {!perfil ? (
          <p className="text-xs text-amber-700">Guardá los datos primero para poder adjuntar documentos.</p>
        ) : (
          <>
            {perfil.documentos.length > 0 ? (
              <ul className="flex flex-col gap-1 text-sm">
                {perfil.documentos.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 border border-neutral-200 px-3 py-2">
                    <a href={`${API_URL}/api/perfil/documentos/${d.id}`} target="_blank" rel="noreferrer" className="text-forest hover:underline">
                      {d.nombre}
                    </a>
                    <span className="text-xs text-foreground/60">{(d.tamano / 1024).toFixed(0)} KB</span>
                    <button type="button" onClick={() => borrarDocumento(d.id)} className="text-xs text-red-700 hover:underline">
                      Borrar
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-foreground/60">Sin documentos todavía.</p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <input ref={archivoRef} type="file" accept="application/pdf,image/jpeg,image/png" className="text-sm" />
              <button
                type="button"
                onClick={subirDocumento}
                disabled={subiendo}
                className="rounded border border-forest px-3 py-1.5 text-sm text-forest hover:bg-surface-warm disabled:opacity-50"
              >
                {subiendo ? "Subiendo..." : "Subir documento"}
              </button>
            </div>
          </>
        )}
      </section>

      {perfil ? (
        <p className="text-sm text-foreground/70 border-t border-neutral-300 pt-4">
          Siguiente paso: vinculá tu wallet en{" "}
          <Link href="/cuenta" className="text-forest hover:underline">Mi cuenta</Link> y registrate on-chain como{" "}
          <Link href={`/registro/${tipo.toLowerCase()}`} className="text-forest hover:underline">{tipo.toLowerCase()}</Link>.
          El formulario se llena solo con estos datos.
        </p>
      ) : null}
    </div>
  );
}
