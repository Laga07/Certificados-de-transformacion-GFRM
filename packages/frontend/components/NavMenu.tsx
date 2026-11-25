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
  { href: "/cuenta", label: "Mi cuenta" },
  { href: "/perfil", label: "Wallet" },
  { href: "/dashboard", label: "Dashboard" },
];

// Categorias en vez de una fila plana de enlaces -- cada una se despliega en su propio
// menu al hacer click, con las paginas relacionadas agrupadas por lo que el usuario
// realmente hace ahi (registrarse, mover material, comprar).
const NAV_GROUPS: NavGroup[] = [
  {
    label: "Registrarse",
    items: [
      { href: "/cuenta/perfil", label: "Datos de mi entidad" },
      { href: "/registro/separador", label: "Separador" },
      { href: "/registro/intermediario", label: "Intermediario" },
      { href: "/registro/transformador", label: "Transformador" },
      { href: "/registro/comprador", label: "Comprador" },
    ],
  },
  {
    label: "Material",
    items: [
      { href: "/entregas/lotes", label: "Mis lotes" },
      { href: "/entregas/registrar", label: "Registrar entrega" },
      { href: "/entregas/traspaso", label: "Traspaso de lote" },
      { href: "/entregas/transformar", label: "Registrar transformación" },
      { href: "/guia-plasticos", label: "Guía de plásticos" },
    ],
  },
  {
    label: "Mercado",
    items: [
      { href: "/mercado", label: "Catálogo de certificados" },
      { href: "/mercado/comprar", label: "Comprar certificado" },
      { href: "/mercado/certificados", label: "Mis certificados" },
      { href: "/declaraciones", label: "Mis declaraciones" },
      { href: "/verificar", label: "Verificar una constancia" },
      { href: "/mercado/pagos", label: "Mis pagos" },
      { href: "/mercado/faucet", label: "USDT y POL de prueba" },
    ],
  },
];

const NAV_ADMIN: NavGroup = {
  label: "Administración",
  items: [
    { href: "/admin", label: "Revisión de entidades" },
    { href: "/admin/cuentas", label: "Cuentas" },
  ],
};

// Visitante sin cuenta: solo lo que puede ver sin iniciar sesion (el resto lo mandaria al login).
const NAV_PUBLICO: (NavItem & { soloEscritorio?: boolean })[] = [
  { href: "/#recorrido", label: "Cómo funciona" },
  { href: "/guia-inicio", label: "Guía de inicio", soloEscritorio: true },
  { href: "/verificar", label: "Verificar" },
];

export function NavMenu({ esAdmin, conSesion = true }: { esAdmin?: boolean; conSesion?: boolean }) {
  if (!conSesion) {
    return (
      <nav className="flex flex-wrap items-center gap-x-1 gap-y-1 flex-1">
        {NAV_PUBLICO.map((link) => (
          <Link key={link.href} href={link.href} className={`label-mono px-2 py-1 hover:text-forest ${link.soloEscritorio ? "hidden sm:inline" : ""}`}>
            {link.label}
          </Link>
        ))}
        <span className="hidden sm:block flex-1" />
        <Link href="/login" className="label-mono px-2 py-1 hover:text-forest">
          Iniciar sesión
        </Link>
        <Link
          href="/crear-cuenta"
          className="rounded-sm bg-forest px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-wider text-white hover:bg-forest-light"
        >
          Crear cuenta
        </Link>
      </nav>
    );
  }
  return <NavMenuConSesion esAdmin={esAdmin} />;
}

function NavMenuConSesion({ esAdmin }: { esAdmin?: boolean }) {
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

  const grupos = esAdmin ? [...NAV_GROUPS, NAV_ADMIN] : NAV_GROUPS;

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

      {grupos.map((group) => {
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
              <div className="absolute left-0 top-full z-20 mt-1 min-w-48 border border-neutral-300 bg-surface-warm py-1 shadow-sm">
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
