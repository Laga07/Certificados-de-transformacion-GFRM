"use client";

import { useActionState } from "react";
import { olvideContrasenaAction } from "../login/actions";

export function OlvideForm() {
  const [estado, formAction, isPending] = useActionState(olvideContrasenaAction, null);
  const exito = estado?.startsWith("ok:") ? estado.slice(3) : null;
  const error = estado && !exito ? estado : null;

  if (exito) {
    return <p className="text-sm text-forest">{exito}</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Correo
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-light disabled:opacity-50"
      >
        {isPending ? "Enviando..." : "Enviarme el enlace"}
      </button>
    </form>
  );
}
