"use client";

import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { apiFetch, apiPost, ApiError, type Cuenta } from "@/lib/api";

// Vinculo cuenta <-> wallet (plan de produccion, B4). La wallet firma un mensaje con un nonce
// que emite la API; la firma no cuesta gas ni autoriza nada. Asi la plataforma sabe que
// persona (correo, perfil, documentos) esta detras de cada direccion que opera on-chain.
export function CuentaClient({ cuentaInicial }: { cuentaInicial: Cuenta }) {
  const [cuenta, setCuenta] = useState(cuentaInicial);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const conectadaEsLaVinculada =
    Boolean(address && cuenta.wallet) && address!.toLowerCase() === cuenta.wallet!.toLowerCase();

  async function vincular() {
    if (!address) return;
    setOcupado(true);
    setError(null);
    try {
      const { mensaje } = await apiFetch<{ mensaje: string; nonce: string }>(
        `/api/auth/wallet/nonce?address=${address}`,
      );
      const signature = await signMessageAsync({ message: mensaje });
      const { cuenta: actualizada } = await apiPost<{ cuenta: Cuenta }>("/api/auth/wallet/vincular", {
        address,
        signature,
      });
      setCuenta(actualizada);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error && /rejected|denied/i.test(e.message)
            ? "Rechazaste la firma en tu wallet."
            : "No se pudo vincular la wallet.",
      );
    } finally {
      setOcupado(false);
    }
  }

  async function desvincular() {
    setOcupado(true);
    setError(null);
    try {
      const { cuenta: actualizada } = await apiFetch<{ cuenta: Cuenta }>("/api/auth/wallet", { method: "DELETE" });
      setCuenta(actualizada);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo desvincular.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <section className="border border-neutral-300 p-5 flex flex-col gap-2">
        <h2 className="font-heading font-semibold text-navy">Acceso</h2>
        <p className="text-sm">
          <span className="label-mono">Correo</span>
          <br />
          {cuenta.email}{" "}
          {cuenta.emailVerificado ? (
            <span className="text-forest text-xs">(verificado)</span>
          ) : (
            <span className="text-amber-700 text-xs">(sin verificar)</span>
          )}
        </p>
        <p className="text-sm">
          <span className="label-mono">Rol en la app</span>
          <br />
          {cuenta.rol === "ADMIN" ? "Administrador" : "Usuario"}
        </p>
        <a href="/olvide-contrasena" className="w-fit label-mono text-forest hover:underline">
          Cambiar contraseña →
        </a>
      </section>

      <section className="border border-neutral-300 p-5 flex flex-col gap-3">
        <h2 className="font-heading font-semibold text-navy">Wallet vinculada</h2>
        {cuenta.wallet ? (
          <p className="text-sm">
            <span className="font-mono text-xs break-all">{cuenta.wallet}</span>
            <br />
            <span className="text-xs text-foreground/60">
              vinculada el {new Date(cuenta.walletVinculadaEn!).toLocaleDateString("es-CR")}
            </span>
          </p>
        ) : (
          <p className="text-sm text-foreground/70">
            Ninguna todavía. Conectá tu wallet (botón arriba a la derecha) y firmá un mensaje para
            asociarla a esta cuenta. La firma es gratis.
          </p>
        )}

        {!isConnected ? (
          <p className="text-xs text-foreground/60">Conectá tu wallet para vincularla.</p>
        ) : conectadaEsLaVinculada ? (
          <p className="text-xs text-forest">La wallet conectada es la vinculada.</p>
        ) : (
          <button
            type="button"
            onClick={vincular}
            disabled={ocupado}
            className="w-fit rounded bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-light disabled:opacity-50"
          >
            {ocupado ? "Esperando la firma..." : cuenta.wallet ? "Reemplazar por la wallet conectada" : "Vincular la wallet conectada"}
          </button>
        )}
        {address && !conectadaEsLaVinculada ? (
          <p className="text-xs text-foreground/60">
            Conectada ahora: <span className="font-mono">{address.slice(0, 6)}…{address.slice(-4)}</span>
          </p>
        ) : null}
        {cuenta.wallet ? (
          <button
            type="button"
            onClick={desvincular}
            disabled={ocupado}
            className="w-fit text-xs text-red-700 hover:underline disabled:opacity-50"
          >
            Desvincular
          </button>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </section>
    </div>
  );
}
