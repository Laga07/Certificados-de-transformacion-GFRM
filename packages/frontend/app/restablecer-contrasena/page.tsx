import Link from "next/link";
import { RestablecerForm } from "./RestablecerForm";

export default async function RestablecerContrasenaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <h1 className="text-2xl font-semibold text-navy">Nueva contraseña</h1>
      {token ? (
        <RestablecerForm token={token} />
      ) : (
        <p className="text-sm text-neutral-500">
          Este enlace no trae el token. Pedí uno nuevo desde{" "}
          <Link href="/olvide-contrasena" className="text-forest hover:underline">
            restablecer contraseña
          </Link>
          .
        </p>
      )}
    </div>
  );
}
