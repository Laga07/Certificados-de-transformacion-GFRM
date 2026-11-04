import { getDeploymentAddresses } from "@/lib/addresses.server";
import { RoleGate } from "@/components/RoleGate";
import { LotesWorkflow } from "./LotesWorkflow";

export default function PanelMunicipalPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-navy">Panel Municipal: Lotes</h1>

      <section className="rounded-xl border border-neutral-200 bg-surface-warm p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <p className="text-3xl font-heading font-semibold text-gold">1,049</p>
          <p className="text-sm text-foreground/70 max-w-md">
            actores identificados en la gestión integral de residuos en Costa Rica{" "}
            <span className="text-foreground/50">(PNGIR 2024, p. 3-4)</span>. El sector privado
            concentra el <strong className="text-forest">82.4%</strong> del total.
          </p>
        </div>
        <p className="text-sm text-foreground/70 max-w-2xl">
          Esta herramienta no reemplaza a municipalidades, centros de acopio ni recolectores: les
          da un lenguaje común de datos, trazable por provincia y cantón. Alcance de referencia de
          la investigación: San José, Heredia y Cartago (Gran Área Metropolitana).
        </p>
        <div className="flex flex-wrap gap-2">
          {["Ley 8839", "PNGIR 2023-2033", "ODS 11 · Ciudades sostenibles"].map((etiqueta) => (
            <span
              key={etiqueta}
              className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-foreground/70"
            >
              {etiqueta}
            </span>
          ))}
        </div>
      </section>

      <RoleGate role="municipalidad" registroAddress={deployment.RegistroEntidades}>
        <LotesWorkflow transaccionesAddress={deployment.TransaccionesPlastico} />
      </RoleGate>
    </div>
  );
}
