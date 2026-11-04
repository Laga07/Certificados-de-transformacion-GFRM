import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold text-navy">Iniciar sesión</h1>
      <p className="text-sm text-neutral-500">
        Necesitás una cuenta para acceder al sitio. Esto es distinto de tu wallet: la vas a
        conectar después, dentro de cada flujo.
      </p>
      <LoginForm />
    </div>
  );
}
