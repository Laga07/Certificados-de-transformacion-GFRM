"use client";

import { useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import {
  useReadMercadoCertificadosEmisiones,
  useReadMockUsdtAllowance,
  useWriteMercadoCertificadosComprarCertificado,
  useWriteMockUsdtApprove,
} from "@/lib/generated";
import { MATERIALES } from "@/lib/catalogos";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

const CERO = BigInt(0);

export function ComprarCertificadoForm({
  mercadoAddress,
  usdtAddress,
}: {
  mercadoAddress: `0x${string}`;
  usdtAddress: `0x${string}`;
}) {
  const { address } = useAccount();
  const [emisionIdTexto, setEmisionIdTexto] = useState("");
  const [cantidadKg, setCantidadKg] = useState(0);

  const emisionIdValido = /^\d+$/.test(emisionIdTexto);
  const emisionId = emisionIdValido ? BigInt(emisionIdTexto) : undefined;

  const { data: emisionTuple, isLoading: cargandoEmision } = useReadMercadoCertificadosEmisiones({
    address: mercadoAddress,
    args: emisionId !== undefined ? ([emisionId] as const) : undefined,
    query: { enabled: emisionId !== undefined },
  });

  // El getter autogenerado por un mapping de struct devuelve una tupla posicional, no un
  // objeto con nombres -- aunque el ABI si nombra cada campo (ver seccion 2.2 del documento
  // de arquitectura), el tipo que wagmi infiere para TypeScript es el tuple crudo.
  const [material, , , kgDisponiblesPrimario, , precioUSDTporKg, , existe] = emisionTuple ?? [];

  const valorTotal = cantidadKg > 0 && precioUSDTporKg ? BigInt(cantidadKg) * precioUSDTporKg : CERO;

  const { data: allowance } = useReadMockUsdtAllowance({
    address: usdtAddress,
    args: address ? ([address, mercadoAddress] as const) : undefined,
    query: { enabled: Boolean(address), staleTime: 0, refetchOnMount: "always" },
  });

  const necesitaAprobar = valorTotal > CERO && (allowance ?? CERO) < valorTotal;

  const approveWrite = useWriteMockUsdtApprove();
  const approveReceipt = useTxReceipt(approveWrite.data);

  const compraWrite = useWriteMercadoCertificadosComprarCertificado();
  const compraReceipt = useTxReceipt(compraWrite.data);

  function handleApprove() {
    if (valorTotal <= CERO) return;
    approveWrite.writeContract({
      address: usdtAddress,
      args: [mercadoAddress, valorTotal],
      ...GAS_FEE_OVERRIDES,
    });
  }

  function handleComprar() {
    if (emisionId === undefined || cantidadKg <= 0) return;
    compraWrite.writeContract({
      address: mercadoAddress,
      args: [emisionId, BigInt(cantidadKg)],
      ...GAS_FEE_OVERRIDES,
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Id de la emisión
        <input
          type="text"
          value={emisionIdTexto}
          onChange={(event) => setEmisionIdTexto(event.target.value)}
          placeholder="1"
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      {cargandoEmision ? <p className="text-xs text-neutral-500">Consultando emisión...</p> : null}

      {emisionTuple && existe ? (
        <div className="rounded border border-neutral-200 bg-surface-warm p-3 text-xs flex flex-col gap-1">
          <span>
            Material: <strong>{MATERIALES[material!]}</strong>
          </span>
          <span>
            Disponible: <strong>{kgDisponiblesPrimario!.toString()} kg</strong>
          </span>
          <span>
            Precio: <strong>{formatUnits(precioUSDTporKg!, 6)} USDT/kg</strong>
          </span>
        </div>
      ) : emisionTuple && !existe ? (
        <p className="text-xs text-red-600">Esa emisión no existe.</p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        Cantidad a comprar (kg)
        <input
          type="number"
          min={1}
          value={cantidadKg}
          onChange={(event) => setCantidadKg(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      {valorTotal > CERO ? (
        <p className="text-sm">
          Total a pagar: <strong>{formatUnits(valorTotal, 6)} USDT</strong>
        </p>
      ) : null}

      {necesitaAprobar ? (
        <TxButton
          onClick={handleApprove}
          isPending={approveWrite.isPending}
          isConfirming={approveReceipt.isConfirming}
          isSuccess={approveReceipt.isSuccess}
          error={approveWrite.error ?? approveReceipt.revertedError}
        >
          1. Aprobar {formatUnits(valorTotal, 6)} USDT
        </TxButton>
      ) : (
        <TxButton
          onClick={handleComprar}
          isPending={compraWrite.isPending}
          isConfirming={compraReceipt.isConfirming}
          isSuccess={compraReceipt.isSuccess}
          error={compraWrite.error ?? compraReceipt.revertedError}
          disabled={emisionId === undefined || cantidadKg <= 0 || !existe}
        >
          {necesitaAprobar ? "Aprobar primero" : "2. Comprar certificado"}
        </TxButton>
      )}

      <p className="text-xs text-neutral-500">
        ¿No tenés USDT de prueba? El contrato MockUSDT tiene un faucet público — pedile a quien
        maneja el proyecto la dirección o usá la consola de Hardhat.
      </p>
    </div>
  );
}
