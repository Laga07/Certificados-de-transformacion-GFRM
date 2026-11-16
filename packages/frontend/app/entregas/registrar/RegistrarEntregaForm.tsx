"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { useWriteTokenCustodiaRegistrarEntrega } from "@/lib/generated";
import { apiFetch, ApiError } from "@/lib/api";
import { PROVINCIAS, TIPOS_SEPARADOR } from "@/lib/catalogos";
import { nombreCanton } from "@/lib/cantones";
import { provinciaIdDesdeClave } from "@/lib/identidad";
import { MaterialVarianteField } from "@/components/MaterialVarianteField";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

const MODALIDADES = ["Sin pago", "Con pago", "Ruta municipal"] as const;

interface SeparadorEncontrado {
  wallet: string;
  provincia: string;
  cantonId: number;
  tipoSeparador: number;
  activo: boolean;
}

export function RegistrarEntregaForm({
  custodiaAddress,
  loteInicial = "0",
}: {
  custodiaAddress: `0x${string}`;
  loteInicial?: string;
}) {
  // El separador se busca por cedula (lo normal en el mostrador) o se pega la direccion.
  const [modo, setModo] = useState<"cedula" | "direccion">("cedula");
  const [cedula, setCedula] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [encontrado, setEncontrado] = useState<SeparadorEncontrado | null>(null);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [separador, setSeparador] = useState("");
  const [material, setMaterial] = useState(0);
  const [varianteId, setVarianteId] = useState(0);
  const [pesoGramos, setPesoGramos] = useState(1000);
  const [loteDestino, setLoteDestino] = useState(loteInicial); // "0" = lote nuevo
  const [modalidad, setModalidad] = useState(0);
  const [precioUSDTporKg, setPrecioUSDTporKg] = useState(0);

  const { writeContract, data: hash, isPending, error } = useWriteTokenCustodiaRegistrarEntrega();
  const { isConfirming, isSuccess, revertedError, receipt } = useTxReceipt(hash);

  const separadorValido = isAddress(separador);

  async function buscar() {
    if (!cedula.trim()) return;
    setBuscando(true);
    setErrorBusqueda(null);
    setEncontrado(null);
    try {
      const s = await apiFetch<SeparadorEncontrado>(`/api/separadores/buscar?cedula=${encodeURIComponent(cedula.trim())}`);
      setEncontrado(s);
      setSeparador(s.wallet);
    } catch (e) {
      setErrorBusqueda(e instanceof ApiError ? e.message : "No se pudo buscar.");
      setSeparador("");
    } finally {
      setBuscando(false);
    }
  }

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
      <div className="flex flex-col gap-2 text-sm">
        <span>Separador</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => setModo("cedula")} className={`label-mono px-3 py-1.5 border ${modo === "cedula" ? "border-forest text-forest bg-surface-warm" : "border-neutral-300"}`}>
            Por cédula
          </button>
          <button type="button" onClick={() => setModo("direccion")} className={`label-mono px-3 py-1.5 border ${modo === "direccion" ? "border-forest text-forest bg-surface-warm" : "border-neutral-300"}`}>
            Por dirección
          </button>
        </div>

        {modo === "cedula" ? (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") buscar();
                }}
                placeholder="1-2345-6789"
                className="flex-1 rounded border border-neutral-300 bg-white px-3 py-2"
              />
              <button type="button" onClick={buscar} disabled={buscando || !cedula.trim()} className="rounded border border-forest px-3 py-2 text-forest hover:bg-surface-warm disabled:opacity-50">
                {buscando ? "Buscando..." : "Buscar"}
              </button>
            </div>
            {encontrado ? (
              <p className={`text-xs ${encontrado.activo ? "text-forest" : "text-red-600"}`}>
                Encontrado: <span className="font-mono">{encontrado.wallet.slice(0, 6)}…{encontrado.wallet.slice(-4)}</span> ·{" "}
                {TIPOS_SEPARADOR[encontrado.tipoSeparador] ?? "separador"} · {PROVINCIAS[provinciaIdDesdeClave(encontrado.provincia)]},{" "}
                {nombreCanton(provinciaIdDesdeClave(encontrado.provincia), encontrado.cantonId)}
                {encontrado.activo ? "" : " · DESACTIVADO: no puede entregar"}
              </p>
            ) : null}
            {errorBusqueda ? <p className="text-xs text-red-600">{errorBusqueda}</p> : null}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <input
              type="text"
              value={separador}
              onChange={(event) => setSeparador(event.target.value)}
              placeholder="0x..."
              className="rounded border border-neutral-300 bg-white px-3 py-2 font-mono text-xs"
            />
            {separador && !separadorValido ? <span className="text-red-600 text-xs">Dirección inválida</span> : null}
          </div>
        )}
      </div>

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
        Lote destino (0 = crear un lote nuevo; o un lote tuyo del mismo material y variante)
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
        disabled={!separadorValido || pesoGramos <= 0 || (encontrado !== null && !encontrado.activo && modo === "cedula")}
      >
        Registrar entrega
      </TxButton>

      {isSuccess && receipt ? (
        <p className="text-xs text-neutral-500">
          Confirmada en el bloque {receipt.blockNumber.toString()}. Vela en{" "}
          <a href="/entregas/lotes" className="text-forest underline">Mis lotes</a>.
        </p>
      ) : null}
    </div>
  );
}
