import Image from "next/image";
import Link from "next/link";
import bosqueNuboso from "../public/bosque nuboso.png";

export function Footer() {
  return (
    <footer className="no-print relative mt-auto overflow-hidden">
      <Image
        src={bosqueNuboso}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/85 to-navy/60" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-forest via-gold to-forest-light" />

      <div className="relative max-w-5xl mx-auto px-4 py-10 flex flex-col gap-4 text-sm text-white/90">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p>
            <span className="text-white font-heading italic font-semibold text-base">
              Certificado de Transformación
            </span>
            <span className="mx-2 text-gold">&middot;</span>
            Trazabilidad multi-material y certificación de reciclaje sobre Polygon
          </p>
          <nav className="flex flex-wrap gap-4 font-mono text-[0.7rem] uppercase tracking-wider text-white/70">
            <Link href="/guia-inicio" className="hover:text-white">
              Guía de inicio
            </Link>
            <Link href="/dashboard" className="hover:text-white">
              Dashboard
            </Link>
            <Link href="/guia-plasticos" className="hover:text-white">
              Guía de plásticos
            </Link>
            <Link href="/terminos" className="hover:text-white">
              Términos
            </Link>
            <Link href="/privacidad" className="hover:text-white">
              Privacidad
            </Link>
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[0.7rem] uppercase tracking-wider text-white/50">
          <p>&copy; {new Date().getFullYear()} Green Foot Recycling Materials &middot; Costa Rica</p>
          <p>Red de prueba Polygon Amoy &middot; los montos no tienen valor económico</p>
        </div>
      </div>
    </footer>
  );
}
