"use client";

import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import {
  useReadMercadoCertificadosSaldoPendiente,
  useReadRegistroEntidadesEsComprador,
  useReadRegistroEntidadesEsIntermediarioVerificado,
  useReadRegistroEntidadesEsSeparador,
  useReadRegistroEntidadesEsTransformadorVerificado,
  useReadRegistroEntidadesIntermediarios,
  useReadRegistroEntidadesTransformadores,
} from "@/lib/generated";
import { WalletResumen } from "@/components/WalletResumen";

export function PerfilClient({
  registroAddress,
  mercadoAddress,
}: {
  registroAddress: `0x${string}`;
  mercadoAddress: `0x${string}`;
}) {
  const { address, isConnected } = useAccount();

  const commonOptions = {
    address: registroAddress,
    args: address ? ([address] as const) : undefined,
    query: { enabled: Boolean(address), staleTime: 0, refetchOnMount: "always" as const },
  };

  const esSeparador = useReadRegistroEntidadesEsSeparador(commonOptions);
  const esIntermediarioVerificado = useReadRegistroEntidadesEsIntermediarioVerificado(commonOptions);
  const esTransformadorVerificado = useReadRegistroEntidadesEsTransformadorVerificado(commonOptions);
  const esComprador = useReadRegistroEntidadesEsComprador(commonOptions);
  // Registrado-pero-sin-verificar-todavia: se consulta el struct completo para distinguir
  // "nunca se registró" de "registrado, esperando verificación" (esXVerificado da false en
  // ambos casos).
  const intermediarioRaw = useReadRegistroEntidadesIntermediarios(commonOptions);
  const transformadorRaw = useReadRegistroEntidadesTransformadores(commonOptions);

  const { data: saldoPendiente, refetch: refetchSaldo } = useReadMercadoCertificadosSaldoPendiente({
    address: mercadoAddress,
    args: address ? ([address] as const) : undefined,
    query: { enabled: Boolean(address), staleTime: 0, refetchOnMount: "always" },
  });

  function refrescar() {
    esSeparador.refetch();
    esIntermediarioVerificado.refetch();
    esTransformadorVerificado.refetch();
    esComprador.refetch();
    intermediarioRaw.refetch();
    transformadorRaw.refetch();
    refetchSaldo();
  }

  if (!isConnected) {
    return (
      <p className="text-neutral-500">
        Conectá tu wallet para ver tu estado on-chain (esta lectura es directa desde la
        blockchain, no depende del indexer).
      </p>
    );
  }

  const loading =
    esSeparador.isLoading ||
    esIntermediarioVerificado.isLoading ||
    esTransformadorVerificado.isLoading ||
    esComprador.isLoading;

  // Los getters autogenerados por un mapping de struct devuelven una tupla posicional (ver
  // ComprarCertificadoForm.tsx para la misma nota) -- activo es el indice 5 en Intermediario
  // (nombreHash, cedulaHash, ubicacion, subtipo, verificado, activo, registradoEn) y el 4 en
  // Transformador (sin el campo subtipo).
  const intermediarioRegistradoSinVerificar =
    Boolean(intermediarioRaw.data?.[5]) && !esIntermediarioVerificado.data;
  const transformadorRegistradoSinVerificar =
    Boolean(transformadorRaw.data?.[4]) && !esTransformadorVerificado.data;

  const tieneAlgunRol = Boolean(
    esSeparador.data ||
      esIntermediarioVerificado.data ||
      esTransformadorVerificado.data ||
      esComprador.data ||
      intermediarioRegistradoSinVerificar ||
      transformadorRegistradoSinVerificar,
  );

  return (
    <div className="flex flex-col gap-4">
      {saldoPendiente !== undefined && saldoPendiente > BigInt(0) ? (
        <div className="flex flex-col gap-1 rounded-xl border border-neutral-200 bg-surface-warm p-5">
          <p className="label-mono">Saldo pendiente de retirar</p>
          <p className="text-4xl font-heading font-semibold text-forest">
            {formatUnits(saldoPendiente, 6)} USDT
          </p>
          <a href="/mercado/pagos" className="text-xs text-forest hover:underline w-fit">
            Ir a retirar →
          </a>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-5">
        <p className="text-sm text-neutral-500 flex items-center gap-3">
          Wallet conectada: <span className="font-mono">{address}</span>
          <button type="button" onClick={refrescar} className="text-forest hover:underline text-xs">
            Actualizar
          </button>
        </p>

        {loading ? (
          <p className="text-neutral-500">Consultando el contrato...</p>
        ) : (
          <ul className="flex flex-col gap-2">
            <EstadoItem label="Separador registrado" valor={Boolean(esSeparador.data)} />
            <EstadoItem
              label="Intermediario"
              valor={Boolean(esIntermediarioVerificado.data)}
              pendiente={intermediarioRegistradoSinVerificar}
            />
            <EstadoItem
              label="Transformador"
              valor={Boolean(esTransformadorVerificado.data)}
              pendiente={transformadorRegistradoSinVerificar}
            />
            <EstadoItem label="Comprador registrado" valor={Boolean(esComprador.data)} />
          </ul>
        )}

        {!tieneAlgunRol && !loading ? (
          <p className="text-sm text-neutral-500">
            Tu wallet aún no tiene ningún rol registrado — elegí uno en{" "}
            <a href="/registro/separador" className="text-forest hover:underline">
              Registrarse
            </a>
            .
          </p>
        ) : null}
      </div>

      {tieneAlgunRol && address ? (
        <div className="flex flex-col gap-2">
          <h2 className="font-heading font-semibold text-navy">Tu actividad</h2>
          <WalletResumen address={address} />
        </div>
      ) : null}
    </div>
  );
}

function EstadoItem({
  label,
  valor,
  pendiente,
}: {
  label: string;
  valor: boolean;
  pendiente?: boolean;
}) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className={valor ? "text-forest" : pendiente ? "text-amber-600" : "text-neutral-400"}>
        {valor ? "✓" : pendiente ? "…" : "—"}
      </span>
      {label}
      {pendiente ? <span className="text-xs text-amber-600">(esperando verificación)</span> : null}
    </li>
  );
}
