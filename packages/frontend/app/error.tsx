"use client";

import Link from "next/link";
import { useEffect } from "react";

// Error boundary de toda la app (App Router). Sin este archivo, cualquier excepcion en un
// Server Component muestra la pantalla gris por defecto de Next, sin forma de recuperarse.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En produccion esto es lo que se manda a Sentry (plan de produccion, C11).
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col gap-5 max-w-xl py-10">
      <span className="tag-mono">Algo salió mal</span>
      <h1 className="text-3xl font-heading italic font-semibold text-navy">
        No pudimos mostrar esta página
      </h1>
      <p className="text-foreground/70">
        Puede ser un problema momentáneo con la API o con la red de Polygon. Probá de nuevo; si
        sigue pasando, volvé al inicio y contanos qué estabas haciendo.
      </p>
      {error.digest ? (
        <p className="label-mono">Referencia del error: {error.digest}</p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-sm bg-forest px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-white hover:bg-forest-light"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="rounded-sm border border-neutral-300 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-foreground hover:border-forest hover:text-forest"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
