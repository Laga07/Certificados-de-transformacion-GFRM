"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "../login/actions";

export function RegisterForm() {
  const [error, formAction, isPending] = useActionState(registerAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm">
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

      <label className="flex flex-col gap-1 text-sm">
        Contraseña (mínimo 8 caracteres)
        <input
          type="password"
          name="password"
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
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="text-sm text-neutral-500">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-forest hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </form>
  );
}
