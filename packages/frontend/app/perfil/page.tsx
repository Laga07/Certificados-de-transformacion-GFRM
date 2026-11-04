import { getDeploymentAddresses } from "@/lib/addresses.server";
import { PerfilClient } from "./PerfilClient";

export default function PerfilPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return (
      <p className="text-neutral-500">
        Los contratos aún no se han desplegado en Amoy. Corré{" "}
        <code className="text-forest">npm run deploy:amoy</code> en{" "}
        <code>packages/contracts</code> y luego{" "}
        <code className="text-forest">npm run contracts:export</code> desde la raíz.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Perfil</h1>
      <p className="text-sm text-foreground/70 max-w-2xl">
        Este es tu estado on-chain, la prueba verificable de tu aporte a la trazabilidad del
        plástico reciclado en Costa Rica. Cada rol registrado aquí visibiliza y dignifica el
        trabajo de quienes hoy operan, muchas veces, en la informalidad.
      </p>
      <PerfilClient
        registroAddress={deployment.RegistroEntidades}
        plasticoTokenAddress={deployment.PlasticoToken}
      />
    </div>
  );
}
