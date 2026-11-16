import { getDeploymentAddresses } from "@/lib/addresses.server";
import { RegistroSeparadorForm } from "./RegistroSeparadorForm";

export default function RegistroSeparadorPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Registro de Separador</h1>
      <p className="text-sm text-neutral-500 max-w-md">
        Sos quien separa el material — en casa, en un comercio, o recuperándolo en espacios
        públicos. A la cadena nunca viaja tu cédula: solo un hash calculado con un secreto del
        servidor, que no se puede revertir. Si ya cargaste tus datos en &ldquo;Mi entidad&rdquo;, el
        formulario se llena solo.
      </p>
      <RegistroSeparadorForm registroAddress={deployment.RegistroEntidades} />
    </div>
  );
}
