import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-5 max-w-xl py-10">
      <span className="tag-mono">Error 404</span>
      <h1 className="text-3xl font-heading italic font-semibold text-navy">Esta página no existe</h1>
      <p className="text-foreground/70">
        La dirección puede estar mal escrita o la página se movió. Estas son las secciones
        principales del sitio:
      </p>
      <ul className="grid gap-2 sm:grid-cols-2 text-sm">
        <li>
          <Link href="/dashboard" className="text-forest hover:underline">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/perfil" className="text-forest hover:underline">
            Mi perfil
          </Link>
        </li>
        <li>
          <Link href="/entregas/registrar" className="text-forest hover:underline">
            Registrar una entrega
          </Link>
        </li>
        <li>
          <Link href="/mercado/comprar" className="text-forest hover:underline">
            Comprar certificado
          </Link>
        </li>
      </ul>
      <Link
        href="/"
        className="w-fit rounded-sm bg-forest px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-white hover:bg-forest-light"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
