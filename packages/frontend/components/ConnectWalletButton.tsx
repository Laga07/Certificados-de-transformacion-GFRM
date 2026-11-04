"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatUnits } from "viem";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useReadPlasticoTokenBalanceOf } from "@/lib/generated";

const hasWalletConnectProjectId = Boolean(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID);

export function ConnectWalletButton({
  plasticoTokenAddress,
}: {
  plasticoTokenAddress?: `0x${string}`;
}) {
  // Con un projectId real de WalletConnect, el wagmi Config se construyo con
  // RainbowKit.getDefaultConfig y su modal ConnectButton funciona sin problemas.
  if (hasWalletConnectProjectId) {
    return (
      <div className="flex items-center gap-2">
        <TokenBalanceBadge plasticoTokenAddress={plasticoTokenAddress} />
        <ConnectButton showBalance={false} chainStatus="icon" />
      </div>
    );
  }

  // Sin projectId, el Config se arma a mano (ver lib/wagmi.ts) con conectores de wagmi
  // "planos" (metaMask/injected): el modal de RainbowKit no siempre los reconoce bien,
  // asi que usamos los hooks de wagmi directamente para un boton simple y confiable.
  return <ConnectorFallbackButton plasticoTokenAddress={plasticoTokenAddress} />;
}

// Balance de PLST leido directo del contrato -- para que nadie dependa de importar el token
// a mano en MetaMask (que en la practica genera bastante friccion) solo para ver cuanto
// gano por reciclar.
function TokenBalanceBadge({ plasticoTokenAddress }: { plasticoTokenAddress?: `0x${string}` }) {
  const { address, isConnected } = useAccount();

  const { data: balance, isLoading } = useReadPlasticoTokenBalanceOf({
    address: plasticoTokenAddress,
    args: address ? ([address] as const) : undefined,
    query: {
      enabled: Boolean(plasticoTokenAddress && address),
      staleTime: 0,
      refetchOnMount: "always",
    },
  });

  if (!isConnected || !plasticoTokenAddress) return null;

  return (
    <span className="tag-mono" title="Balance de PLST de tu wallet conectada">
      {isLoading || balance === undefined
        ? "PLST …"
        : `${Number(formatUnits(balance, 18)).toLocaleString("es-CR")} PLST`}
    </span>
  );
}

function ConnectorFallbackButton({
  plasticoTokenAddress,
}: {
  plasticoTokenAddress?: `0x${string}`;
}) {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <TokenBalanceBadge plasticoTokenAddress={plasticoTokenAddress} />
        <span className="font-mono text-xs">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        {chain ? <span className="text-neutral-500 text-xs">({chain.name})</span> : null}
        <button
          type="button"
          onClick={() => disconnect()}
          className="rounded bg-neutral-100 px-2 py-1 text-xs text-foreground hover:bg-neutral-200"
        >
          Desconectar
        </button>
      </div>
    );
  }

  // Deduplicar: metaMask() e injected() suelen detectar el mismo window.ethereum
  // cuando solo hay una extension instalada; mostramos un boton por conector unico.
  const conectoresUnicos = connectors.filter(
    (connector, index) => connectors.findIndex((c) => c.name === connector.name) === index,
  );

  return (
    <div className="flex items-center gap-2">
      {conectoresUnicos.map((connector) => (
        <button
          key={connector.uid}
          type="button"
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="rounded bg-forest px-3 py-1.5 text-sm font-medium text-white hover:bg-forest-light disabled:opacity-50"
        >
          {isPending ? "Conectando..." : `Conectar ${connector.name}`}
        </button>
      ))}
      {error ? <span className="text-xs text-red-600 max-w-xs">{error.message}</span> : null}
    </div>
  );
}
