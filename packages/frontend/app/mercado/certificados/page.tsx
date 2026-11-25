import Link from "next/link";
import { getDeploymentAddresses } from "@/lib/addresses.server";
import { RoleGate } from "@/components/RoleGate";
import { MisCertificados } from "./MisCertificados";

export default function MisCertificadosPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Mis certificados</h1>
        <p className="text-sm text-foreground/70 max-w-2xl mt-1">
          Los Certificados de Transformación que tiene tu wallet, por material. 1 certificado = 1 kg
          efectivamente transformado. Para usarlos en un informe de cumplimiento, declaralos: se
          retiran de circulación y obtenés una constancia verificable.{" "}
          <Link href="/declaraciones" className="text-forest hover:underline">
            Ver mis declaraciones
          </Link>
        </p>
      </div>
      <RoleGate role="comprador" registroAddress={deployment.RegistroEntidades}>
        <MisCertificados certificados={deployment.Certificados} />
      </RoleGate>
    </div>
  );
}
