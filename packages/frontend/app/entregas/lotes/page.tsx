import { getDeploymentAddresses } from "@/lib/addresses.server";
import { RoleGate } from "@/components/RoleGate";
import { MisLotes } from "./MisLotes";
import { UnirLotesForm } from "./UnirLotesForm";
import { DividirLoteForm } from "./DividirLoteForm";

export default function MisLotesPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-navy">Mis lotes</h1>
        <p className="text-sm text-neutral-500 max-w-2xl">
          Los lotes que tu wallet tiene en custodia ahora mismo y los envíos que te están
          esperando. Desde acá se declara un envío, se confirma una recepción, se unen o dividen
          lotes y se mandan a transformar.
        </p>
      </div>

      <RoleGate role={["intermediario", "transformador"]} registroAddress={deployment.RegistroEntidades}>
        <MisLotes />

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h2 className="font-heading font-semibold text-navy">Unir lotes</h2>
            <p className="text-sm text-neutral-500">
              Varios lotes tuyos del mismo material se compactan en uno nuevo. Se conserva el
              linaje completo de aportes y merma.
            </p>
            <UnirLotesForm custodiaAddress={deployment.TokenCustodia} />
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="font-heading font-semibold text-navy">Dividir un lote</h2>
            <p className="text-sm text-neutral-500">
              Para enviar solo una parte: las piezas tienen que sumar exactamente el peso actual
              del lote.
            </p>
            <DividirLoteForm custodiaAddress={deployment.TokenCustodia} />
          </div>
        </section>
      </RoleGate>
    </div>
  );
}
