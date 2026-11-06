"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { useWriteTokenCustodiaRegistrarEntrega } from "@/lib/generated";
import { MaterialVarianteField } from "@/components/MaterialVarianteField";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

const MODALIDADES = ["Sin pago", "Con pago", "Ruta municipal"] as const;

export function RegistrarEntregaForm({ custodiaAddress }: { custodiaAddress: `0x${string}` }) {
  const [separador, setSeparador] = useState("");
  const [material, setMaterial] = useState(0);
  const [varianteId, setVarianteId] = useState(0);
  const [pesoGramos, setPesoGramos] = useState(1000);
  const [loteDestino, setLoteDestino] = useState("0"); // "0" = lote nuevo
  const [modalidad, setModalidad] = useState(0);
  const [precioUSDTporKg, setPrecioUSDTporKg] = useState(0);

  const { writeContract, data: hash, isPending, error } = useWriteTokenCustodiaRegistrarEntrega();
  const { isConfirming, isSuccess, revertedError, receipt } = useTxReceipt(hash);

  const separadorValido = isAddress(separador);

  function handleSubmit() {
    if (!separadorValido || pesoGramos <= 0) return;

    writeContract({
      address: custodiaAddress,
      args: [
        separador as `0x${string}`,
        material,
        varianteId,
        BigInt(pesoGramos),
        BigInt(loteDestino || "0"),
        modalidad,
        // precioUSDTporKg en unidades minimas de USDT (6 decimales) por kg
        BigInt(Math.round(precioUSDTporKg * 1_000_000)),
      ],
      ...GAS_FEE_OVERRIDES,
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Dirección del separador
        <input
          type="text"
          value={separador}
          onChange={(event) => setSeparador(event.target.value)}
          placeholder="0x..."
          className="rounded border border-neutral-300 bg-white px-3 py-2 font-mono text-xs"
        />
        {separador && !separadorValido ? (
          <span className="text-red-600 text-xs">Dirección inválida</span>
        ) : null}
      </label>

      <MaterialVarianteField
        material={material}
        varianteId={varianteId}
        onChangeMaterial={setMaterial}
        onChangeVariante={setVarianteId}
      />

      <label className="flex flex-col gap-1 text-sm">
        Peso aceptado (gramos)
        <input
          type="number"
          min={1}
          value={pesoGramos}
          onChange={(event) => setPesoGramos(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Lote destino (0 = crear un lote nuevo)
        <input
          type="text"
          value={loteDestino}
          onChange={(event) => setLoteDestino(event.target.value)}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Modalidad
        <select
          value={modalidad}
          onChange={(event) => setModalidad(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        >
          {MODALIDADES.map((nombre, index) => (
            <option key={nombre} value={index}>
              {nombre}
            </option>
          ))}
        </select>
      </label>

      {modalidad === 1 ? (
        <label className="flex flex-col gap-1 text-sm">
          Precio pactado (USDT por kg)
          <input
            type="number"
            min={0}
            step="0.01"
            value={precioUSDTporKg}
            onChange={(event) => setPrecioUSDTporKg(Number(event.target.value))}
            className="rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
      ) : null}

      <TxButton
        onClick={handleSubmit}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError}
        disabled={!separadorValido || pesoGramos <= 0}
      >
        Registrar entrega
      </TxButton>

      {isSuccess && receipt ? (
        <p className="text-xs text-neutral-500">
          Confirmada en el bloque {receipt.blockNumber.toString()}.
        </p>
      ) : null}
    </div>
  );
}
