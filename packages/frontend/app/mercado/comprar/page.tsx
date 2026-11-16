import Link from "next/link";
import { getDeploymentAddresses } from "@/lib/addresses.server";
import { RoleGate } from "@/components/RoleGate";
import { ComprarCertificadoForm } from "./ComprarCertificadoForm";

export default async function ComprarCertificadoPage({ searchParams }: { searchParams: Promise<{ emision?: string }> }) {
  const deployment = getDeploymentAddresses();
  const { emision } = await searchParams;

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Comprar Certificado de Transformación</h1>
      <p className="text-sm text-neutral-500 max-w-md">
        Pagás en USDT y recibís el certificado en la misma operación. El contrato reparte el
        valor automáticamente entre separadores, intermediarios, el transformador y la
        plataforma en ese momento.{" "}
        <Link href="/mercado" className="text-forest hover:underline">Ver el catálogo</Link>.
      </p>
      <RoleGate role="comprador" registroAddress={deployment.RegistroEntidades}>
        <ComprarCertificadoForm
          mercadoAddress={deployment.MercadoCertificados}
          usdtAddress={deployment.MockUSDT}
          emisionInicial={emision && /^\d+$/.test(emision) ? emision : ""}
        />
      </RoleGate>
    </div>
  );
}
