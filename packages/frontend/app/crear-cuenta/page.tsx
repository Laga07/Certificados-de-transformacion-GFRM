import { RegisterForm } from "./RegisterForm";

export default function CrearCuentaPage() {
  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold text-navy">Crear cuenta</h1>
      <p className="text-sm text-neutral-500">
        Esta cuenta controla el acceso al sitio. No reemplaza tu wallet: la vas a conectar por
        separado cuando quieras registrarte on-chain o hacer una transacción.
      </p>
      <RegisterForm />
    </div>
  );
}
