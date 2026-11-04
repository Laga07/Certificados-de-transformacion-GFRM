import { getDeploymentAddresses } from "@/lib/addresses.server";
import { TransaccionGratuitaForm } from "./TransaccionGratuitaForm";

export default function TransaccionGratuitaPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Entrega gratuita</h1>
      <TransaccionGratuitaForm
        registroAddress={deployment.RegistroEntidades}
        transaccionesAddress={deployment.TransaccionesPlastico}
      />
    </div>
  );
}
