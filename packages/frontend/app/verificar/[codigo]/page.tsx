import Link from "next/link";
import type { VerificacionPublica } from "@/lib/api";
import { API_URL_SERVER } from "@/lib/apiUrl";
import { cabecerasDelVisitante } from "@/lib/api.server";
import { getDeploymentAddresses } from "@/lib/addresses.server";
import { nombreMaterialPorClave } from "@/lib/catalogos";
import { urlTx } from "@/lib/explorador";
import { OrigenMaterial } from "@/components/OrigenMaterial";
import { BuscarCodigo } from "../BuscarCodigo";

export const metadata = { title: "Verificación de constancia" };

// Publica: cualquiera que escanee el QR de una constancia llega aca sin cuenta.
export default async function VerificarCodigoPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const deployment = getDeploymentAddresses();
  let datos: VerificacionPublica | null = null;
  let noExiste = false;
  try {
    const res = await fetch(`${API_URL_SERVER}/api/verificar/${encodeURIComponent(codigo)}`, {
      cache: "no-store",
      headers: await cabecerasDelVisitante(),
    });
    if (res.ok) datos = (await res.json()) as VerificacionPublica;
    else noExiste = res.status === 404 || res.status === 400;
  } catch {
    datos = null;
  }

  if (!datos) {
    return (
      <div className="flex flex-col gap-5 max-w-xl">
        <h1 className="text-2xl font-heading font-semibold text-navy">
          {noExiste ? "No encontramos esa constancia" : "No se pudo verificar ahora"}
        </h1>
        <p className="text-sm text-foreground/70">
          {noExiste
            ? `No existe una constancia confirmada con el código ${codigo.toUpperCase()}. Revisá que esté bien escrito: los códigos tienen la forma VV-XXXX-XXXX.`
            : "El servicio de verificación no respondió. Probá de nuevo en unos minutos."}
        </p>
        <BuscarCodigo inicial={codigo} />
      </div>
    );
  }

  const valida = datos.estado === "CONFIRMADA" && datos.huellaCoincide && Boolean(datos.txHash);
  const fecha = datos.confirmadaEn ? new Date(datos.confirmadaEn) : null;
  const material = nombreMaterialPorClave(datos.material).toLowerCase();
  const chainId = deployment?.chainId ?? 80002;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div
        className={`border-2 p-5 flex flex-col gap-1 ${valida ? "border-forest bg-surface-warm" : "border-red-500 bg-red-50"}`}
        role="status"
      >
        <span className={`label-mono ${valida ? "text-forest" : "text-red-700"}`}>
          {valida ? "Constancia válida" : "Constancia con inconsistencias"}
        </span>
        <p className="text-xl font-heading font-semibold text-navy">
          {datos.razonSocial ?? "Una empresa"} retiró {Number(datos.cantidadKg).toLocaleString("es-CR")} Certificados de
          Transformación de {material}
        </p>
        <p className="text-sm text-foreground/70">
          Para su informe ante {datos.entidadDestino}, {datos.periodoTexto.toLowerCase()}
          {fecha ? `, el ${fecha.toLocaleDateString("es-CR", { dateStyle: "long" })}` : ""}.
        </p>
        {!valida ? (
          <p className="text-sm text-red-700">
            Los datos guardados no coinciden con la huella registrada en la blockchain. No acepte esta constancia sin
            consultar a Green Foot.
          </p>
        ) : null}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 text-sm">
        <Dato etiqueta="Código" valor={datos.codigo} mono />
        <Dato etiqueta="Empresa" valor={datos.razonSocial ?? "—"} />
        <Dato etiqueta="Cédula" valor={datos.cedulaJuridica ?? "—"} />
        <Dato etiqueta="Referencia del informe" valor={datos.referencia ?? "—"} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading font-semibold text-navy">Origen del material</h2>
        <OrigenMaterial origen={datos.origen} />
      </section>

      <section className="flex flex-col gap-3 border-t border-neutral-300 pt-4 text-sm">
        <h2 className="font-heading font-semibold text-navy">Cómo se comprobó</h2>
        <ul className="flex flex-col gap-2">
          <Comprobacion ok={Boolean(datos.txHash)}>
            El retiro está registrado en la blockchain Polygon
            {datos.txHash ? (
              <>
                {" "}(
                <a href={urlTx(chainId, datos.txHash)} target="_blank" rel="noreferrer" className="text-forest hover:underline">
                  ver transacción
                </a>
                , bloque {datos.blockNumber})
              </>
            ) : null}
            . Los certificados quedaron quemados y no pueden reutilizarse.
          </Comprobacion>
          <Comprobacion ok={datos.huellaCoincide}>
            La huella digital de los datos de esta declaración coincide con la grabada en esa transacción.
          </Comprobacion>
          <Comprobacion ok={datos.retiroIndexado}>El retiro figura en el registro público de la plataforma.</Comprobacion>
        </ul>
        <details className="text-xs">
          <summary className="cursor-pointer text-forest">Verificarlo uno mismo</summary>
          <div className="mt-2 flex flex-col gap-2">
            <p>
              Calcule keccak256 de este texto exacto y compárelo con el parámetro <span className="font-mono">informeRef</span>{" "}
              del evento <span className="font-mono">CertificadoRetirado</span> en la transacción:
            </p>
            <pre className="overflow-x-auto bg-surface-warm border border-neutral-300 p-2 font-mono text-[0.7rem] whitespace-pre-wrap break-all">
              {datos.contenido}
            </pre>
            <p>
              Huella esperada: <span className="font-mono break-all">{datos.informeRef}</span>
            </p>
          </div>
        </details>
        {chainId !== 137 ? (
          <p className="text-xs text-amber-800">Emitida en la red de prueba Polygon Amoy: sin valor legal ni económico.</p>
        ) : null}
      </section>

      <p className="text-sm">
        <Link href="/verificar" className="text-forest hover:underline">
          Verificar otra constancia
        </Link>
      </p>
    </div>
  );
}

function Dato({ etiqueta, valor, mono }: { etiqueta: string; valor: string; mono?: boolean }) {
  return (
    <div>
      <dt className="label-mono">{etiqueta}</dt>
      <dd className={mono ? "font-mono" : ""}>{valor}</dd>
    </div>
  );
}

function Comprobacion({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span aria-hidden="true" className={ok ? "text-forest" : "text-red-600"}>
        {ok ? "✓" : "✗"}
      </span>
      <span className="sr-only">{ok ? "Cumple:" : "No cumple:"}</span>
      <span>{children}</span>
    </li>
  );
}
