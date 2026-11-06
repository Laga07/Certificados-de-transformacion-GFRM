"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useConnect, useDisconnect } from "wagmi";

const hasWalletConnectProjectId = Boolean(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID);

export function ConnectWalletButton() {
  // Con un projectId real de WalletConnect, el wagmi Config se construyo con
  // RainbowKit.getDefaultConfig y su modal ConnectButton funciona sin problemas.
  if (hasWalletConnectProjectId) {
    return <ConnectButton showBalance={false} chainStatus="icon" />;
  }

  // Sin projectId, el Config se arma a mano (ver lib/wagmi.ts) con conectores de wagmi
  // "planos" (metaMask/injected): el modal de RainbowKit no siempre los reconoce bien,
  // asi que usamos los hooks de wagmi directamente para un boton simple y confiable.
  return <ConnectorFallbackButton />;
}

function ConnectorFallbackButton() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm">
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

  // Deduplicar: metaMask() e injected() suelen detectar el mismo window.ethereum cuando
  // solo hay una extension instalada; mostramos un boton por conector unico.
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
