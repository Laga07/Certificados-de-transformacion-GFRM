import { getDeploymentAddresses } from "@/lib/addresses.server";
import { RevisionEntidades } from "./RevisionEntidades";
import { PendientesPanel } from "./PendientesPanel";

// Acceso: el proxy ya exige rol ADMIN en la cuenta para llegar aca. La aprobacion on-chain
// (verificarIntermediario / verificarTransformador) ademas necesita que la wallet conectada
// tenga VERIFIER_ROLE -- lo comprueba cada boton.
export default function AdminPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-navy">Revisión de entidades</h1>
        <p className="text-sm text-neutral-500 max-w-2xl">
          Cada entidad carga sus datos y documentos en &ldquo;Mi entidad&rdquo; y vincula su wallet. Acá
          se revisan, se aprueban o rechazan en la plataforma y, para intermediarios y
          transformadores, se verifican on-chain con la wallet que tiene VERIFIER_ROLE.
        </p>
      </div>

      <RevisionEntidades registroAddress={deployment.RegistroEntidades} />

      <details className="border border-neutral-300 p-4">
        <summary className="cursor-pointer font-heading font-semibold text-navy">
          Wallets registradas on-chain sin perfil en la plataforma
        </summary>
        <p className="text-sm text-neutral-500 my-3">
          Se registraron directo en el contrato sin cargar datos. No conviene verificarlas sin
          saber quién hay detrás; pedirles que completen &ldquo;Mi entidad&rdquo; primero.
        </p>
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-2">
            <h3 className="label-mono">Intermediarios</h3>
            <PendientesPanel registroAddress={deployment.RegistroEntidades} tipo="intermediario" />
          </section>
          <section className="flex flex-col gap-2">
            <h3 className="label-mono">Transformadores</h3>
            <PendientesPanel registroAddress={deployment.RegistroEntidades} tipo="transformador" />
          </section>
        </div>
      </details>
    </div>
  );
}
