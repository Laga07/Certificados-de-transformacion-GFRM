import { getDeploymentAddresses } from "@/lib/addresses.server";
import { RoleGate } from "@/components/RoleGate";
import { RegistrarEntregaForm } from "./RegistrarEntregaForm";

export default function RegistrarEntregaPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Registrar entrega</h1>
      <p className="text-sm text-neutral-500 max-w-md">
        Quien recibe el material (intermediario o transformador verificado) registra la
        entrega y paga el gas — el separador no necesita fondos en POL para participar.
      </p>
      <RoleGate role={["intermediario", "transformador"]} registroAddress={deployment.RegistroEntidades}>
        <RegistrarEntregaForm custodiaAddress={deployment.TokenCustodia} />
      </RoleGate>
    </div>
  );
}
