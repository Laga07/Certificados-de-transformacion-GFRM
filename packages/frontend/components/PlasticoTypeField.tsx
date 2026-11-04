import Link from "next/link";
import { PLASTICO_EJEMPLOS, TIPOS_PLASTICO } from "@/lib/catalogos";

export function PlasticoTypeField({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <label className="flex flex-col gap-1">
        Tipo de plástico
        <select
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        >
          {TIPOS_PLASTICO.map((nombre, index) => (
            <option key={nombre} value={index}>
              {nombre}
            </option>
          ))}
        </select>
      </label>

      <details className="text-xs">
        <summary className="cursor-pointer text-forest hover:underline w-fit">
          Qué significa cada tipo
        </summary>
        <ul className="mt-2 flex flex-col gap-1 text-neutral-500">
          {TIPOS_PLASTICO.map((nombre) =>
            PLASTICO_EJEMPLOS[nombre] ? (
              <li key={nombre}>
                <strong className="text-foreground">{nombre}</strong> &mdash;{" "}
                {PLASTICO_EJEMPLOS[nombre]}
              </li>
            ) : null,
          )}
        </ul>
      </details>

      <Link href="/guia-plasticos" className="text-forest hover:underline w-fit">
        ¿No estás seguro cuál es? Ver guía completa con pruebas para diferenciarlos →
      </Link>
    </div>
  );
}
