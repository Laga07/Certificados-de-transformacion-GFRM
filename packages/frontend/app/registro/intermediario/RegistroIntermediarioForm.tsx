"use client";

import { useEffect, useState } from "react";
import { registroEntidadesAbi } from "@/lib/generated";
import { cargarPerfilPropio, hashIdentidad, provinciaIdDesdeClave } from "@/lib/identidad";
import { SUBTIPOS_INTERMEDIARIO } from "@/lib/catalogos";
import { UbicacionField } from "@/components/UbicacionField";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { useEscribir } from "@/lib/useEscribir";

export function RegistroIntermediarioForm({ registroAddress }: { registroAddress: `0x${string}` }) {
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [provinciaId, setProvinciaId] = useState(0);
  const [cantonId, setCantonId] = useState(1);
  const [subtipo, setSubtipo] = useState(0);
  const [preparando, setPreparando] = useState(false);
  const [errorHash, setErrorHash] = useState<Error | null>(null);

  const { enviar, data: hash, isPending, error } = useEscribir(registroEntidadesAbi, "registrarIntermediario");
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  useEffect(() => {
    cargarPerfilPropio().then((p) => {
      if (!p || p.tipo !== "INTERMEDIARIO") return;
      setNombre(p.razonSocial);
      setCedula(p.cedula);
      setProvinciaId(provinciaIdDesdeClave(p.provincia));
      setCantonId(p.cantonId);
      if (p.subtipo !== null) setSubtipo(p.subtipo);
    });
  }, []);

  async function handleSubmit() {
    if (!nombre.trim() || !cedula.trim()) return;
    setPreparando(true);
    setErrorHash(null);
    try {
      const { nombreHash, cedulaHash } = await hashIdentidad({ nombre, cedula });
      enviar(registroAddress, [nombreHash!, cedulaHash!, provinciaId, cantonId, subtipo]);
    } catch (e) {
      setErrorHash(e instanceof Error ? e : new Error("No se pudo preparar el registro"));
    } finally {
      setPreparando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Razón social (a la cadena solo viaja su hash)
        <input
          type="text"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          placeholder="Centro de Acopio San Rafael"
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Cédula jurídica (a la cadena solo viaja su hash)
        <input
          type="text"
          value={cedula}
          onChange={(event) => setCedula(event.target.value)}
          placeholder="3-101-123456"
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <UbicacionField
        provinciaId={provinciaId}
        cantonId={cantonId}
        onChangeProvincia={setProvinciaId}
        onChangeCanton={setCantonId}
      />

      <label className="flex flex-col gap-1 text-sm">
        Subtipo
        <select
          value={subtipo}
          onChange={(event) => setSubtipo(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        >
          {SUBTIPOS_INTERMEDIARIO.map((nombreS, index) => (
            <option key={nombreS} value={index}>
              {nombreS}
            </option>
          ))}
        </select>
      </label>

      <TxButton
        onClick={handleSubmit}
        isPending={isPending || preparando}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error ?? revertedError ?? errorHash}
        disabled={!nombre.trim() || !cedula.trim()}
      >
        Registrarme como intermediario
      </TxButton>
    </div>
  );
}
