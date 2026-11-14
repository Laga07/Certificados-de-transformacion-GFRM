import Image from "next/image";
import Link from "next/link";
import rioNuboso from "../public/rio nubosos 2.png";
import { MATERIALES, VARIANTES_POR_MATERIAL } from "@/lib/catalogos";
import {
  IconArrowRight,
  IconCoin,
  IconEye,
  IconFuel,
  IconLayers,
  IconRecyclingTriangle,
  IconRoute,
  IconShieldCheck,
  IconTruck,
  IconWallet,
} from "@/components/icons";

// El ciclo completo que cubre el sistema. ES una secuencia real (cada paso depende del
// anterior), por eso va numerado.
const CICLO = [
  {
    titulo: "Entrega",
    detalle:
      "Un separador entrega material a un intermediario o directo a un transformador. Quien recibe lo registra y paga el gas: el separador solo necesita su wallet.",
    icon: <IconWallet className="h-6 w-6" />,
  },
  {
    titulo: "Traspaso",
    detalle:
      "El lote viaja entre intermediarios en dos pasos: quien envía declara el peso, quien recibe confirma el que de verdad llegó. La diferencia (merma) queda atribuida a alguien.",
    icon: <IconTruck className="h-6 w-6" />,
  },
  {
    titulo: "Transformación",
    detalle:
      "El transformador verificado consume los lotes, declara los kilos efectivamente transformados y fija el precio del certificado.",
    icon: <IconRecyclingTriangle className="h-6 w-6" />,
  },
  {
    titulo: "Certificado",
    detalle:
      "Un comprador paga en USDT y recibe el Certificado de Transformación: un token ERC-20 donde 1 unidad = 1 kg transformado, con todo su origen auditable.",
    icon: <IconShieldCheck className="h-6 w-6" />,
  },
];

const ROLES = [
  {
    href: "/registro/separador",
    titulo: "Separador",
    detalle: "Hogar, comercio, industria, institución o recuperador inclusivo. Entregás material y recibís el 35 % de cada venta del certificado que salga de él.",
    nota: "Registro inmediato",
  },
  {
    href: "/registro/intermediario",
    titulo: "Intermediario",
    detalle: "Recolector, centro de acopio, ruta municipal, compactador o transportista. Recibís, unís, dividís y traspasás lotes.",
    nota: "Requiere verificación",
  },
  {
    href: "/registro/transformador",
    titulo: "Transformador",
    detalle: "Convertís el material en materia prima y emitís el certificado. Fijás el precio por kilo.",
    nota: "Requiere verificación",
  },
  {
    href: "/registro/comprador",
    titulo: "Comprador",
    detalle: "Empresa que necesita demostrar material transformado. Comprás certificados y los retirás en tu informe de cumplimiento.",
    nota: "Registro inmediato",
  },
];

// Tabla 11 del documento de arquitectura. Porcentajes fijos del contrato.
const REPARTO = [
  { quien: "Separadores", pct: 35, detalle: "pro rata a los kilos aportados" },
  { quien: "Intermediarios", pct: 20, detalle: "en partes iguales entre quienes movieron el lote" },
  { quien: "Transformador", pct: 30, detalle: "quien emite el certificado" },
  { quien: "Plataforma", pct: 15, detalle: "Green Foot" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center pt-2">
        <div className="flex flex-col gap-5">
          <span className="tag-mono">Polygon Amoy &middot; red de prueba &middot; Costa Rica</span>
          <h1 className="text-4xl font-heading italic font-semibold leading-tight text-navy">
            Del residuo al certificado, con cada kilo rastreado
          </h1>
          <p className="text-foreground/70 max-w-lg">
            Plástico, cartón, tetrapack, vidrio y metales: desde quien los separa hasta quien los
            transforma, cada paso queda registrado en la cadena. Al final, un Certificado de
            Transformación que una empresa puede comprar, auditar y presentar.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#roles"
              className="rounded-sm bg-forest px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-white hover:bg-forest-light"
            >
              Registrarme
            </Link>
            <Link
              href="/dashboard"
              className="rounded-sm border border-neutral-300 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-foreground hover:border-forest hover:text-forest"
            >
              Ver dashboard
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={rioNuboso}
            alt="Río en un bosque nuboso de Costa Rica"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-navy">Cómo funciona</h2>
          <p className="text-foreground/70 mt-1 max-w-2xl">
            Cuatro pasos, cada uno firmado por quien lo hace. El certificado hereda la historia
            completa del material que lo respalda.
          </p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CICLO.map((paso, index) => (
            <li
              key={paso.titulo}
              className="border-t-2 border-forest pt-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-clay">{paso.icon}</span>
                <span className="font-heading italic text-2xl text-gold">{index + 1}</span>
              </div>
              <h3 className="font-heading font-semibold text-navy">{paso.titulo}</h3>
              <p className="text-sm text-foreground/70">{paso.detalle}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="roles" className="flex flex-col gap-6 scroll-mt-6">
        <div>
          <span className="tag-mono">Quién participa</span>
          <p className="text-foreground/70 mt-3 max-w-2xl">
            Una wallet, un rol. Elegí el tuyo para registrarte. Intermediarios y transformadores
            pasan por una verificación de Green Foot antes de poder operar, porque reciben
            material de terceros.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {ROLES.map((rol) => (
            <Link
              key={rol.href}
              href={rol.href}
              className="group border border-neutral-300 bg-surface-warm p-5 flex flex-col gap-3 hover:border-forest transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-heading font-semibold text-navy">{rol.titulo}</h3>
                <span className="label-mono">{rol.nota}</span>
              </div>
              <p className="text-sm text-foreground/70">{rol.detalle}</p>
              <span className="mt-auto flex items-center gap-1 label-mono text-forest group-hover:underline">
                Registrarme <IconArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-navy">Cinco materiales, un certificado por cada uno</h2>
          <p className="text-foreground/70 mt-1 max-w-2xl">
            Cada material tiene su propio token de certificado. Las variantes se registran en cada
            entrega para que el comprador sepa exactamente qué respalda su certificado.
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
                <p className="text-xs text-foreground/60">
                  {variantes.length > 0 ? variantes.join(" · ") : "Sin subcategorías"}
                </p>
              </div>
            );
          })}
        </div>
        <Link href="/guia-plasticos" className="w-fit label-mono text-forest hover:underline">
          Ver la guía de plásticos &rarr;
        </Link>
      </section>

      <section className="border border-neutral-300 bg-surface-warm p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-navy">Cómo se reparte cada venta</h2>
          <p className="text-foreground/70 mt-1 max-w-2xl">
            Cuando un comprador paga un certificado, el contrato acredita el valor en el mismo
            instante a cada participante del lote. Nadie custodia el dinero de nadie: cada quien
            retira lo suyo cuando quiere.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex h-8 w-full overflow-hidden rounded-sm border border-neutral-300">
            {REPARTO.map((parte, index) => (
              <div
                key={parte.quien}
                style={{ width: `${parte.pct}%` }}
                className={`flex items-center justify-center font-mono text-xs text-white ${
                  ["bg-forest", "bg-forest-light", "bg-clay", "bg-gold"][index]
                }`}
                title={`${parte.quien}: ${parte.pct} %`}
              >
                {parte.pct} %
              </div>
            ))}
          </div>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            {REPARTO.map((parte, index) => (
              <li key={parte.quien} className="flex items-start gap-2">
                <span
                  className={`mt-1 h-3 w-3 shrink-0 rounded-sm ${
                    ["bg-forest", "bg-forest-light", "bg-clay", "bg-gold"][index]
                  }`}
                />
                <span>
                  <strong className="text-navy">{parte.quien}</strong>
                  <br />
                  <span className="text-foreground/60 text-xs">{parte.detalle}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-foreground/70 max-w-2xl">
          <strong className="text-forest">La merma la paga quien la genera.</strong> Si un
          intermediario recibió 10 000 kg y entregó 9 800, esos 200 kg se le descuentan de su
          parte, no de la de los demás. Los separadores nunca generan merma y la plataforma nunca
          se beneficia de la pérdida de otro.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <FeatureCard
          icon={<IconRoute className="h-6 w-6" />}
          title="Trazabilidad"
          description="Cada certificado conserva qué separadores aportaron, por qué manos pasó el lote y cuánto se perdió en cada tramo."
        />
        <FeatureCard
          icon={<IconEye className="h-6 w-6" />}
          title="Transparencia"
          description="Cualquier institución o ciudadano puede auditar el histórico en el explorador de Polygon o en el dashboard."
        />
        <FeatureCard
          icon={<IconCoin className="h-6 w-6" />}
          title="Pago automático"
          description="El reparto ocurre dentro de la misma transacción de compra. Sin intermediarios financieros ni cuentas por cobrar."
        />
      </section>

      <section className="border border-neutral-300 p-6 sm:p-8 flex flex-col gap-4">
        <div>
          <span className="tag-mono">Cómo funciona el gas</span>
          <p className="mt-3 text-foreground/70 max-w-2xl">
            <strong className="text-forest">Quien recibe el material paga la transacción.</strong>{" "}
            El separador solo necesita una wallet conectada, sin POL. Intermediarios,
            transformadores y compradores sí necesitan POL para sus propias operaciones.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-2">
          <GasFlowNode icon={<IconWallet className="h-6 w-6" />} title="Separador" caption="Sin POL" />
          <GasFlowConnector />
          <GasFlowNode
            icon={<IconFuel className="h-6 w-6" />}
            title="Intermediario / Transformador"
            caption="Paga el gas"
            highlight
          />
          <GasFlowConnector animado />
          <GasFlowNode icon={<IconShieldCheck className="h-6 w-6" />} title="Polygon" caption="Registro confirmado" />
        </div>
      </section>

      <section className="border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900 flex flex-col gap-2">
        <strong className="font-heading">Esto es una red de prueba.</strong>
        <p>
          El sistema corre sobre Polygon Amoy. El USDT que se usa es de prueba y los certificados
          no tienen valor económico todavía. Sirve para probar el flujo completo con datos reales
          de operación antes de pasar a la red principal.
        </p>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border-t-2 border-forest pt-4 flex flex-col gap-2">
      <span className="text-clay">{icon}</span>
      <h3 className="font-heading font-semibold text-navy">{title}</h3>
      <p className="text-sm text-foreground/70">{description}</p>
    </div>
  );
}

function GasFlowNode({
  icon,
  title,
  caption,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  caption: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-1 flex-col items-center gap-1.5 text-center px-3 py-4 border ${
        highlight ? "border-forest bg-background" : "border-neutral-300 bg-background/60"
      }`}
    >
      <span className={highlight ? "text-forest" : "text-clay"}>{icon}</span>
      <p className="font-heading font-semibold text-navy text-sm">{title}</p>
      <p className="label-mono">{caption}</p>
    </div>
  );
}

function GasFlowConnector({ animado }: { animado?: boolean }) {
  return (
    <>
      <div className="relative hidden sm:block flex-1 min-w-6 h-px bg-neutral-300 mx-1">
        {animado ? <span className="gas-flow-dot" aria-hidden="true" /> : null}
      </div>
      <div className="relative block sm:hidden self-center w-px h-6 bg-neutral-300 my-1">
        {animado ? <span className="gas-flow-dot-vertical" aria-hidden="true" /> : null}
      </div>
    </>
  );
}
