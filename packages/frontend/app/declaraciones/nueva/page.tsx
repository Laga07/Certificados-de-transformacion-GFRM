import { getDeploymentAddresses } from "@/lib/addresses.server";
import { RoleGate } from "@/components/RoleGate";
import { NuevaDeclaracionForm } from "./NuevaDeclaracionForm";

export default async function NuevaDeclaracionPage({ searchParams }: { searchParams: Promise<{ material?: string }> }) {
  const deployment = getDeploymentAddresses();
  const { material } = await searchParams;

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  const materialInicial = material && /^[0-4]$/.test(material) ? Number(material) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Nueva declaración</h1>
        <p className="text-sm text-foreground/70 max-w-2xl mt-1">
          Usá tus certificados para respaldar un informe de cumplimiento. Los certificados que
          declares se <strong>retiran de circulación para siempre</strong> (nadie más puede
          usarlos), y la huella digital de esta declaración queda grabada en la blockchain junto
          con el retiro. Al terminar obtenés una constancia con código QR que cualquiera puede
          verificar.
        </p>
      </div>
      <RoleGate role="comprador" registroAddress={deployment.RegistroEntidades}>
        <NuevaDeclaracionForm
          mercadoAddress={deployment.MercadoCertificados}
          certificados={deployment.Certificados}
          materialInicial={materialInicial}
        />
      </RoleGate>
    </div>
  );
}
