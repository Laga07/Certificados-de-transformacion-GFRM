"use client";

import { useState } from "react";
import { formatUnits, isAddress } from "viem";
import { useAccount } from "wagmi";
import { useReadMercadoCertificadosSaldoPendiente, useWriteMercadoCertificadosRetirarPago } from "@/lib/generated";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

export function PagosForm({ mercadoAddress }: { mercadoAddress: `0x${string}` }) {
  const { address: conectada } = useAccount();
  const [destinatario, setDestinatario] = useState("");

  const direccionConsultada = (isAddress(destinatario) ? destinatario : conectada) as
    | `0x${string}`
    | undefined;

  const { data: saldo, isLoading } = useReadMercadoCertificadosSaldoPendiente({
    address: mercadoAddress,
    args: direccionConsultada ? ([direccionConsultada] as const) : undefined,
    query: { enabled: Boolean(direccionConsultada), staleTime: 0, refetchOnMount: "always" },
  });

  const { writeContract, data: hash, isPending, error } = useWriteMercadoCertificadosRetirarPago();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  function handleRetirar() {
    if (!direccionConsultada) return;
    writeContract({
      address: mercadoAddress,
      args: [direccionConsultada],
      ...GAS_FEE_OVERRIDES,
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Dirección a consultar (vacío = tu wallet conectada)
        <input
          type="text"
          value={destinatario}
          onChange={(event) => setDestinatario(event.target.value)}
          placeholder={conectada ?? "0x..."}
          className="rounded border border-neutral-300 bg-white px-3 py-2 font-mono text-xs"
        />
      </label>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Consultando saldo...</p>
      ) : saldo !== undefined ? (
        <p className="text-lg">
          Saldo pendiente: <strong>{formatUnits(saldo, 6)} USDT</strong>
        </p>
      ) : null}

      <TxButton
        onClick={handleRetirar}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError}
        disabled={!direccionConsultada || !saldo || saldo === BigInt(0)}
      >
        Retirar
      </TxButton>
    </div>
  );
}
