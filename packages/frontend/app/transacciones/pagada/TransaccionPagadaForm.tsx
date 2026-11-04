"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { formatUnits, isAddress, parseUnits } from "viem";
import {
  useReadMockUsdtBalanceOf,
  useReadRegistroEntidadesEsCentroVerificado,
  useReadRegistroEntidadesEsUsuario,
  useWriteMockUsdtApprove,
  useWriteMockUsdtFaucet,
  useWriteTransaccionesPlasticoRegistrarTransaccionPagada,
} from "@/lib/generated";
import { TxButton } from "@/components/TxButton";
import { PlasticoTypeField } from "@/components/PlasticoTypeField";
import { ValorInfo } from "@/components/ValorInfo";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

const USDT_DECIMALS = 6;

export function TransaccionPagadaForm({
  registroAddress,
  transaccionesAddress,
  mockUsdtAddress,
}: {
  registroAddress: `0x${string}`;
  transaccionesAddress: `0x${string}`;
  mockUsdtAddress: `0x${string}`;
}) {
  const { address, isConnected } = useAccount();

  const roleOptions = {
    address: registroAddress,
    args: address ? ([address] as const) : undefined,
    query: { enabled: Boolean(address), staleTime: 0, refetchOnMount: "always" as const },
  };
  const esUsuario = useReadRegistroEntidadesEsUsuario(roleOptions);
  const esCentro = useReadRegistroEntidadesEsCentroVerificado(roleOptions);

  const balance = useReadMockUsdtBalanceOf({
    address: mockUsdtAddress,
    args: address ? ([address] as const) : undefined,
    query: { enabled: Boolean(address) },
  });

  const [contraparte, setContraparte] = useState("");
  const [pesoGramos, setPesoGramos] = useState(100);
  const [montoUSDT, setMontoUSDT] = useState("1");
  const [tipoPlastico, setTipoPlastico] = useState(1);

  const faucet = useWriteMockUsdtFaucet();
  const faucetReceipt = useTxReceipt(faucet.data);

  const approve = useWriteMockUsdtApprove();
  const approveReceipt = useTxReceipt(approve.data);

  const registrar = useWriteTransaccionesPlasticoRegistrarTransaccionPagada();
  const registrarReceipt = useTxReceipt(registrar.data);

  if (!isConnected) {
    return <p className="text-neutral-500">Conecta tu wallet para continuar.</p>;
  }

  if (esUsuario.isLoading || esCentro.isLoading) {
    return <p className="text-neutral-500">Verificando rol on-chain...</p>;
  }

  if (!esUsuario.data && !esCentro.data) {
    return (
      <p className="text-amber-700 text-sm">
        Solo un Usuario registrado o un Centro Recolector verificado pueden usar este flujo.
      </p>
    );
  }

  const usuarioPaga = Boolean(esUsuario.data);
  const contraparteValida = isAddress(contraparte);
  let montoParsed: bigint | null = null;
  try {
    montoParsed = montoUSDT ? parseUnits(montoUSDT, USDT_DECIMALS) : null;
  } catch {
    montoParsed = null;
  }

  function handleFaucet() {
    faucet.writeContract({
      address: mockUsdtAddress,
      args: [parseUnits("100", USDT_DECIMALS)],
      ...GAS_FEE_OVERRIDES,
    });
  }

  function handleApprove() {
    if (!montoParsed) return;
    approve.writeContract({
      address: mockUsdtAddress,
      args: [transaccionesAddress, montoParsed],
      ...GAS_FEE_OVERRIDES,
    });
  }

  function handleRegistrar() {
    if (!contraparteValida || !montoParsed) return;
    registrar.writeContract({
      address: transaccionesAddress,
      args: [contraparte as `0x${string}`, BigInt(pesoGramos), montoParsed, usuarioPaga, tipoPlastico],
      ...GAS_FEE_OVERRIDES,
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <p className="text-sm text-neutral-500">
        Actuando como <strong>{usuarioPaga ? "Usuario (pagás por un servicio)" : "Centro (pagás por el plástico)"}</strong>.
      </p>

      <div className="flex items-center justify-between rounded border border-neutral-200 px-3 py-2 text-sm">
        <span>
          Balance MockUSDT:{" "}
          <span className="text-gold font-medium">
            {balance.data !== undefined ? formatUnits(balance.data, USDT_DECIMALS) : "..."}
          </span>
        </span>
        <button
          type="button"
          onClick={handleFaucet}
          disabled={faucet.isPending || faucetReceipt.isConfirming}
          className="text-forest hover:underline disabled:opacity-50"
        >
          {faucet.isPending || faucetReceipt.isConfirming ? "Solicitando..." : "Pedir 100 USDT de prueba"}
        </button>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Wallet de la contraparte ({usuarioPaga ? "centro" : "usuario"})
        <input
          type="text"
          value={contraparte}
          onChange={(event) => setContraparte(event.target.value)}
          placeholder="0x..."
          className="rounded border border-neutral-300 bg-white px-3 py-2 font-mono text-xs"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Peso (gramos)
        <input
          type="number"
          min={1}
          value={pesoGramos}
          onChange={(event) => setPesoGramos(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Monto en USDT
        <input
          type="text"
          inputMode="decimal"
          value={montoUSDT}
          onChange={(event) => setMontoUSDT(event.target.value)}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <PlasticoTypeField value={tipoPlastico} onChange={setTipoPlastico} />

      <ValorInfo />

      <div className="flex flex-col gap-3 rounded border border-neutral-200 p-3">
        <p className="text-xs text-neutral-500">
          Paso 1: aprobá que el contrato pueda mover tus USDT. Paso 2: registrá la transacción.
        </p>
        <TxButton
          onClick={handleApprove}
          isPending={approve.isPending}
          isConfirming={approveReceipt.isConfirming}
          isSuccess={approveReceipt.isSuccess}
          error={approve.error ?? approveReceipt.revertedError}
          disabled={!montoParsed}
        >
          1. Aprobar USDT
        </TxButton>
        <TxButton
          onClick={handleRegistrar}
          isPending={registrar.isPending}
          isConfirming={registrarReceipt.isConfirming}
          isSuccess={registrarReceipt.isSuccess}
          error={registrar.error ?? registrarReceipt.revertedError}
          disabled={!contraparteValida || !montoParsed || !approveReceipt.isSuccess}
        >
          2. Registrar transacción pagada
        </TxButton>
      </div>
    </div>
  );
}
