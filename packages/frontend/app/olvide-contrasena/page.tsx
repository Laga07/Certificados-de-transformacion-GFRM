import Link from "next/link";
import { OlvideForm } from "./OlvideForm";

export default function OlvideContrasenaPage() {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <h1 className="text-2xl font-semibold text-navy">Restablecer contraseña</h1>
      <p className="text-sm text-neutral-500">
        Escribí el correo de tu cuenta. Si existe, te mandamos un enlace que vale una hora.
      </p>
      <OlvideForm />
      <p className="text-sm text-neutral-500">
        <Link href="/login" className="text-forest hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
