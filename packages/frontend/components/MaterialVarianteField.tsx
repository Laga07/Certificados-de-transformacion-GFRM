import Link from "next/link";
import { MATERIALES, PLASTICO_EJEMPLOS, VARIANTES_POR_MATERIAL } from "@/lib/catalogos";

export function MaterialVarianteField({
  material,
  varianteId,
  onChangeMaterial,
  onChangeVariante,
}: {
  material: number;
  varianteId: number;
  onChangeMaterial: (value: number) => void;
  onChangeVariante: (value: number) => void;
}) {
  const nombreMaterial = MATERIALES[material];
  const variantes = VARIANTES_POR_MATERIAL[nombreMaterial];

  return (
    <div className="flex flex-col gap-3 text-sm">
      <label className="flex flex-col gap-1">
        Material
        <select
          value={material}
          onChange={(event) => {
            onChangeMaterial(Number(event.target.value));
            onChangeVariante(0); // el catalogo de variantes cambia con el material
          }}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        >
          {MATERIALES.map((nombre, index) => (
            <option key={nombre} value={index}>
              {nombre}
            </option>
          ))}
        </select>
      </label>

      {variantes.length > 0 ? (
        <label className="flex flex-col gap-1">
          Variante
          <select
            value={varianteId}
            onChange={(event) => onChangeVariante(Number(event.target.value))}
            className="rounded border border-neutral-300 bg-white px-3 py-2"
          >
            {variantes.map((nombre, index) => (
              <option key={nombre} value={index}>
                {nombre}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="text-xs text-neutral-500">Este material todavía no tiene variantes en el catálogo.</p>
      )}

      {nombreMaterial === "Plástico" ? (
        <>
          <details className="text-xs">
            <summary className="cursor-pointer text-forest hover:underline w-fit">
              Qué significa cada variante
            </summary>
            <ul className="mt-2 flex flex-col gap-1 text-neutral-500">
              {variantes.map((nombre) =>
                PLASTICO_EJEMPLOS[nombre] ? (
                  <li key={nombre}>
                    <strong className="text-foreground">{nombre}</strong> &mdash; {PLASTICO_EJEMPLOS[nombre]}
                  </li>
                ) : null,
              )}
            </ul>
          </details>
          <Link href="/guia-plasticos" className="text-forest hover:underline w-fit">
            ¿No estás seguro cuál es? Ver guía completa con pruebas para diferenciarlos →
          </Link>
        </>
      ) : null}
    </div>
  );
}
