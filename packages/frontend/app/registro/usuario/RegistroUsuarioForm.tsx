"use client";

import { useState } from "react";
import { useWriteRegistroEntidadesRegistrarUsuario } from "@/lib/generated";
import { hashValue } from "@/lib/hash";
import { PROVINCIAS, TIPOS_VIVIENDA } from "@/lib/catalogos";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

export function RegistroUsuarioForm({ registroAddress }: { registroAddress: `0x${string}` }) {
  const [cedula, setCedula] = useState("");
  const [provinciaId, setProvinciaId] = useState(0);
  const [cantonId, setCantonId] = useState(1);
  const [loteM2, setLoteM2] = useState(0);
  const [tipoVivienda, setTipoVivienda] = useState(0);

  const { writeContract, data: hash, isPending, error } = useWriteRegistroEntidadesRegistrarUsuario();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  function handleSubmit() {
    if (!cedula.trim()) return;
    const identidadHash = hashValue(cedula);

    writeContract({
      address: registroAddress,
      args: [identidadHash, provinciaId, cantonId, loteM2, tipoVivienda],
      ...GAS_FEE_OVERRIDES,
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Cédula (solo se guarda su hash, nunca el valor real)
        <input
          type="text"
          value={cedula}
          onChange={(event) => setCedula(event.target.value)}
          placeholder="1-2345-6789"
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
          {PROVINCIAS.map((nombre, index) => (
            <option key={nombre} value={index}>
              {nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Cantón (ID numérico según tu provincia)
        <input
          type="number"
          min={0}
          value={cantonId}
          onChange={(event) => setCantonId(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Lote (m², opcional)
        <input
          type="number"
          min={0}
          value={loteM2}
          onChange={(event) => setLoteM2(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Lugar de separación
        <select
          value={tipoVivienda}
          onChange={(event) => setTipoVivienda(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        >
          {TIPOS_VIVIENDA.map((nombre, index) => (
            <option key={nombre} value={index}>
              {nombre}
            </option>
          ))}
        </select>
      </label>

      <TxButton
        onClick={handleSubmit}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError}
        disabled={!cedula.trim()}
      >
        Registrarme como usuario
      </TxButton>
    </div>
  );
}
