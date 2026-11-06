import { getDeploymentAddresses } from "@/lib/addresses.server";
import { DeclararEnvioForm } from "./DeclararEnvioForm";
import { ConfirmarRecepcionForm } from "./ConfirmarRecepcionForm";

export default function TraspasoPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-navy">Traspaso de lote en dos pasos</h1>
        <p className="text-sm text-neutral-500 max-w-xl">
          Un lote se mueve completo (si querés enviar una parte, dividilo primero). Primero
          quien tiene el lote declara el envío; después quien recibe confirma con el peso que
          de verdad le llegó.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading font-semibold text-navy">1. Declarar envío</h2>
        <DeclararEnvioForm custodiaAddress={deployment.TokenCustodia} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading font-semibold text-navy">2. Confirmar recepción</h2>
        <ConfirmarRecepcionForm custodiaAddress={deployment.TokenCustodia} />
      </section>
    </div>
  );
}
