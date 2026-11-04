import Image from "next/image";
import Link from "next/link";
import rioNuboso from "../public/rio nubosos 2.png";
import {
  IconArrowRight,
  IconCoin,
  IconEye,
  IconFuel,
  IconGift,
  IconRoute,
  IconShieldCheck,
  IconTruck,
  IconWallet,
} from "@/components/icons";

const DATOS_REGISTRO = [
  { label: "Quién", detalle: "La wallet que entrega" },
  { label: "Cuánto", detalle: "Peso en gramos" },
  { label: "Dónde", detalle: "Centro o ruta municipal" },
  { label: "Cuándo", detalle: "Fecha y hora exacta" },
];

const ENTREGAS = [
  {
    href: "/transacciones/gratuita",
    icon: <IconGift className="h-6 w-6" />,
    title: "Entrega gratuita",
    description: "Entregás tu material a un centro recolector, registra tu colaboración con el ambiente.",
  },
  {
    href: "/transacciones/pagada",
    icon: <IconCoin className="h-6 w-6" />,
    title: "Transacción pagada",
    description:
      "El centro te puede pagar en USDT por tu material -- los tokens PLST quedan para el centro que lo recibe.",
  },
  {
    href: "/transacciones/lote-municipal",
    icon: <IconTruck className="h-6 w-6" />,
    title: "Entrega a lote municipal",
    description: "Reporta tu entrega a la ruta de recolección de tu municipalidad.",
  },
];

const ODS = [
  {
    n: 6,
    label: "Agua limpia y saneamiento",
    detalle:
      "La recuperación de plástico valorizable en Costa Rica cayó de 37% (2017) a 12% (2021) " +
      "(PNGIR 2023, p. 12). Cada gramo trazado por esta dapp es un gramo con menos probabilidad " +
      "de terminar obstruyendo ríos y quebradas de la GAM.",
  },
  {
    n: 9,
    label: "Industria, innovación e infraestructura",
    detalle:
      "El registro on-chain es, en sí mismo, la infraestructura de datos que hoy le falta a la " +
      "gestión de residuos en Costa Rica: un sistema resiliente y auditable, replicable en " +
      "cualquier cantón del país sin depender de una sola entidad.",
  },
  {
    n: 11,
    label: "Ciudades y comunidades sostenibles",
    detalle:
      "Los datos se filtran por provincia y cantón (ver Panel Municipal) -- la misma " +
      "granularidad con la que trabajan las municipalidades, para que la gestión de residuos " +
      "urbanos deje de operar a ciegas.",
  },
  {
    n: 12,
    label: "Producción y consumo responsable",
    detalle:
      "Cada transacción distingue el tipo de plástico (PET, HDPE, PVC, LDPE, PP, PS/EPS) y su " +
      "valor técnico y ambiental, no solo su peso -- la base para decisiones informadas de " +
      "consumo y producción.",
  },
  {
    n: 13,
    label: "Acción por el clima",
    detalle:
      "Menos plástico sin trazar significa menos quema informal e incineración no controlada, " +
      "una fuente reconocida de emisiones dentro de la gestión actual de residuos.",
  },
  {
    n: 14,
    label: "Vida submarina",
    detalle:
      "Costa Rica limita con dos océanos. El plástico que hoy no se recupera en la GAM es una " +
      "de las rutas más directas hacia ríos, playas y ecosistemas marinos costeros.",
  },
  {
    n: 16,
    label: "Paz, justicia e instituciones sólidas",
    detalle:
      "La asimetría de información entre los grandes centros de acopio y los recolectores base " +
      "es, en el fondo, un problema de trazabilidad de mercado -- el mismo que un registro " +
      "inmutable y auditable ataca directamente.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center pt-2">
        <div className="flex flex-col gap-5">
          <span className="tag-mono">Espécimen 001 &middot; Polygon Amoy, GAM Costa Rica</span>
          <h1 className="text-4xl font-heading italic font-semibold leading-tight text-navy">
            Trazabilidad real para el plástico que Costa Rica recupera
          </h1>
          <p className="text-foreground/70 max-w-lg">
            Detrás de cada kilogramo recuperado hay alguien que hoy no aparece en ninguna
            estadística. Aquí ese trabajo queda registrado y se puede comprobar.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/registro/usuario"
              className="rounded-sm bg-forest px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-white hover:bg-forest-light"
            >
              Registrarme y empezar
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
            alt="Rio en un bosque nuboso de Costa Rica"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-navy">Registra tu entrega</h2>
          <p className="text-foreground/70 mt-1 max-w-2xl">
            Elegí cómo entregaste tu material -- a un clic de registrar la transacción on-chain.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {ENTREGAS.map((entrega) => (
            <Link
              key={entrega.href}
              href={entrega.href}
              className="group border border-neutral-300 bg-surface-warm p-5 flex flex-col gap-3 hover:border-forest transition-colors"
            >
              <span className="text-clay group-hover:text-forest transition-colors">
                {entrega.icon}
              </span>
              <h3 className="font-heading font-semibold text-navy">{entrega.title}</h3>
              <p className="text-sm text-foreground/70">{entrega.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <span className="tag-mono">Qué queda registrado</span>
          <p className="text-foreground/70 mt-3 max-w-2xl">
            Cada recolección queda registrada mediante un token: quién, cuánto, dónde y
            cuándo. Un registro inmutable, que dignifica el trabajo de los recolectores
            base y otorga datos confiables a municipalidades e instituciones.
          </p>
        </div>

        <div className="border border-neutral-300 bg-surface-warm p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
            <div className="grid grid-cols-2 gap-3">
              {DATOS_REGISTRO.map((dato) => (
                <div
                  key={dato.label}
                  className="border border-neutral-300 bg-background px-3 py-2.5 flex flex-col gap-0.5"
                >
                  <span className="label-mono text-forest">{dato.label}</span>
                  <span className="text-xs text-foreground/70">{dato.detalle}</span>
                </div>
              ))}
            </div>

            <ArrowConnector />

            <div className="border-2 border-forest bg-background px-5 py-6 flex flex-col items-center gap-2 text-center">
              <IconShieldCheck className="h-7 w-7 text-forest" />
              <p className="font-heading font-semibold text-navy">Token PLST</p>
              <p className="label-mono">Registro inmutable</p>
            </div>

            <ArrowConnector />

            <div className="border border-neutral-300 px-5 py-6 flex flex-col items-center gap-2 text-center">
              <IconEye className="h-7 w-7 text-clay" />
              <p className="font-heading font-semibold text-navy">
                Municipalidades e instituciones
              </p>
              <p className="label-mono">Datos confiables</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-navy">Cómo funciona</h2>
          <p className="text-foreground/70 mt-1 max-w-2xl">
            Un token ERC-20 respalda cada recolección registrada. Tres garantías técnicas
            resuelven el problema de fondo.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={<IconRoute className="h-6 w-6" />}
            title="Trazabilidad"
            description="El origen de cada lote es verificable: usuario, centro o municipalidad, y ruta de recolección."
          />
          <FeatureCard
            icon={<IconEye className="h-6 w-6" />}
            title="Transparencia"
            description="Cualquier institución o ciudadano puede auditar el histórico de transacciones."
          />
          <FeatureCard
            icon={<IconShieldCheck className="h-6 w-6" />}
            title="Inmutabilidad"
            description="Nadie altera un registro después de creado: no hay doble conteo de plástico recuperado."
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <RoleCard
          href="/registro/usuario"
          title="Soy un Usuario"
          description="Registrate para poder entregar plástico y recibir tokens PLST."
        />
        <RoleCard
          href="/registro/centro"
          title="Soy un Centro Recolector"
          description="Registra tu centro; un verificador debe aprobarlo antes de operar."
        />
        <RoleCard
          href="/dashboard"
          title="Ver Dashboard"
          description="Estadísticas y transacciones históricas indexadas desde la chain."
        />
        <RoleCard
          href="/perfil"
          title="Mi Perfil"
          description="Estado on-chain de tu wallet: usuario, centro verificado o municipalidad."
        />
      </section>

      <section className="flex flex-col gap-4 pb-4">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-navy">
            Marco institucional y Objetivos de Desarrollo Sostenible
          </h2>
          <p className="text-foreground/70 mt-1 max-w-2xl">
            Alineado con la Ley 8839 y la Política Nacional para la Gestión Integral de Residuos
            (PNGIR 2023-2033). Toca cada ODS para ver cómo se conecta con esta investigación.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ODS.map((ods) => (
            <details
              key={ods.n}
              className="group border border-neutral-300 open:border-forest transition-colors"
            >
              <summary className="cursor-pointer list-none flex items-center gap-4 p-4">
                <span className="text-3xl font-heading italic font-semibold text-gold shrink-0">
                  {ods.n}
                </span>
                <span className="font-medium text-navy">{ods.label}</span>
                <span className="ml-auto text-foreground/40 group-open:rotate-180 transition-transform">
                  &darr;
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm text-foreground/70">{ods.detalle}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border border-neutral-300 bg-surface-warm p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <span className="tag-mono">Cómo funciona el gas</span>
          <p className="mt-3 text-foreground/70 max-w-2xl">
            En las entregas gratuitas,{" "}
            <strong className="text-forest">quien recibe el material paga el gas</strong> (el
            Centro Recolector o la Municipalidad). El Usuario final solo necesita su wallet
            conectada, sin necesidad de fondos en POL, para entregar su material.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-2">
          <GasFlowNode
            icon={<IconWallet className="h-6 w-6" />}
            title="Usuario"
            caption="Sin POL en su wallet"
          />

          <GasFlowConnector />

          <GasFlowNode
            icon={<IconFuel className="h-6 w-6" />}
            title="Centro / Municipalidad"
            caption="Paga el gas de la transacción"
            highlight
          />

          <GasFlowConnector animado />

          <GasFlowNode
            icon={<IconShieldCheck className="h-6 w-6" />}
            title="Blockchain"
            caption="Registro confirmado"
          />
        </div>
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

// Linea que conecta dos nodos del flujo de gas: horizontal en desktop, vertical apilada
// en mobile. `animado` agrega el punto dorado que recorre el tramo donde efectivamente
// se paga el gas (Centro/Municipalidad -> Blockchain), en loop continuo.
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

function ArrowConnector() {
  return (
    <div className="flex items-center justify-center text-neutral-400">
      <IconArrowRight className="hidden lg:block h-6 w-6" />
      <IconArrowRight className="lg:hidden h-6 w-6 rotate-90" />
    </div>
  );
}

function RoleCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="border border-neutral-300 p-4 hover:border-forest transition-colors"
    >
      <h3 className="font-heading font-medium text-navy">{title}</h3>
      <p className="text-sm text-foreground/70 mt-1">{description}</p>
    </Link>
  );
}
