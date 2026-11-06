import { getDeploymentAddresses } from "@/lib/addresses.server";
import { PagosForm } from "./PagosForm";

export default function PagosPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Mis pagos pendientes</h1>
      <p className="text-sm text-neutral-500 max-w-md">
        Cada venta acredita tu parte acá — nadie necesita reclamarlo para que quede
        registrado. El retiro es público: cualquiera puede dispararlo a tu favor (por ejemplo
        un proceso automático que paga a todos de forma periódica), el dinero siempre llega a
        tu wallet, nunca a quien lo dispara.
      </p>
      <PagosForm mercadoAddress={deployment.MercadoCertificados} />
    </div>
  );
}
