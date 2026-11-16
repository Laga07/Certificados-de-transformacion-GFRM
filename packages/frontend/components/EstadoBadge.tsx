import type { EstadoRevision } from "@/lib/api";

// Vive en components/ (no en app/cuenta/page.tsx): un archivo page.tsx del App Router solo
// puede exportar la pagina y sus metadatos; exportar un componente extra desde ahi rompe el
// build de Next.
export function EstadoBadge({ estado }: { estado: EstadoRevision }) {
  const estilos = {
    PENDIENTE: "border-amber-400 text-amber-800 bg-amber-50",
    APROBADO: "border-forest text-forest bg-surface-warm",
    RECHAZADO: "border-red-400 text-red-700 bg-red-50",
  }[estado];
  const texto = { PENDIENTE: "En revisión", APROBADO: "Aprobado", RECHAZADO: "Rechazado" }[estado];
  return (
    <span className={`inline-block border px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider ${estilos}`}>
      {texto}
    </span>
  );
}
