"use client";

import { useState } from "react";
import { useWriteRegistroEntidadesRegistrarMunicipalidad } from "@/lib/generated";
import { hashValue } from "@/lib/hash";
import { PROVINCIAS } from "@/lib/catalogos";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;

export function RegistrarMunicipalidadForm({ registroAddress }: { registroAddress: `0x${string}` }) {
  const [wallet, setWallet] = useState("");
  const [nombre, setNombre] = useState("");
  const [provinciaId, setProvinciaId] = useState(0);
  const [cantonId, setCantonId] = useState(1);

  const { writeContract, data: hash, isPending, error } =
    useWriteRegistroEntidadesRegistrarMunicipalidad();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  const walletValida = WALLET_REGEX.test(wallet.trim());
  const puedeEnviar = walletValida && nombre.trim().length > 0;

  function handleSubmit() {
    if (!puedeEnviar) return;
    writeContract({
      address: registroAddress,
      args: [wallet.trim() as `0x${string}`, hashValue(nombre), provinciaId, cantonId],
      ...GAS_FEE_OVERRIDES,
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Wallet de la municipalidad
        <input
          type="text"
          value={wallet}
          onChange={(event) => setWallet(event.target.value)}
          placeholder="0x..."
          className="rounded border border-neutral-300 bg-white px-3 py-2 font-mono text-xs"
        />
        {wallet.trim() && !walletValida ? (
          <span className="text-xs text-red-600">Dirección inválida</span>
        ) : null}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Nombre de la municipalidad
        <input
          type="text"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          placeholder="Municipalidad de..."
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
        Cantón (ID numérico según la provincia)
        <input
          type="number"
          min={0}
          value={cantonId}
          onChange={(event) => setCantonId(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <TxButton
        onClick={handleSubmit}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError}
        disabled={!puedeEnviar}
      >
        Registrar municipalidad
      </TxButton>
    </div>
  );
}
