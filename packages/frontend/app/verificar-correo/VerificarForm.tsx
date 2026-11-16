"use client";

import { useActionState } from "react";
import { verificarCorreoAction } from "../login/actions";

export function VerificarForm({ token }: { token: string }) {
  const [error, formAction, isPending] = useActionState(verificarCorreoAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <p className="text-sm text-neutral-500">Confirmá que este correo es tuyo para activar la cuenta.</p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-light disabled:opacity-50"
      >
        {isPending ? "Verificando..." : "Verificar mi correo"}
      </button>
    </form>
  );
}
