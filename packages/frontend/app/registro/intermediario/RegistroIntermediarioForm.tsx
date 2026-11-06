"use client";

import { useState } from "react";
import { useWriteRegistroEntidadesRegistrarIntermediario } from "@/lib/generated";
import { hashValue } from "@/lib/hash";
import { PROVINCIAS, SUBTIPOS_INTERMEDIARIO } from "@/lib/catalogos";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

export function RegistroIntermediarioForm({ registroAddress }: { registroAddress: `0x${string}` }) {
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [provinciaId, setProvinciaId] = useState(0);
  const [cantonId, setCantonId] = useState(1);
  const [subtipo, setSubtipo] = useState(0);

  const { writeContract, data: hash, isPending, error } =
    useWriteRegistroEntidadesRegistrarIntermediario();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  function handleSubmit() {
    if (!nombre.trim() || !cedula.trim()) return;

    writeContract({
      address: registroAddress,
      args: [hashValue(nombre), hashValue(cedula), provinciaId, cantonId, subtipo],
      ...GAS_FEE_OVERRIDES,
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Nombre (solo se guarda su hash)
        <input
          type="text"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          placeholder="Centro de Acopio San Rafael"
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Cédula jurídica (solo se guarda su hash)
        <input
          type="text"
          value={cedula}
          onChange={(event) => setCedula(event.target.value)}
          placeholder="3-101-123456"
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
          {PROVINCIAS.map((nombreP, index) => (
            <option key={nombreP} value={index}>
              {nombreP}
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
        Subtipo
        <select
          value={subtipo}
          onChange={(event) => setSubtipo(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        >
          {SUBTIPOS_INTERMEDIARIO.map((nombreS, index) => (
            <option key={nombreS} value={index}>
              {nombreS}
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
        disabled={!nombre.trim() || !cedula.trim()}
      >
        Registrarme como intermediario
      </TxButton>
    </div>
  );
}
