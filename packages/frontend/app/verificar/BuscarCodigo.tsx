"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BuscarCodigo({ inicial = "" }: { inicial?: string }) {
  const router = useRouter();
  const [codigo, setCodigo] = useState(inicial);
  const limpio = codigo.trim().toUpperCase();
  const valido = /^VV-[2-9A-Z]{4}-[2-9A-Z]{4}$/.test(limpio);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valido) router.push(`/verificar/${limpio}`);
      }}
      className="flex flex-wrap gap-2"
    >
      <input
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="VV-XXXX-XXXX"
        aria-label="Código de la constancia"
        className="flex-1 min-w-[12rem] rounded border border-neutral-300 bg-white px-3 py-2 font-mono uppercase"
      />
      <button
        type="submit"
        disabled={!valido}
        className="rounded bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-light disabled:opacity-50"
      >
        Verificar
      </button>
    </form>
  );
}
