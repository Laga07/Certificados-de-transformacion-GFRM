// Estado de carga de ruta (App Router): se muestra mientras un Server Component espera a la
// API o a la cadena, en vez de dejar la pagina anterior congelada sin feedback.
export default function Loading() {
  return (
    <div className="flex flex-col gap-4 py-6" aria-busy="true" aria-live="polite">
      <div className="h-4 w-40 animate-pulse rounded-sm bg-neutral-200" />
      <div className="h-8 w-2/3 animate-pulse rounded-sm bg-neutral-200" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-24 animate-pulse border border-neutral-200 bg-surface-warm" />
        <div className="h-24 animate-pulse border border-neutral-200 bg-surface-warm" />
        <div className="h-24 animate-pulse border border-neutral-200 bg-surface-warm" />
      </div>
      <p className="label-mono">Cargando...</p>
    </div>
  );
}
