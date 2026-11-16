"use client";

import { useActionState } from "react";
import { restablecerContrasenaAction } from "../login/actions";

export function RestablecerForm({ token }: { token: string }) {
  const [error, formAction, isPending] = useActionState(restablecerContrasenaAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <label className="flex flex-col gap-1 text-sm">
        Contraseña nueva (mínimo 8 caracteres)
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Repetila
        <input
          type="password"
          name="confirmacion"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-light disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
}
