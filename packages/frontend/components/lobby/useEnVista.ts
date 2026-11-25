"use client";

import { useEffect, useRef, useState } from "react";

/**
 * true cuando el elemento entra en pantalla. `unaVez` lo deja en true despues de la primera
 * vez (para animaciones de entrada); sin `unaVez` refleja la visibilidad actual (para pausar
 * el recorrido cuando no se ve).
 */
export function useEnVista<T extends Element>(opciones: { unaVez?: boolean; umbral?: number } = {}) {
  const { unaVez = true, umbral = 0.25 } = opciones;
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          if (unaVez) observador.disconnect();
        } else {
          setVisible((v) => (unaVez && v ? true : false));
        }
      },
      { threshold: umbral },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [unaVez, umbral]);

  return { ref, visible };
}

export function usePrefiereMenosMovimiento(): boolean {
  const [reducido, setReducido] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const actualizar = () => setReducido(mq.matches);
    mq.addEventListener("change", actualizar);
    // Primera lectura diferida a una microtarea (regla react-hooks/set-state-in-effect).
    void Promise.resolve().then(actualizar);
    return () => mq.removeEventListener("change", actualizar);
  }, []);
  return reducido;
}
