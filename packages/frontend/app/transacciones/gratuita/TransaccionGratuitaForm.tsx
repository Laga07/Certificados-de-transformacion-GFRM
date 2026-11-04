"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { isAddress } from "viem";
import {
  useReadRegistroEntidadesEsCentroVerificado,
  useReadRegistroEntidadesEsMunicipalidad,
  useWriteTransaccionesPlasticoRegistrarTransaccionGratuita,
} from "@/lib/generated";
import { TxButton } from "@/components/TxButton";
import { PlasticoTypeField } from "@/components/PlasticoTypeField";
import { ValorInfo } from "@/components/ValorInfo";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

const TIPO_USUARIO_A_CENTRO_GRATIS = 0;
const TIPO_USUARIO_A_MUNICIPALIDAD = 3;

export function TransaccionGratuitaForm({
  registroAddress,
  transaccionesAddress,
}: {
  registroAddress: `0x${string}`;
  transaccionesAddress: `0x${string}`;
}) {
  const { address, isConnected } = useAccount();
  const [usuarioWallet, setUsuarioWallet] = useState("");
  const [pesoGramos, setPesoGramos] = useState(100);
  const [tipoPlastico, setTipoPlastico] = useState(1);

  const roleOptions = {
    address: registroAddress,
    args: address ? ([address] as const) : undefined,
    query: { enabled: Boolean(address), staleTime: 0, refetchOnMount: "always" as const },
  };
  const esCentro = useReadRegistroEntidadesEsCentroVerificado(roleOptions);
  const esMunicipalidad = useReadRegistroEntidadesEsMunicipalidad(roleOptions);

  const { writeContract, data: hash, isPending, error } =
    useWriteTransaccionesPlasticoRegistrarTransaccionGratuita();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  if (!isConnected) {
    return <p className="text-neutral-500">Conecta tu wallet para continuar.</p>;
  }

  if (esCentro.isLoading || esMunicipalidad.isLoading) {
    return <p className="text-neutral-500">Verificando rol on-chain...</p>;
  }

  if (!esCentro.data && !esMunicipalidad.data) {
    return (
      <p className="text-amber-700 text-sm">
        Solo un Centro Recolector verificado o una Municipalidad pueden registrar una entrega
        gratuita. Tu wallet no tiene ninguno de esos roles.
      </p>
    );
  }

  const tipo = esCentro.data ? TIPO_USUARIO_A_CENTRO_GRATIS : TIPO_USUARIO_A_MUNICIPALIDAD;
  const usuarioValido = isAddress(usuarioWallet);

  function handleSubmit() {
    if (!usuarioValido) return;
    writeContract({
      address: transaccionesAddress,
      args: [usuarioWallet as `0x${string}`, BigInt(pesoGramos), tipo, tipoPlastico],
      ...GAS_FEE_OVERRIDES,
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <p className="text-sm text-neutral-500">
        Actuando como <strong>{esCentro.data ? "Centro Recolector" : "Municipalidad"}</strong>.
        Como quien recibe el material, tu wallet paga el gas de esta transacción.
      </p>

      <label className="flex flex-col gap-1 text-sm">
        Wallet del usuario que entrega el material
        <input
          type="text"
          value={usuarioWallet}
          onChange={(event) => setUsuarioWallet(event.target.value)}
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

      <PlasticoTypeField value={tipoPlastico} onChange={setTipoPlastico} />

      <ValorInfo />

      <TxButton
        onClick={handleSubmit}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError}
        disabled={!usuarioValido || pesoGramos <= 0}
      >
        Registrar entrega gratuita
      </TxButton>
    </div>
  );
}
