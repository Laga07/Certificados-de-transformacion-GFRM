import { getDeploymentAddresses } from "@/lib/addresses.server";
import { RegistroUsuarioForm } from "./RegistroUsuarioForm";

export default function RegistroUsuarioPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Registro de Usuario</h1>
      <p className="text-sm text-neutral-500 max-w-md">
        Tu cédula nunca se envía a la chain ni al backend: solo su hash keccak256, calculado en
        tu navegador.
      </p>
      <RegistroUsuarioForm registroAddress={deployment.RegistroEntidades} />
    </div>
  );
}
