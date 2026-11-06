import { getDeploymentAddresses } from "@/lib/addresses.server";
import { RegistroTransformadorForm } from "./RegistroTransformadorForm";

export default function RegistroTransformadorPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Registro de Transformador</h1>
      <p className="text-sm text-neutral-500 max-w-md">
        La empresa que transforma el material en Costa Rica y emite el Certificado de
        Transformación. Necesitás verificación de un administrador antes de poder registrar
        transformaciones — podés ver el estado en tu{" "}
        <a href="/perfil" className="text-forest underline">
          perfil
        </a>
        .
      </p>
      <RegistroTransformadorForm registroAddress={deployment.RegistroEntidades} />
    </div>
  );
}
