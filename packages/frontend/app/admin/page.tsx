import { getDeploymentAddresses } from "@/lib/addresses.server";
import { AdminDashboard } from "./AdminDashboard";

export default function AdminPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Panel de administración</h1>
      <p className="text-sm text-neutral-500 max-w-2xl">
        Funciones on-chain reservadas a VERIFIER_ROLE de RegistroEntidades: verificar
        intermediarios y transformadores antes de que puedan recibir material o emitir
        certificados.
      </p>
      <AdminDashboard registroAddress={deployment.RegistroEntidades} />
    </div>
  );
}
