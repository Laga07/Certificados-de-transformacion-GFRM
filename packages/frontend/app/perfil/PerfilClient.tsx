"use client";

import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import {
  useReadPlasticoTokenBalanceOf,
  useReadRegistroEntidadesEsCentroVerificado,
  useReadRegistroEntidadesEsMunicipalidad,
  useReadRegistroEntidadesEsUsuario,
} from "@/lib/generated";
import { WalletResumen } from "@/components/WalletResumen";

export function PerfilClient({
  registroAddress,
  plasticoTokenAddress,
}: {
  registroAddress: `0x${string}`;
  plasticoTokenAddress: `0x${string}`;
}) {
  const { address, isConnected } = useAccount();

  const { data: balance, isLoading: cargandoBalance, refetch: refetchBalance } = useReadPlasticoTokenBalanceOf({
    address: plasticoTokenAddress,
    args: address ? ([address] as const) : undefined,
    query: { enabled: Boolean(address), staleTime: 0, refetchOnMount: "always" as const },
  });

  const commonOptions = {
    address: registroAddress,
    args: address ? ([address] as const) : undefined,
    query: { enabled: Boolean(address), staleTime: 0, refetchOnMount: "always" as const },
  };

  const esUsuario = useReadRegistroEntidadesEsUsuario(commonOptions);
  const esCentroVerificado = useReadRegistroEntidadesEsCentroVerificado(commonOptions);
  const esMunicipalidad = useReadRegistroEntidadesEsMunicipalidad(commonOptions);

  function refrescar() {
    esUsuario.refetch();
    esCentroVerificado.refetch();
    esMunicipalidad.refetch();
    refetchBalance();
  }

  if (!isConnected) {
    return (
      <p className="text-neutral-500">
        Conecta tu wallet para ver tu estado on-chain (esta lectura es directa desde la
        blockchain, no depende del indexer).
      </p>
    );
  }

  const loading = esUsuario.isLoading || esCentroVerificado.isLoading || esMunicipalidad.isLoading;
  const tieneAlgunRol = Boolean(esUsuario.data || esCentroVerificado.data || esMunicipalidad.data);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 rounded-xl border border-neutral-200 bg-surface-warm p-5">
        <p className="label-mono">Tu balance de PLST</p>
        <p className="text-4xl font-heading font-semibold text-forest">
          {cargandoBalance || balance === undefined
            ? "…"
            : Number(formatUnits(balance, 18)).toLocaleString("es-CR")}
        </p>
        <p className="text-xs text-neutral-500">Leído directo del contrato PlasticoToken.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-5">
        <p className="text-sm text-neutral-500 flex items-center gap-3">
          Wallet conectada: <span className="font-mono">{address}</span>
          <button
            type="button"
            onClick={refrescar}
            className="text-forest hover:underline text-xs"
          >
            Actualizar
          </button>
        </p>

        {loading ? (
          <p className="text-neutral-500">Consultando el contrato...</p>
        ) : (
          <ul className="flex flex-col gap-2">
            <EstadoItem label="Usuario registrado" valor={Boolean(esUsuario.data)} />
            <EstadoItem label="Centro recolector verificado" valor={Boolean(esCentroVerificado.data)} />
            <EstadoItem label="Municipalidad" valor={Boolean(esMunicipalidad.data)} />
          </ul>
        )}

        {!tieneAlgunRol && !loading ? (
          <p className="text-sm text-neutral-500">
            Tu wallet aún no tiene ningún rol registrado.{" "}
            <a href="/registro/usuario" className="text-forest hover:underline">
              Registrate como usuario
            </a>{" "}
            o{" "}
            <a href="/registro/centro" className="text-forest hover:underline">
              registra un centro recolector
            </a>
            .
          </p>
        ) : null}
      </div>

      {tieneAlgunRol && address ? (
        <div className="flex flex-col gap-2">
          <h2 className="font-heading font-semibold text-navy">Tu actividad de reciclaje</h2>
          <WalletResumen address={address} />
        </div>
      ) : null}
    </div>
  );
}

function EstadoItem({ label, valor }: { label: string; valor: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className={valor ? "text-forest" : "text-neutral-400"}>{valor ? "✓" : "—"}</span>
      {label}
    </li>
  );
}
