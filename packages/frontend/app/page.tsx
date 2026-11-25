import Image from "next/image";
import Link from "next/link";
import rioNuboso from "../public/rio nubosos 2.png";
import { MATERIALES, VARIANTES_POR_MATERIAL } from "@/lib/catalogos";
import { getSesion } from "@/lib/sesion.server";
import { IconEye, IconLayers, IconRoute, IconShieldCheck } from "@/components/icons";
import { RecorridoLote } from "@/components/lobby/RecorridoLote";
import { PasosPorRol } from "@/components/lobby/PasosPorRol";
import { RepartoAnimado } from "@/components/lobby/RepartoAnimado";
import { Revelar } from "@/components/lobby/Revelar";

// Lobby publico: explica la plataforma a quien todavia no tiene cuenta (proxy.ts deja pasar
// "/" sin sesion). Con sesion, los llamados a la accion llevan a la app en vez de al registro.
export default async function Home() {
  const sesion = await getSesion();
  const conSesion = sesion !== null;

  return (
    <div className="flex flex-col gap-20">
      {/* ---- Portada ---- */}
      <section className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center pt-2">
        <div className="flex flex-col gap-5">
          <span className="tag-mono">Valor Verde · Costa Rica · red de prueba Polygon Amoy</span>
          <h1 className="text-4xl sm:text-5xl font-heading italic font-semibold leading-[1.05] text-navy text-balance">
            Del residuo al certificado, con cada kilo rastreado
          </h1>
          <p className="text-lg text-foreground/75 max-w-xl">
            Plástico, cartón, tetrapack, vidrio y metales. Desde quien los separa hasta quien los
            transforma, cada paso queda firmado en la blockchain. Al final, un Certificado de
            Transformación que una empresa compra, declara y cualquiera puede verificar.
          </p>
          <div className="flex flex-wrap gap-3">
            {conSesion ? (
              <>
                <Link href="/cuenta" className="rounded-sm bg-forest px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-white hover:bg-forest-light">
                  Ir a mi cuenta
                </Link>
                <Link href="/mercado" className="rounded-sm border border-neutral-300 px-5 py-2.5 font-mono text-xs uppercase tracking-wider hover:border-forest hover:text-forest">
                  Ver el catálogo
                </Link>
              </>
            ) : (
              <>
                <Link href="/crear-cuenta" className="rounded-sm bg-forest px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-white hover:bg-forest-light">
                  Crear cuenta
                </Link>
                <Link href="#recorrido" className="rounded-sm border border-neutral-300 px-5 py-2.5 font-mono text-xs uppercase tracking-wider hover:border-forest hover:text-forest">
                  Ver cómo funciona
                </Link>
              </>
            )}
          </div>
          {!conSesion ? (
            <p className="text-sm text-foreground/60">
              ¿Ya tenés cuenta?{" "}
              <Link href="/login" className="text-forest hover:underline">
                Iniciá sesión
              </Link>
            </p>
          ) : null}
        </div>
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={rioNuboso}
            alt="Río en un bosque nuboso de Costa Rica"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* ---- El recorrido de un lote (animacion principal) ---- */}
      <section id="recorrido" className="scroll-mt-6 rounded-2xl bg-navy px-5 py-10 sm:px-10 sm:py-12 flex flex-col gap-8 text-white">
        <div className="flex flex-col gap-2 max-w-2xl">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-gold">El recorrido de un lote</span>
          <h2 className="text-3xl font-heading italic font-semibold text-balance">
            Seis pasos, cada uno firmado por quien lo hace
          </h2>
          <p className="text-white/70">
            Seguí 10.000 kg de PET desde una casa en Heredia hasta la constancia que una empresa
            presenta ante el Ministerio de Salud. El peso baja con cada merma, y cada merma queda a
            cargo de quien la generó.
          </p>
        </div>
        <RecorridoLote />
      </section>

      {/* ---- Pasos por rol ---- */}
      <Revelar as="section" className="flex flex-col gap-6">
        <div>
          <span className="tag-mono">Para empezar</span>
          <h2 className="text-3xl font-heading font-semibold text-navy mt-3 text-balance">¿Qué rol tenés en la cadena?</h2>
          <p className="text-foreground/70 mt-1 max-w-2xl">
            Una wallet, un rol. Intermediarios y transformadores pasan por una verificación de Green
            Foot antes de operar, porque reciben material de terceros.
          </p>
        </div>
        <PasosPorRol conSesion={conSesion} />
      </Revelar>

      {/* ---- Reparto ---- */}
      <Revelar as="section" className="border border-neutral-300 bg-surface-warm p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-heading font-semibold text-navy text-balance">Cómo se reparte cada venta</h2>
          <p className="text-foreground/70 mt-1 max-w-2xl">
            El mismo ejemplo: la empresa compra los 9.506 certificados a 1 USDT. El contrato acredita
            a cada participante en el instante de la compra. Nadie custodia el dinero de nadie.
          </p>
        </div>
        <RepartoAnimado />
      </Revelar>

      {/* ---- Garantias ---- */}
      <section className="grid gap-6 sm:grid-cols-3">
        {[
          {
            Icono: IconRoute,
            titulo: "Trazable",
            texto: "Cada certificado conserva qué separadores aportaron, por qué manos pasó el lote y cuánto se perdió en cada tramo.",
          },
          {
            Icono: IconShieldCheck,
            titulo: "Sin doble conteo",
            texto: "Un certificado declarado se quema en la blockchain: ningún otro informe puede volver a usar esos kilos.",
          },
          {
            Icono: IconEye,
            titulo: "Verificable por cualquiera",
            texto: "Cada constancia trae un código QR. Un auditor o el Ministerio lo comprueban sin pedirle nada a nadie.",
          },
        ].map((g, i) => (
          <Revelar key={g.titulo} retraso={i * 120} className="border-t-2 border-forest pt-4 flex flex-col gap-2">
            <span className="text-clay">
              <g.Icono className="h-6 w-6" />
            </span>
            <h3 className="font-heading font-semibold text-navy">{g.titulo}</h3>
            <p className="text-sm text-foreground/70">{g.texto}</p>
          </Revelar>
        ))}
      </section>

      {/* ---- Verificacion publica ---- */}
      <Revelar as="section" className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-3">
          <span className="tag-mono">Transparencia</span>
          <h2 className="text-3xl font-heading font-semibold text-navy text-balance">Una constancia que se defiende sola</h2>
          <p className="text-foreground/70">
            Cuando una empresa declara sus certificados para un informe, recibe una constancia con
            el origen del material: cantones, separadores, intermediarios y la transacción en la
            blockchain. Quien la recibe escanea el QR y la comprueba en segundos, sin crear cuenta.
          </p>
          <Link href="/verificar" className="w-fit label-mono text-forest hover:underline">
            Verificar una constancia →
          </Link>
        </div>
        <div className="border border-neutral-300 bg-white p-5 shadow-sm flex flex-col gap-3 rotate-[-1deg]" aria-hidden="true">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <span className="label-mono">Constancia de retiro</span>
            <span className="font-mono text-xs">VV-7K3P-9QXM</span>
          </div>
          <p className="text-sm">
            <strong>Embotelladora Tropical S.A.</strong> retiró <strong>9.506 certificados de plástico</strong> para su
            informe ante el Ministerio de Salud, año 2026.
          </p>
          <div className="flex items-end justify-between gap-3">
            <ul className="text-xs text-foreground/65 flex flex-col gap-0.5">
              <li>✓ Retiro registrado en Polygon</li>
              <li>✓ Huella digital coincide</li>
              <li>✓ 1 separador · 2 intermediarios · Heredia</li>
            </ul>
            <div className="grid grid-cols-5 gap-0.5 p-1 border border-neutral-300">
              {Array.from({ length: 25 }, (_, i) => (
                <span key={i} className={`h-2.5 w-2.5 ${[0, 1, 3, 4, 5, 9, 12, 15, 19, 20, 21, 23, 24, 7, 17].includes(i) ? "bg-navy" : "bg-transparent"}`} />
              ))}
            </div>
          </div>
        </div>
      </Revelar>

      {/* ---- Materiales ---- */}
      <Revelar as="section" className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-navy">Cinco materiales, un certificado por cada uno</h2>
          <p className="text-foreground/70 mt-1 max-w-2xl">
            Cada material tiene su propio certificado. La variante se registra en cada entrega para
            que el comprador sepa exactamente qué respalda.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {MATERIALES.map((material) => {
            const variantes = VARIANTES_POR_MATERIAL[material];
            return (
              <div key={material} className="border border-neutral-300 p-4 flex flex-col gap-2">
                <span className="text-clay">
                  <IconLayers className="h-5 w-5" />
                </span>
                <h3 className="font-heading font-semibold text-navy">{material}</h3>
                <p className="text-xs text-foreground/60">{variantes.length > 0 ? variantes.join(" · ") : "Sin subcategorías"}</p>
              </div>
            );
          })}
        </div>
      </Revelar>

      {/* ---- Gas: quien paga cada operacion ---- */}
      <Revelar as="section" className="border border-neutral-300 p-6 sm:p-8 flex flex-col gap-3">
        <span className="tag-mono">Quién paga cada operación</span>
        <p className="text-foreground/75 max-w-2xl">
          Cada operación en la blockchain tiene un costo pequeño (gas) que se paga en POL.{" "}
          <strong className="text-forest">Las entregas las paga quien recibe el material</strong>, no el separador. Cada
          participante paga su propio registro inicial y las operaciones que hace él mismo: traspasar,
          transformar, comprar o retirar sus pagos. Mientras estemos en la red de prueba, el POL es gratuito.
        </p>
      </Revelar>

      {/* ---- Cierre ---- */}
      <section className="flex flex-col items-start gap-4 border-t border-neutral-300 pt-10">
        <h2 className="text-3xl font-heading italic font-semibold text-navy text-balance">
          {conSesion ? "Seguí donde quedaste" : "Empezá hoy, en la red de prueba"}
        </h2>
        <p className="text-foreground/70 max-w-2xl">
          {conSesion
            ? "Completá los datos de tu entidad, vinculá tu wallet y registrate con tu rol."
            : "Creá tu cuenta, seguí la guía de inicio y recorré el ciclo completo con POL y USDT de prueba, sin costo."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={conSesion ? "/cuenta" : "/crear-cuenta"}
            className="rounded-sm bg-forest px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-white hover:bg-forest-light"
          >
            {conSesion ? "Ir a mi cuenta" : "Crear cuenta"}
          </Link>
          <Link href="/guia-inicio" className="rounded-sm border border-neutral-300 px-5 py-2.5 font-mono text-xs uppercase tracking-wider hover:border-forest hover:text-forest">
            Guía de inicio
          </Link>
        </div>
        <p className="text-xs text-amber-800">
          Red de prueba Polygon Amoy: el USDT es de prueba y los certificados todavía no tienen valor económico.
        </p>
      </section>
    </div>
  );
}
