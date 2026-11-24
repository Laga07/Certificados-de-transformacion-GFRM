"use client";

import { useState } from "react";
import { tokenCustodiaAbi } from "@/lib/generated";
import { MaterialVarianteField } from "@/components/MaterialVarianteField";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { useEscribir } from "@/lib/useEscribir";

export function UnirLotesForm({ custodiaAddress }: { custodiaAddress: `0x${string}` }) {
  const [loteIdsTexto, setLoteIdsTexto] = useState("");
  // El material lo determina el contrato (todos los lotes deben coincidir); la variante
  // resultante la declara quien une, por si mezcla variantes distintas.
  const [material, setMaterial] = useState(0);
  const [varianteId, setVarianteId] = useState(0);

  const { enviar, data: hash, isPending, error } = useEscribir(tokenCustodiaAbi, "unirLotes");
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  const loteIds = loteIdsTexto.split(",").map((s) => s.trim()).filter(Boolean);
  const valido = loteIds.length >= 2 && loteIds.every((id) => /^\d+$/.test(id));

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Ids de los lotes a unir (separados por coma, mínimo 2, todos tuyos y del mismo material)
        <input
          type="text"
          value={loteIdsTexto}
          onChange={(e) => setLoteIdsTexto(e.target.value)}
          placeholder="4, 7, 9"
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <MaterialVarianteField
        material={material}
        varianteId={varianteId}
        onChangeMaterial={setMaterial}
        onChangeVariante={setVarianteId}
      />
      <p className="text-xs text-foreground/60 -mt-2">
        El material es solo para elegir la variante del lote resultante; el contrato exige que
        todos los lotes sean del mismo material.
      </p>

      <TxButton
        onClick={() =>
          enviar(custodiaAddress, [loteIds.map((id) => BigInt(id)), varianteId])
        }
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError}
        disabled={!valido}
      >
        Unir lotes
      </TxButton>
    </div>
  );
}
