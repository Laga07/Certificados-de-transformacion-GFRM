"use client";

import { useEnVista } from "./useEnVista";

// Aparece con un desplazamiento suave la primera vez que entra en pantalla. Antes de que el
// observador responda el contenido se ve normal (sin parpadeos ni contenido invisible si el
// JavaScript tarda o falla); solo lo que arranca fuera de pantalla se oculta y luego aparece.
export function Revelar({
  children,
  retraso = 0,
  className = "",
  as: Etiqueta = "div",
}: {
  children: React.ReactNode;
  retraso?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const { ref, visible } = useEnVista<HTMLElement>({ unaVez: true, umbral: 0.15 });
  const estado = visible === null ? "inicial" : visible ? "visible" : "oculto";
  return (
    <Etiqueta
      ref={ref as never}
      data-estado={estado}
      style={{ transitionDelay: `${retraso}ms` }}
      className={`revelar ${className}`}
    >
      {children}
    </Etiqueta>
  );
}
