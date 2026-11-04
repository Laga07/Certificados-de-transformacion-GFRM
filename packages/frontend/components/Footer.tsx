import Image from "next/image";
import bosqueNuboso from "../public/bosque nuboso.png";

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden">
      <Image
        src={bosqueNuboso}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/85 to-navy/60" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-forest via-gold to-forest-light" />

      <div className="relative max-w-5xl mx-auto px-4 py-10 flex flex-wrap items-center justify-between gap-3 text-sm text-white/90">
        <p>
          <span className="text-white font-heading italic font-semibold text-base">
            GreenMaterialsDAPP
          </span>
          <span className="mx-2 text-gold">&middot;</span>
          Trazabilidad de plástico reciclado en Polygon, cuidando los ecosistemas de Costa Rica
        </p>
        <p className="font-mono text-[0.7rem] uppercase tracking-wider text-white/50">
          &copy; {new Date().getFullYear()} Green Foot Recycling Materials
        </p>
      </div>
    </footer>
  );
}
