"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";

// "Guardar PDF" usa el dialogo de impresion del navegador (Guardar como PDF): conserva el
// diseno de la constancia sin una libreria de PDF; los estilos @media print de globals.css
// ocultan menu, pie y botones.
export function AccionesConstancia() {
  return (
    <div className="no-print flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-sm bg-forest px-4 py-2 font-mono text-xs uppercase tracking-wider text-white hover:bg-forest-light"
      >
        Imprimir o guardar PDF
      </button>
      <span className="self-center text-xs text-foreground/60">
        En el diálogo de impresión elegí &ldquo;Guardar como PDF&rdquo; para archivarla.
      </span>
    </div>
  );
}

export function BorrarPendiente({ id }: { id: number }) {
  const router = useRouter();
  const [confirmar, setConfirmar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function borrar() {
    try {
      await apiFetch(`/api/declaraciones/${id}`, { method: "DELETE" });
      router.push("/declaraciones");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo borrar.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {confirmar ? (
        <>
          <span>¿Borrar esta declaración pendiente? No afecta a tus certificados.</span>
          <button type="button" onClick={borrar} className="text-red-700 hover:underline">
            Sí, borrar
          </button>
          <button type="button" onClick={() => setConfirmar(false)} className="text-foreground/60 hover:underline">
            Cancelar
          </button>
        </>
      ) : (
        <button type="button" onClick={() => setConfirmar(true)} className="text-xs text-red-700 hover:underline">
          Borrar esta declaración pendiente
        </button>
      )}
      {error ? <span className="text-red-600">{error}</span> : null}
    </div>
  );
}
