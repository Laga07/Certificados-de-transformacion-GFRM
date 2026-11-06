import { getDeploymentAddresses } from "@/lib/addresses.server";
import { RegistroCompradorForm } from "./RegistroCompradorForm";

export default function RegistroCompradorPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Registro de Comprador</h1>
      <p className="text-sm text-neutral-500 max-w-md">
        Empresas obligadas por la Ley 9786 o que compran certificados de forma voluntaria. No
        necesitás verificación: te podés registrar y comprar de inmediato.
      </p>
      <RegistroCompradorForm registroAddress={deployment.RegistroEntidades} />
    </div>
  );
}
