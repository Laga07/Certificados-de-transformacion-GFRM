"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconChevronDown } from "@/components/icons";

interface NavItem {
  href: string;
  label: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_DIRECT: NavItem[] = [
  { href: "/perfil", label: "Perfil" },
  { href: "/dashboard", label: "Dashboard" },
];

// Categorias en vez de una fila plana de 7 enlaces -- cada una se despliega en su propio
// menu al hacer click, con las paginas relacionadas agrupadas por lo que el usuario
// realmente hace ahi (registrarse, entregar material, o administrar).
const NAV_GROUPS: NavGroup[] = [
  {
    label: "Registrarse",
    items: [
      { href: "/registro/usuario", label: "Usuario" },
      { href: "/registro/centro", label: "Centro Recolector" },
    ],
  },
  {
    label: "Entregas",
    items: [
      { href: "/transacciones/gratuita", label: "Gratuita" },
      { href: "/transacciones/pagada", label: "Pagada" },
      { href: "/transacciones/lote-municipal", label: "Municipal" },
      { href: "/guia-plasticos", label: "Guía de plásticos" },
    ],
  },
  {
    label: "Administración",
    items: [
      { href: "/municipal/lotes", label: "Municipalidades" },
      { href: "/admin", label: "Contrato" },
    ],
  },
];

export function NavMenu() {
  const [abierto, setAbierto] = useState<string | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!abierto) return;

    function onPointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAbierto(null);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setAbierto(null);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [abierto]);

  return (
    <nav ref={containerRef} className="flex flex-wrap items-center gap-x-1 gap-y-1 flex-1">
      {NAV_DIRECT.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="label-mono px-2 py-1 hover:text-forest"
        >
          {link.label}
        </Link>
      ))}

      {NAV_GROUPS.map((group) => {
        const estaAbierto = abierto === group.label;
        return (
          <div key={group.label} className="relative">
            <button
              type="button"
              onClick={() => setAbierto(estaAbierto ? null : group.label)}
              aria-expanded={estaAbierto}
              className={`label-mono flex items-center gap-1 px-2 py-1 hover:text-forest ${
                estaAbierto ? "text-forest" : ""
              }`}
            >
              {group.label}
              <IconChevronDown
                className={`h-3 w-3 transition-transform ${estaAbierto ? "rotate-180" : ""}`}
              />
            </button>
            {estaAbierto ? (
              <div className="absolute left-0 top-full z-20 mt-1 min-w-44 border border-neutral-300 bg-surface-warm py-1 shadow-sm">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setAbierto(null)}
                    className="block px-3 py-2 text-sm text-foreground hover:bg-neutral-100 hover:text-forest"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
