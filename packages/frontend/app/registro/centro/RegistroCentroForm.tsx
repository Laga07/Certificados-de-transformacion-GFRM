"use client";

import { useState } from "react";
import { useWriteRegistroEntidadesRegistrarCentroRecolector } from "@/lib/generated";
import { hashValue } from "@/lib/hash";
import { PROVINCIAS, TIPOS_VIVIENDA } from "@/lib/catalogos";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

export function RegistroCentroForm({ registroAddress }: { registroAddress: `0x${string}` }) {
  const [nombre, setNombre] = useState("");
  const [cedulaJuridica, setCedulaJuridica] = useState("");
  const [provinciaId, setProvinciaId] = useState(0);
  const [cantonId, setCantonId] = useState(1);
  const [loteM2, setLoteM2] = useState(0);
  const [tipoVivienda, setTipoVivienda] = useState(2);
  const [esPublico, setEsPublico] = useState(false);

  const { writeContract, data: hash, isPending, error } =
    useWriteRegistroEntidadesRegistrarCentroRecolector();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  function handleSubmit() {
    if (!nombre.trim() || !cedulaJuridica.trim()) return;

    writeContract({
      address: registroAddress,
      args: [
        hashValue(nombre),
        hashValue(cedulaJuridica),
        provinciaId,
        cantonId,
        loteM2,
        tipoVivienda,
        esPublico,
      ],
      ...GAS_FEE_OVERRIDES,
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Nombre del centro
        <input
          type="text"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Cédula jurídica (solo se guarda su hash)
        <input
          type="text"
          value={cedulaJuridica}
          onChange={(event) => setCedulaJuridica(event.target.value)}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Provincia
        <select
          value={provinciaId}
          onChange={(event) => setProvinciaId(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        >
          {PROVINCIAS.map((p, index) => (
            <option key={p} value={index}>
              {p}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Cantón
        <input
          type="number"
          min={0}
          value={cantonId}
          onChange={(event) => setCantonId(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Lote (m²)
        <input
          type="number"
          min={0}
          value={loteM2}
          onChange={(event) => setLoteM2(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Tipo de local
        <select
          value={tipoVivienda}
          onChange={(event) => setTipoVivienda(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        >
          {TIPOS_VIVIENDA.map((t, index) => (
            <option key={t} value={index}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={esPublico}
          onChange={(event) => setEsPublico(event.target.checked)}
        />
        Es un centro operado por una entidad pública
      </label>
      <p className="text-xs text-neutral-500 -mt-3">
        Es solo una etiqueta informativa para las estadísticas (ej. un centro de acopio que
        opera una municipalidad). No es lo mismo que el rol de Municipalidad: ese rol lo asigna
        un administrador aparte, y sirve para gestionar lotes de recolección, no para operar un
        centro de acopio.
      </p>

      <p className="text-xs text-neutral-500">
        Después de registrarte, un administrador debe verificar tu centro antes de poder operar.
      </p>

      <TxButton
        onClick={handleSubmit}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError}
        disabled={!nombre.trim() || !cedulaJuridica.trim()}
      >
        Registrar centro recolector
      </TxButton>
    </div>
  );
}
