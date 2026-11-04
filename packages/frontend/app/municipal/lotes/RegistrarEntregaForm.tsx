"use client";

import { useEffect, useState } from "react";
import { isAddress } from "viem";
import { useWriteTransaccionesPlasticoRegistrarEntregaMunicipal } from "@/lib/generated";
import { TxButton } from "@/components/TxButton";
import { PlasticoTypeField } from "@/components/PlasticoTypeField";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

export function RegistrarEntregaForm({
  transaccionesAddress,
  loteIdInicial,
}: {
  transaccionesAddress: `0x${string}`;
  loteIdInicial?: bigint | null;
}) {
  const [loteId, setLoteId] = useState(1);
  const [usuarioWallet, setUsuarioWallet] = useState("");
  const [pesoGramos, setPesoGramos] = useState(100);
  const [tipoPlastico, setTipoPlastico] = useState(1);
  const [rutaId, setRutaId] = useState(1);

  // Se autocompleta con el lote que se acaba de crear en el paso 1, para no tener que
  // copiar el numero a mano -- se puede seguir editando si se quiere usar otro lote.
  useEffect(() => {
    if (loteIdInicial != null) setLoteId(Number(loteIdInicial));
  }, [loteIdInicial]);

  const { writeContract, data: hash, isPending, error } =
    useWriteTransaccionesPlasticoRegistrarEntregaMunicipal();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  const usuarioValido = isAddress(usuarioWallet);

  function handleSubmit() {
    if (!usuarioValido) return;
    writeContract({
      address: transaccionesAddress,
      args: [BigInt(loteId), usuarioWallet as `0x${string}`, BigInt(pesoGramos), tipoPlastico, rutaId],
      ...GAS_FEE_OVERRIDES,
    });
  }

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <label className="flex flex-col gap-1 text-sm">
        ID del lote
        <input
          type="number"
          min={1}
          value={loteId}
          onChange={(event) => setLoteId(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Wallet del usuario
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
      <label className="flex flex-col gap-1 text-sm">
        Ruta (debe coincidir con la ruta del lote)
        <input
          type="number"
          min={0}
          value={rutaId}
          onChange={(event) => setRutaId(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>
      <TxButton
        onClick={handleSubmit}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError}
        disabled={!usuarioValido}
      >
        Registrar entrega
      </TxButton>
    </div>
  );
}
