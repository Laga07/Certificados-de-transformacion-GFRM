"use client";

import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import { useReadMockUsdtBalanceOf, mockUsdtAbi } from "@/lib/generated";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { useEscribir } from "@/lib/useEscribir";

export function FaucetForm({ usdtAddress }: { usdtAddress: `0x${string}` }) {
  const { address, isConnected } = useAccount();
  const [monto, setMonto] = useState(1000);

  const pol = useBalance({ address, query: { enabled: Boolean(address) } });
  const usdt = useReadMockUsdtBalanceOf({
    address: usdtAddress,
    args: address ? ([address] as const) : undefined,
    query: { enabled: Boolean(address), staleTime: 0 },
  });

  const { enviar, data: hash, isPending, error } = useEscribir(mockUsdtAbi, "faucet");
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  useEffect(() => {
    if (isSuccess) usdt.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  if (!isConnected) return <p className="text-sm text-neutral-500">Conectá tu wallet para pedir USDT de prueba.</p>;

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="label-mono">POL en tu wallet</dt>
          <dd className="tabular-nums">{pol.data ? `${Number(formatUnits(pol.data.value, 18)).toFixed(4)} POL` : "…"}</dd>
        </div>
        <div>
          <dt className="label-mono">USDT de prueba</dt>
          <dd className="tabular-nums">{usdt.data !== undefined ? `${formatUnits(usdt.data, 6)} USDT` : "…"}</dd>
        </div>
      </dl>

      <label className="flex flex-col gap-1 text-sm">
        Cantidad (máximo 10 000 por llamada)
        <input
          type="number"
          min={1}
          max={10_000}
          value={monto}
          onChange={(e) => setMonto(Number(e.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <TxButton
        onClick={() =>
          enviar(usdtAddress, [parseUnits(String(Math.min(monto, 10_000)), 6)])
        }
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError}
        disabled={monto <= 0}
      >
        Pedir {Math.min(monto, 10_000).toLocaleString("es-CR")} USDT de prueba
      </TxButton>

      {pol.data && pol.data.value === BigInt(0) ? (
        <p className="text-xs text-amber-700">Sin POL no vas a poder pagar el gas de esta transacción. Pedí POL primero (paso 1).</p>
      ) : null}
    </div>
  );
}
