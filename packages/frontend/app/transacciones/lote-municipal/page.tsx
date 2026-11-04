import { getDeploymentAddresses } from "@/lib/addresses.server";
import { RoleGate } from "@/components/RoleGate";
import { EntregaLoteUsuarioForm } from "./EntregaLoteUsuarioForm";

export default function EntregaLoteMunicipalPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Entrega a lote municipal</h1>
      <RoleGate role="usuario" registroAddress={deployment.RegistroEntidades}>
        <EntregaLoteUsuarioForm
          registroAddress={deployment.RegistroEntidades}
          transaccionesAddress={deployment.TransaccionesPlastico}
        />
      </RoleGate>
    </div>
  );
}
