"use client";

import { useAccount, useSwitchChain } from "wagmi";

export function ChainGuard() {
  const { isConnected, chainId, chain } = useAccount();
  const { chains, switchChain, isPending } = useSwitchChain();

  if (!isConnected) return null;

  const redEsSoportada = chains.some((c) => c.id === chainId);
  if (redEsSoportada) return null;

  const redPreferida = chains[0];

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-900 flex flex-wrap items-center gap-3">
      <span>
        Tu wallet está conectada a {chain?.name ?? `chain ${chainId}`}, que no es una red
        soportada por esta DApp.
      </span>
      <button
        type="button"
        onClick={() => switchChain({ chainId: redPreferida.id })}
        disabled={isPending}
        className="rounded bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-500 disabled:opacity-50"
      >
        {isPending ? "Cambiando..." : `Cambiar a ${redPreferida.name}`}
      </button>
    </div>
  );
}
