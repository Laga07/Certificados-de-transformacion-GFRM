"use client";

import { useState } from "react";
import { apiPost, ApiError } from "@/lib/api";

// Aviso persistente mientras la cuenta no haya confirmado su correo. No bloquea el uso del
// sitio (el JWT sigue siendo valido), pero sin correo verificado no hay forma de recuperar
// la contrasena ni de recibir avisos del verificador.
export function EmailVerificacionBanner() {
  const [estado, setEstado] = useState<"idle" | "enviando" | "enviado" | "error">("idle");
  const [mensaje, setMensaje] = useState("");

  async function reenviar() {
    setEstado("enviando");
    try {
      await apiPost("/api/auth/reenviar-verificacion", {});
      setEstado("enviado");
    } catch (error) {
      setEstado("error");
      setMensaje(error instanceof ApiError ? error.message : "No se pudo reenviar el correo.");
    }
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-900 flex flex-wrap items-center gap-3">
      <span>
        Tu correo todavía no está verificado. Revisá tu bandeja de entrada (y el spam) o pedí que te
        lo reenviemos.
      </span>
      {estado === "enviado" ? (
        <span className="text-forest">Correo reenviado.</span>
      ) : (
        <button
          type="button"
          onClick={reenviar}
          disabled={estado === "enviando"}
          className="rounded bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-500 disabled:opacity-50"
        >
          {estado === "enviando" ? "Enviando..." : "Reenviar correo"}
        </button>
      )}
      {estado === "error" ? <span className="text-red-700">{mensaje}</span> : null}
    </div>
  );
}
