import Link from "next/link";
import { GUIA_PLASTICOS, type IconoEjemplo } from "@/lib/plasticoGuia";
import {
  IconBag,
  IconBottle,
  IconCap,
  IconCube,
  IconCup,
  IconEggCarton,
  IconFilmRoll,
  IconFoamBlock,
  IconJug,
  IconLayers,
  IconPanel,
  IconPipe,
  IconRecyclingTriangle,
  IconStraw,
} from "@/components/icons";

const ICONOS_EJEMPLO: Record<IconoEjemplo, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  bottle: IconBottle,
  jug: IconJug,
  pipe: IconPipe,
  bag: IconBag,
  filmRoll: IconFilmRoll,
  panel: IconPanel,
  cap: IconCap,
  cup: IconCup,
  straw: IconStraw,
  eggCarton: IconEggCarton,
  foamBlock: IconFoamBlock,
  layers: IconLayers,
  cube: IconCube,
};

export const metadata = {
  title: "Guía de clasificación de plásticos · GreenMaterialsDAPP",
  description:
    "Guía de campo para reconocer los tipos de plástico (PET, PEAD, PVC, PEBD, PP, PS y otros): características, ejemplos y pruebas seguras para diferenciarlos.",
};

export default function GuiaPlasticosPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <span className="tag-mono">Guía de campo</span>
        <h1 className="text-3xl font-heading italic font-semibold leading-tight text-navy">
          Clasificación de plásticos
        </h1>
        <p className="text-foreground/70 max-w-2xl">
          Los mismos 7 tipos que ves en el selector al registrar una entrega, explicados con
          sus características, ejemplos cotidianos y pruebas seguras para diferenciarlos --
          sin balanza ni laboratorio.
        </p>

        <div className="border border-amber-200 bg-amber-50 text-amber-900 text-sm px-4 py-3 max-w-2xl">
          <strong>Antes de empezar:</strong> nunca quemes un plástico para identificarlo. Al
          arder libera gases tóxicos -- el PVC en particular libera cloro. Las pruebas de esta
          guía (flotación, tacto, símbolo de reciclaje) son seguras y suficientes en la
          práctica.
        </div>
      </section>

      <nav
        aria-label="Salto rápido por tipo de plástico"
        className="sticky top-0 z-10 -mx-6 bg-background px-6 py-3 border-b border-neutral-300 flex gap-2 overflow-x-auto"
      >
        {GUIA_PLASTICOS.map((tipo) => (
          <a
            key={tipo.slug}
            href={`#${tipo.slug}`}
            className="tag-mono shrink-0 hover:border-forest hover:text-forest"
          >
            {tipo.codigo} · {tipo.nombre}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-6">
        {GUIA_PLASTICOS.map((tipo) => (
          <article
            key={tipo.slug}
            id={tipo.slug}
            className="scroll-mt-20 border border-neutral-300 bg-surface-warm p-6 sm:p-8 flex flex-col gap-6"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <span className="text-5xl font-heading italic font-semibold text-gold shrink-0 leading-none">
                  {tipo.codigo}
                </span>
                <div>
                  <h2 className="text-2xl font-heading font-semibold text-navy">{tipo.nombre}</h2>
                  <p className="text-foreground/70">{tipo.nombreCompleto}</p>
                </div>
              </div>
              <span
                className="inline-flex items-center gap-1.5 label-mono border border-neutral-300 px-2.5 py-1.5 shrink-0"
                title="Buscá este símbolo moldeado en la base del envase"
              >
                <IconRecyclingTriangle className="h-4 w-4" />
                Símbolo {tipo.codigo}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <StatChip label="Densidad" value={tipo.densidad} />
              <StatChip label="¿Flota?" value={tipo.flota} />
              <StatChip label="Rigidez" value={tipo.rigidez} />
              <StatChip label="Transparencia" value={tipo.transparencia} />
              <StatChip label="Color típico" value={tipo.colorTipico} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="label-mono text-forest mb-2">Cómo reconocerlo</h3>
                <ul className="flex flex-col gap-1.5 text-sm text-foreground/80">
                  {tipo.comoReconocerlo.map((tip) => (
                    <li key={tip} className="flex gap-2">
                      <span className="text-clay shrink-0">›</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="label-mono text-forest mb-2">Dónde lo encontrás</h3>
                <ul className="grid grid-cols-3 gap-2">
                  {tipo.ejemplos.map((ejemplo) => {
                    const Icono = ICONOS_EJEMPLO[ejemplo.icono];
                    return (
                      <li
                        key={ejemplo.label}
                        className="flex flex-col items-center gap-1.5 text-center border border-neutral-300 bg-background px-2 py-3"
                      >
                        <Icono className="h-6 w-6 text-clay" />
                        <span className="text-xs text-foreground/80 leading-tight">
                          {ejemplo.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {tipo.notaEspecial ? (
              <p className="text-sm text-foreground/70 border-t border-neutral-300 pt-4">
                <strong className="text-navy">Ojo con esto:</strong> {tipo.notaEspecial}
              </p>
            ) : null}
          </article>
        ))}
      </div>

      <section className="border border-neutral-300 bg-surface-warm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div>
          <h2 className="font-heading font-semibold text-navy">¿Ya identificaste tu material?</h2>
          <p className="text-sm text-foreground/70 mt-1">
            Registrá tu entrega y seleccioná el tipo correcto -- así el registro on-chain queda
            preciso desde el origen.
          </p>
        </div>
        <Link
          href="/transacciones/gratuita"
          className="rounded-sm bg-forest px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-white hover:bg-forest-light shrink-0 w-fit"
        >
          Registrar entrega
        </Link>
      </section>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-neutral-300 bg-background px-3 py-2.5 flex flex-col gap-0.5">
      <span className="label-mono">{label}</span>
      <span className="text-sm text-navy">{value}</span>
    </div>
  );
}
