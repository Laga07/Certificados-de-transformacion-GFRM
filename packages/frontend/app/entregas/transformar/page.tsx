import { getDeploymentAddresses } from "@/lib/addresses.server";
import { RoleGate } from "@/components/RoleGate";
import { TransformarForm } from "./TransformarForm";

export default function TransformarPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Registrar transformación</h1>
      <p className="text-sm text-neutral-500 max-w-md">
        Consumís los lotes que tenés en custodia y declarás cuántos kg transformaste
        efectivamente — la diferencia es tu propia merma. Esto acuña el Certificado de
        Transformación disponible para la venta primaria, al precio que fijes acá.
      </p>
      <RoleGate role="transformador" registroAddress={deployment.RegistroEntidades}>
        <TransformarForm mercadoAddress={deployment.MercadoCertificados} />
      </RoleGate>
    </div>
  );
}
