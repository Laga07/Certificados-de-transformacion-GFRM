"use client";

import { useEffect, useState } from "react";
import { useWriteRegistroEntidadesRegistrarComprador } from "@/lib/generated";
import { cargarPerfilPropio, hashIdentidad } from "@/lib/identidad";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

export function RegistroCompradorForm({ registroAddress }: { registroAddress: `0x${string}` }) {
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [empresaObligadaLey9786, setEmpresaObligadaLey9786] = useState(false);
  const [preparando, setPreparando] = useState(false);
  const [errorHash, setErrorHash] = useState<Error | null>(null);

  const { writeContract, data: hash, isPending, error } = useWriteRegistroEntidadesRegistrarComprador();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  useEffect(() => {
    cargarPerfilPropio().then((p) => {
      if (!p || p.tipo !== "COMPRADOR") return;
      setNombre(p.razonSocial);
      setCedula(p.cedula);
    });
  }, []);

  async function handleSubmit() {
    if (!nombre.trim() || !cedula.trim()) return;
    setPreparando(true);
    setErrorHash(null);
    try {
      const { nombreHash, cedulaHash } = await hashIdentidad({ nombre, cedula });
      writeContract({
        address: registroAddress,
        args: [nombreHash!, cedulaHash!, empresaObligadaLey9786],
        ...GAS_FEE_OVERRIDES,
      });
    } catch (e) {
      setErrorHash(e instanceof Error ? e : new Error("No se pudo preparar el registro"));
    } finally {
      setPreparando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Nombre de la empresa (a la cadena solo viaja su hash)
        <input
          type="text"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          placeholder="Embotelladora Tropical S.A."
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Cédula jurídica (a la cadena solo viaja su hash)
        <input
          type="text"
          value={cedula}
          onChange={(event) => setCedula(event.target.value)}
          placeholder="3-101-789012"
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={empresaObligadaLey9786}
          onChange={(event) => setEmpresaObligadaLey9786(event.target.checked)}
        />
        Somos una empresa obligada por la Ley 9786 (importamos/producimos/comercializamos
        plástico de un solo uso)
      </label>

      <TxButton
        onClick={handleSubmit}
        isPending={isPending || preparando}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError ?? errorHash}
        disabled={!nombre.trim() || !cedula.trim()}
      >
        Registrarme como comprador
      </TxButton>
    </div>
  );
}
