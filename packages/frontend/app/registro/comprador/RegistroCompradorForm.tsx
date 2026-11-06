"use client";

import { useState } from "react";
import { useWriteRegistroEntidadesRegistrarComprador } from "@/lib/generated";
import { hashValue } from "@/lib/hash";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

export function RegistroCompradorForm({ registroAddress }: { registroAddress: `0x${string}` }) {
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [empresaObligadaLey9786, setEmpresaObligadaLey9786] = useState(false);

  const { writeContract, data: hash, isPending, error } =
    useWriteRegistroEntidadesRegistrarComprador();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  function handleSubmit() {
    if (!nombre.trim() || !cedula.trim()) return;

    writeContract({
      address: registroAddress,
      args: [hashValue(nombre), hashValue(cedula), empresaObligadaLey9786],
      ...GAS_FEE_OVERRIDES,
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Nombre de la empresa (solo se guarda su hash)
        <input
          type="text"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          placeholder="Embotelladora Tropical S.A."
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Cédula jurídica (solo se guarda su hash)
        <input
          type="text"
          value={cedula}
          onChange={(event) => setCedula(event.target.value)}
          placeholder="3-101-789012"
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={empresaObligadaLey9786}
          onChange={(event) => setEmpresaObligadaLey9786(event.target.checked)}
        />
        Somos una empresa obligada por la Ley 9786 (importamos/producimos/comercializamos
        plástico de un solo uso)
      </label>

      <TxButton
        onClick={handleSubmit}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError}
        disabled={!nombre.trim() || !cedula.trim()}
      >
        Registrarme como comprador
      </TxButton>
    </div>
  );
}
