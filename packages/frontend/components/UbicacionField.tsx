"use client";

import { PROVINCIAS } from "@/lib/catalogos";
import { CANTONES_POR_PROVINCIA } from "@/lib/cantones";

// Selector de provincia + canton con nombres reales (antes el canton era un "ID numerico").
// Al cambiar de provincia el canton vuelve al 1 para que nunca quede un numero fuera de rango.
export function UbicacionField({
  provinciaId,
  cantonId,
  onChangeProvincia,
  onChangeCanton,
}: {
  provinciaId: number;
  cantonId: number;
  onChangeProvincia: (provinciaId: number) => void;
  onChangeCanton: (cantonId: number) => void;
}) {
  const cantones = CANTONES_POR_PROVINCIA[provinciaId] ?? [];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm">
        Provincia
        <select
          value={provinciaId}
          onChange={(event) => {
            onChangeProvincia(Number(event.target.value));
            onChangeCanton(1);
          }}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        >
          {PROVINCIAS.map((nombre, index) => (
            <option key={nombre} value={index}>
              {nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Cantón
        <select
          value={cantonId}
          onChange={(event) => onChangeCanton(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        >
          {cantones.map((nombre, index) => (
            <option key={nombre} value={index + 1}>
              {index + 1}. {nombre}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
