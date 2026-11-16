import { CuentasClient } from "./CuentasClient";

export default function AdminCuentasPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Cuentas</h1>
      <p className="text-sm text-neutral-500 max-w-2xl">
        Todas las cuentas de la plataforma. El rol &ldquo;Administrador&rdquo; da acceso a este panel
        (no otorga ningún permiso on-chain).
      </p>
      <CuentasClient />
    </div>
  );
}
