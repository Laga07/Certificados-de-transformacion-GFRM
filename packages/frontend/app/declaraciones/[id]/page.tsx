import Image from "next/image";
import Link from "next/link";
import { apiFetchServer } from "@/lib/api.server";
import type { Declaracion, OrigenDeclaracion } from "@/lib/api";
import { getDeploymentAddresses } from "@/lib/addresses.server";
import { MATERIALES } from "@/lib/catalogos";
import { urlTx } from "@/lib/explorador";
import { OrigenMaterial } from "@/components/OrigenMaterial";
import { QrVerificacion } from "@/components/QrVerificacion";
import { RetirarYConfirmar } from "../RetirarYConfirmar";
import { AccionesConstancia, BorrarPendiente } from "./Acciones";
import logo from "../../../public/GFRM-Logo.png";

export default async function DeclaracionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirmada?: string }>;
}) {
  const [{ id }, { confirmada }] = await Promise.all([params, searchParams]);
  const res = await apiFetchServer<{ declaracion: Declaracion; origen: OrigenDeclaracion; origenSincronizando: boolean }>(`/api/declaraciones/${id}`);
  const deployment = getDeploymentAddresses();

  if (!res || !deployment) {
    return <p className="text-neutral-500">No se encontró la declaración.</p>;
  }
  const { declaracion: d, origen, origenSincronizando } = res;
  const material = MATERIALES[d.materialIndex];

  if (d.estado === "PENDIENTE") {
    return (
      <div className="flex flex-col gap-5 max-w-2xl">
        <h1 className="text-2xl font-semibold text-navy">Declaración pendiente de firma</h1>
        <p className="text-sm text-foreground/70">
          Los datos están guardados, pero los certificados todavía no se retiraron on-chain: sin
          ese paso no hay constancia válida.
        </p>
        <dl className="grid gap-2 sm:grid-cols-2 text-sm border border-neutral-300 p-4">
          <Dato etiqueta="Código" valor={d.codigo} mono />
          <Dato etiqueta="Material" valor={`${Number(d.cantidadKg).toLocaleString("es-CR")} kg de ${material.toLowerCase()}`} />
          <Dato etiqueta="Entidad" valor={d.entidadDestino} />
          <Dato etiqueta="Período" valor={d.periodoTexto} />
        </dl>
        <RetirarYConfirmar declaracion={d} mercadoAddress={deployment.MercadoCertificados} etiqueta="Completar: firmar el retiro" />
        <BorrarPendiente id={d.id} />
      </div>
    );
  }

  const fecha = d.confirmadaEn ? new Date(d.confirmadaEn) : null;

  return (
    <div className="flex flex-col gap-4">
      {confirmada ? (
        <p className="no-print border border-forest bg-surface-warm px-4 py-2 text-sm text-forest">
          Listo: los certificados se retiraron y la declaración quedó registrada en la blockchain.
        </p>
      ) : null}
      <AccionesConstancia />

      <article className="constancia border border-neutral-300 bg-white p-6 sm:p-10 flex flex-col gap-6 text-foreground">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-300 pb-4">
          <div className="flex items-center gap-3">
            <Image src={logo} alt="" width={48} height={48} className="rounded-full" />
            <div>
              <p className="label-mono">Valor Verde · Green Foot Recycling Materials</p>
              <h1 className="text-2xl font-heading font-semibold text-navy">Constancia de retiro de Certificados de Transformación</h1>
            </div>
          </div>
          <div className="text-right">
            <p className="label-mono">Código</p>
            <p className="font-mono text-lg">{d.codigo}</p>
          </div>
        </header>

        <section className="grid gap-6 sm:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-3 text-sm">
            <p>
              Se hace constar que <strong>{d.razonSocial ?? "la wallet indicada"}</strong>
              {d.cedulaJuridica ? <> (cédula {d.cedulaJuridica})</> : null} retiró de circulación de forma permanente{" "}
              <strong>
                {Number(d.cantidadKg).toLocaleString("es-CR")} Certificados de Transformación de {material.toLowerCase()}
              </strong>
              , equivalentes a {Number(d.cantidadKg).toLocaleString("es-CR")} kg de material efectivamente transformado, para
              respaldar su informe ante <strong>{d.entidadDestino}</strong> correspondiente a{" "}
              <strong>{d.periodoTexto.toLowerCase()}</strong>.
            </p>
            {d.referencia ? (
              <p>
                Referencia del informe: <strong>{d.referencia}</strong>
              </p>
            ) : null}
            {d.descripcion ? <p className="text-foreground/80">{d.descripcion}</p> : null}
            <p className="text-xs text-foreground/60">
              Los certificados retirados fueron quemados en la red Polygon y no pueden volver a usarse en ningún otro informe.
            </p>
          </div>
          <QrVerificacion codigo={d.codigo} />
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-heading font-semibold text-navy">Origen del material</h2>
          <OrigenMaterial origen={origen} sincronizando={origenSincronizando} />
        </section>

        <section className="flex flex-col gap-2 text-xs border-t border-neutral-300 pt-4">
          <h2 className="font-heading font-semibold text-navy text-sm">Registro en la blockchain</h2>
          <dl className="grid gap-2 sm:grid-cols-2">
            <Dato etiqueta="Fecha del retiro" valor={fecha ? fecha.toLocaleString("es-CR", { dateStyle: "long", timeStyle: "short" }) : "—"} />
            <Dato etiqueta="Bloque" valor={d.blockNumber ?? "—"} mono />
            <Dato etiqueta="Wallet" valor={d.wallet} mono />
            <div>
              <dt className="label-mono">Transacción</dt>
              <dd className="font-mono break-all">
                {d.txHash ? (
                  <a href={urlTx(deployment.chainId, d.txHash)} target="_blank" rel="noreferrer" className="text-forest hover:underline">
                    {d.txHash}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="label-mono">Huella digital de esta declaración (keccak256), grabada en la transacción</dt>
              <dd className="font-mono break-all">{d.informeRef}</dd>
            </div>
          </dl>
          <p className="text-foreground/60">
            Para verificar esta constancia, escaneá el código QR o ingresá el código en {" "}
            <span className="font-mono">valorverde.org/verificar</span>.
            {deployment.chainId !== 137 ? " Emitida en la red de prueba Polygon Amoy: sin valor legal ni económico." : ""}
          </p>
        </section>
      </article>

      <p className="no-print text-sm">
        <Link href="/declaraciones" className="text-forest hover:underline">
          ← Mis declaraciones
        </Link>
      </p>
    </div>
  );
}

function Dato({ etiqueta, valor, mono }: { etiqueta: string; valor: string; mono?: boolean }) {
  return (
    <div>
      <dt className="label-mono">{etiqueta}</dt>
      <dd className={mono ? "font-mono break-all" : ""}>{valor}</dd>
    </div>
  );
}
