import Link from "next/link";
import { getDeploymentAddresses } from "@/lib/addresses.server";
import { DeclararEnvioForm } from "./DeclararEnvioForm";
import { ConfirmarRecepcionForm } from "./ConfirmarRecepcionForm";

export default async function TraspasoPage({
  searchParams,
}: {
  searchParams: Promise<{ lote?: string; paso?: string }>;
}) {
  const deployment = getDeploymentAddresses();
  const { lote, paso } = await searchParams;
  const loteInicial = lote && /^\d+$/.test(lote) ? lote : "";

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-navy">Traspaso de lote en dos pasos</h1>
        <p className="text-sm text-neutral-500 max-w-xl">
          Un lote se mueve completo (si querés enviar una parte, dividilo primero en{" "}
          <Link href="/entregas/lotes" className="text-forest hover:underline">Mis lotes</Link>). Primero
          quien tiene el lote declara el envío; después quien recibe confirma con el peso que de
          verdad le llegó.
        </p>
      </div>

      <section className="flex flex-col gap-3" id="enviar">
        <h2 className="font-heading font-semibold text-navy">1. Declarar envío</h2>
        <DeclararEnvioForm custodiaAddress={deployment.TokenCustodia} loteInicial={paso !== "confirmar" ? loteInicial : ""} />
      </section>

      <section className="flex flex-col gap-3" id="confirmar">
        <h2 className="font-heading font-semibold text-navy">2. Confirmar recepción</h2>
        <ConfirmarRecepcionForm custodiaAddress={deployment.TokenCustodia} loteInicial={paso === "confirmar" ? loteInicial : ""} />
      </section>
    </div>
  );
}
