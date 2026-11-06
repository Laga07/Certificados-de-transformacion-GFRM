import { getDeploymentAddresses } from "@/lib/addresses.server";
import { RegistroIntermediarioForm } from "./RegistroIntermediarioForm";

export default function RegistroIntermediarioPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Registro de Intermediario</h1>
      <p className="text-sm text-neutral-500 max-w-md">
        Recolectores, centros de acopio, municipalidades, compactadores y transportistas.
        Después de registrarte, un administrador tiene que verificarte antes de que puedas
        recibir material — podés ver el estado en tu{" "}
        <a href="/perfil" className="text-forest underline">
          perfil
        </a>
        .
      </p>
      <RegistroIntermediarioForm registroAddress={deployment.RegistroEntidades} />
    </div>
  );
}
