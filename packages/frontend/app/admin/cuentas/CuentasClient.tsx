"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiPost, ApiError, type Cuenta, type EstadoRevision, type TipoEntidad } from "@/lib/api";

interface CuentaAdmin extends Cuenta {
  perfil: { tipo: TipoEntidad; estadoRevision: EstadoRevision } | null;
}

export function CuentasClient() {
  const [cuentas, setCuentas] = useState<CuentaAdmin[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    try {
      const res = await apiFetch<{ data: CuentaAdmin[] }>("/api/admin/cuentas?pageSize=100");
      setCuentas(res.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo cargar.");
      setCuentas([]);
    }
  }

  useEffect(() => {
    // Diferido a una microtarea: ver nota en RevisionEntidades.tsx.
    void Promise.resolve().then(cargar);
  }, []);

  async function cambiarRol(cuenta: CuentaAdmin) {
    setError(null);
    try {
      await apiPost(`/api/admin/cuentas/${cuenta.id}/rol`, { rol: cuenta.rol === "ADMIN" ? "USER" : "ADMIN" });
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo cambiar el rol.");
    }
  }

  if (cuentas === null) return <p className="text-sm text-neutral-500">Cargando...</p>;

  return (
    <div className="flex flex-col gap-3">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="overflow-x-auto border border-neutral-300">
        <table className="w-full text-sm">
          <thead className="bg-surface-warm">
            <tr>
              <th className="text-left p-2 label-mono">Correo</th>
              <th className="text-left p-2 label-mono">Verificado</th>
              <th className="text-left p-2 label-mono">Wallet</th>
              <th className="text-left p-2 label-mono">Entidad</th>
              <th className="text-left p-2 label-mono">Rol</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {cuentas.map((c) => (
              <tr key={c.id} className="border-t border-neutral-200">
                <td className="p-2">{c.email}</td>
                <td className="p-2">{c.emailVerificado ? <span className="text-forest">sí</span> : <span className="text-amber-700">no</span>}</td>
                <td className="p-2 font-mono text-xs">{c.wallet ? `${c.wallet.slice(0, 6)}…${c.wallet.slice(-4)}` : "—"}</td>
                <td className="p-2">{c.perfil ? `${c.perfil.tipo.toLowerCase()} · ${c.perfil.estadoRevision.toLowerCase()}` : "—"}</td>
                <td className="p-2">{c.rol === "ADMIN" ? "Administrador" : "Usuario"}</td>
                <td className="p-2 text-right">
                  <button type="button" onClick={() => cambiarRol(c)} className="text-xs text-forest hover:underline">
                    {c.rol === "ADMIN" ? "Quitar admin" : "Hacer admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
