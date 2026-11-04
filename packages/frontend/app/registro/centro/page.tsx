import { getDeploymentAddresses } from "@/lib/addresses.server";
import { RegistroCentroForm } from "./RegistroCentroForm";

export default function RegistroCentroPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Registro de Centro Recolector</h1>
      <RegistroCentroForm registroAddress={deployment.RegistroEntidades} />
    </div>
  );
}
