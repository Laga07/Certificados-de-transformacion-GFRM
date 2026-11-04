"use client";

import { useState } from "react";
import { useWriteRegistroEntidadesGrantRole } from "@/lib/generated";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;

export function OtorgarRolForm({
  registroAddress,
  roleConstant,
}: {
  registroAddress: `0x${string}`;
  roleConstant?: `0x${string}`;
}) {
  const [wallet, setWallet] = useState("");

  const { writeContract, data: hash, isPending, error } = useWriteRegistroEntidadesGrantRole();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  const walletValida = WALLET_REGEX.test(wallet.trim());
  const puedeEnviar = walletValida && Boolean(roleConstant);

  function handleSubmit() {
    if (!puedeEnviar || !roleConstant) return;
    writeContract({
      address: registroAddress,
      args: [roleConstant, wallet.trim() as `0x${string}`],
      ...GAS_FEE_OVERRIDES,
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <p className="text-xs text-neutral-500">
        Le da permiso a otra wallet para verificar centros recolectores (VERIFIER_ROLE), sin
        darle control total de administrador sobre el contrato.
      </p>

      <label className="flex flex-col gap-1 text-sm">
        Wallet a autorizar
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

      <TxButton
        onClick={handleSubmit}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError}
        disabled={!puedeEnviar}
      >
        Otorgar rol de verificador
      </TxButton>
    </div>
  );
}
