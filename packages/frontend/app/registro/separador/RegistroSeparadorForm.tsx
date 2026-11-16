"use client";

import { useEffect, useState } from "react";
import { useWriteRegistroEntidadesRegistrarSeparador } from "@/lib/generated";
import { cargarPerfilPropio, hashIdentidad, provinciaIdDesdeClave } from "@/lib/identidad";
import { TIPOS_SEPARADOR } from "@/lib/catalogos";
import { UbicacionField } from "@/components/UbicacionField";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";

export function RegistroSeparadorForm({ registroAddress }: { registroAddress: `0x${string}` }) {
  const [cedula, setCedula] = useState("");
  const [provinciaId, setProvinciaId] = useState(0);
  const [cantonId, setCantonId] = useState(1);
  const [tipoSeparador, setTipoSeparador] = useState(0);
  const [preparando, setPreparando] = useState(false);
  const [errorHash, setErrorHash] = useState<Error | null>(null);

  const { writeContract, data: hash, isPending, error } = useWriteRegistroEntidadesRegistrarSeparador();
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);

  // Se llena solo con los datos de "Mi entidad" si ya estan cargados.
  useEffect(() => {
    cargarPerfilPropio().then((p) => {
      if (!p || p.tipo !== "SEPARADOR") return;
      setCedula(p.cedula);
      setProvinciaId(provinciaIdDesdeClave(p.provincia));
      setCantonId(p.cantonId);
      if (p.subtipo !== null) setTipoSeparador(p.subtipo);
    });
  }, []);

  async function handleSubmit() {
    if (!cedula.trim()) return;
    setPreparando(true);
    setErrorHash(null);
    try {
      const { cedulaHash } = await hashIdentidad({ cedula });
      writeContract({
        address: registroAddress,
        args: [cedulaHash!, provinciaId, cantonId, tipoSeparador],
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
        Cédula (a la cadena solo viaja un hash irreversible)
        <input
          type="text"
          value={cedula}
          onChange={(event) => setCedula(event.target.value)}
          placeholder="1-2345-6789"
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
        Tipo de separador
        <select
          value={tipoSeparador}
          onChange={(event) => setTipoSeparador(Number(event.target.value))}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        >
          {TIPOS_SEPARADOR.map((nombre, index) => (
            <option key={nombre} value={index}>
              {nombre}
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
        disabled={!cedula.trim()}
      >
        Registrarme como separador
      </TxButton>
    </div>
  );
}
