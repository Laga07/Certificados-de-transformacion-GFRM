"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";

export function LoginForm() {
  const [error, formAction, isPending] = useActionState(loginAction, null);

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
        Contraseña
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-light disabled:opacity-50"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-sm text-neutral-500 flex flex-col gap-1">
        <span>
          ¿No tenés cuenta todavía?{" "}
          <Link href="/crear-cuenta" className="text-forest hover:underline">
            Creala acá
          </Link>
        </span>
        <Link href="/olvide-contrasena" className="text-forest hover:underline">
          Olvidé mi contraseña
        </Link>
      </p>
    </form>
  );
}
