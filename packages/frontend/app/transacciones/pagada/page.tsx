import { getDeploymentAddresses } from "@/lib/addresses.server";
import { TransaccionPagadaForm } from "./TransaccionPagadaForm";

export default function TransaccionPagadaPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Transacción pagada (USDT)</h1>
      <TransaccionPagadaForm
        registroAddress={deployment.RegistroEntidades}
        transaccionesAddress={deployment.TransaccionesPlastico}
        mockUsdtAddress={deployment.MockUSDT}
      />
    </div>
  );
}
