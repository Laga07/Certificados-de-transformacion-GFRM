export function IconRoute(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <circle cx="5" cy="6" r="2.25" />
      <circle cx="19" cy="18" r="2.25" />
      <path d="M5 8.25V13a4 4 0 0 0 4 4h6" strokeLinecap="round" />
    </svg>
  );
}

export function IconEye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

export function IconShieldCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path
        d="M12 3.5 5 6v6c0 4.2 2.9 7 7 8.5 4.1-1.5 7-4.3 7-8.5V6l-7-2.5Z"
        strokeLinejoin="round"
      />
      <path d="m9 12 2 2 4-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconGift(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <rect x="3.5" y="9" width="17" height="4" rx="0.5" />
      <path d="M4.5 13h15v6a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-6Z" />
      <path d="M12 9v11" />
      <path
        d="M12 9C12 9 9.5 9 8 7.5S8 3.5 9.5 3.5 12 6 12 9Z"
        strokeLinejoin="round"
      />
      <path
        d="M12 9c0 0 2.5 0 4-1.5S16 3.5 14.5 3.5 12 6 12 9Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCoin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9M14.75 9.75c0-1.24-1.23-2.25-2.75-2.25S9.25 8.51 9.25 9.75 10.48 12 12 12s2.75 1.01 2.75 2.25S13.52 16.5 12 16.5s-2.75-1.01-2.75-2.25" />
    </svg>
  );
}

export function IconTruck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path d="M2.5 6.5h11v10h-11z" strokeLinejoin="round" />
      <path d="M13.5 10h4l3 3v3.5h-7V10Z" strokeLinejoin="round" />
      <circle cx="6.5" cy="17.5" r="1.75" />
      <circle cx="17" cy="17.5" r="1.75" />
    </svg>
  );
}

export function IconArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconWallet(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <rect x="3" y="6" width="18" height="13" rx="1.5" />
      <path d="M3 10h18" strokeLinecap="round" />
      <circle cx="16.5" cy="14.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconFuel(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path d="M4 20V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h10" strokeLinecap="round" />
      <path d="M7 9h5" strokeLinecap="round" />
      <path d="M14 8.5 16.5 10.5v5a1.5 1.5 0 0 0 3 0v-3.5l-2-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Iconos de objetos cotidianos -- para ilustrar los ejemplos de cada tipo de plastico
// en la guia de clasificacion (/guia-plasticos). Mismo lenguaje de trazo que el resto
// del set (viewBox 24, stroke currentColor, 1.75).

export function IconBottle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path
        d="M10 2h4v3.5l1.5 2V20a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 8.5 20V7.5L10 5.5V2Z"
        strokeLinejoin="round"
      />
      <path d="M9 12.5h6" strokeLinecap="round" />
    </svg>
  );
}

export function IconJug(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <rect x="4.5" y="7" width="11" height="14" rx="1.5" />
      <path d="M7.5 7V4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V7" strokeLinecap="round" />
      <path d="M15.5 11a3 3 0 0 1 0 6" strokeLinecap="round" />
    </svg>
  );
}

export function IconPipe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <rect x="2" y="9" width="20" height="6" rx="3" />
      <path d="M6.5 9v6M17.5 9v6" />
    </svg>
  );
}

export function IconBag(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path d="M6 8h12l-1 12.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  );
}

export function IconFilmRoll(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <rect x="3" y="9" width="18" height="6" rx="3" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function IconPanel(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <rect x="4" y="5" width="16" height="14" rx="1" />
      <path d="M4 9.5h16M4 14.5h16" opacity="0.55" />
    </svg>
  );
}

export function IconCap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path d="M6 8 5 5h14l-1 3" strokeLinejoin="round" />
      <path d="M6 8h12v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8Z" strokeLinejoin="round" />
      <path d="M9 11v6M12 11v6M15 11v6" opacity="0.55" />
    </svg>
  );
}

export function IconCup(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path d="M5 8h14" strokeLinecap="round" />
      <path
        d="M6 8h12l-1.5 11a1.5 1.5 0 0 1-1.5 1.3h-6A1.5 1.5 0 0 1 7.5 19L6 8Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconStraw(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} {...props}>
      <path d="M6.5 21 14 11" strokeLinecap="round" />
      <path d="M14 11c0-2.5 1.8-4.5 4-4.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconEggCarton(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <rect x="2.5" y="7" width="19" height="11" rx="1.5" />
      <circle cx="8" cy="12.5" r="2.25" />
      <circle cx="16" cy="12.5" r="2.25" />
    </svg>
  );
}

export function IconFoamBlock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <rect x="3" y="6" width="18" height="12" rx="1" />
      <path d="M3 10h18M8 6v12M13 6v12M18 6v12" opacity="0.5" />
    </svg>
  );
}

export function IconLayers(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path d="M12 3 21 8l-9 5-9-5 9-5Z" strokeLinejoin="round" />
      <path d="M3 12l9 5 9-5" strokeLinejoin="round" />
      <path d="M3 16l9 5 9-5" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path d="M12 3 20 7.5v9L12 21 4 16.5v-9L12 3Z" strokeLinejoin="round" />
      <path d="M12 12v9M12 12l8-4.5M12 12 4 7.5" strokeLinejoin="round" />
    </svg>
  );
}

// El clasico triangulo de reciclaje -- version simplificada (no las flechas persiguiendose
// exactas) para usar como "busca este simbolo en el envase", con el numero superpuesto
// desde el componente que lo use.
export function IconRecyclingTriangle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <path d="M12 3 21 19H3Z" strokeLinejoin="round" />
    </svg>
  );
}
