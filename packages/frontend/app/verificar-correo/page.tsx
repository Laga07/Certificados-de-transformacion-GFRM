import Link from "next/link";
import { VerificarForm } from "./VerificarForm";

// El enlace del correo trae ?token=... El token se consume con un POST explicito (boton),
// no al cargar la pagina: los clientes de correo y los navegadores "pre-abren" enlaces y
// gastarian el token de un solo uso sin que la persona lo haya tocado.
export default async function VerificarCorreoPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <h1 className="text-2xl font-semibold text-navy">Verificar correo</h1>
      {token ? (
        <VerificarForm token={token} />
      ) : (
        <p className="text-sm text-neutral-500">
          Este enlace no trae el token. Entrá a{" "}
          <Link href="/cuenta" className="text-forest hover:underline">
            tu cuenta
          </Link>{" "}
          y pedí que te reenviemos el correo.
        </p>
      )}
    </div>
  );
}
