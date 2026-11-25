"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { mercadoCertificadosAbi } from "@/lib/generated";
import { useEscribir } from "@/lib/useEscribir";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { apiPost, ApiError, type Declaracion } from "@/lib/api";
import { TxButton } from "@/components/TxButton";

/**
 * Paso on-chain de una declaracion ya creada (PENDIENTE): llama
 * MercadoCertificados.retirarCertificado(material, kg, informeRef, periodo), espera la
 * confirmacion y le avisa a la API para que la marque CONFIRMADA. Si el usuario cierra la
 * pagina despues de firmar, el indexer la confirma igual al ver el evento.
 */
export function RetirarYConfirmar({
  declaracion,
  mercadoAddress,
  etiqueta = "Firmar el retiro de los certificados",
}: {
  declaracion: Declaracion;
  mercadoAddress: `0x${string}`;
  etiqueta?: string;
}) {
  const router = useRouter();
  const { address } = useAccount();
  const { enviar, data: hash, isPending, error } = useEscribir(mercadoCertificadosAbi, "retirarCertificado");
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(hash);
  const [confirmando, setConfirmando] = useState(false);
  const [errorConfirmacion, setErrorConfirmacion] = useState<string | null>(null);
  const yaConfirmado = useRef(false);

  const walletCorrecta = address?.toLowerCase() === declaracion.wallet.toLowerCase();

  useEffect(() => {
    if (!isSuccess || !hash || yaConfirmado.current) return;
    yaConfirmado.current = true;
    let cancelado = false;
    (async () => {
      setConfirmando(true);
      // El RPC de la API puede ver el bloque unos segundos despues que la wallet: reintenta.
      for (let intento = 0; intento < 8 && !cancelado; intento++) {
        try {
          await apiPost(`/api/declaraciones/${declaracion.id}/confirmar`, { txHash: hash });
          router.push(`/declaraciones/${declaracion.id}?confirmada=1`);
          router.refresh();
          return;
        } catch (e) {
          if (e instanceof ApiError && e.status !== 409) {
            setErrorConfirmacion(e.message);
            break;
          }
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
      if (!cancelado) {
        setConfirmando(false);
        setErrorConfirmacion(
          (prev) => prev ?? "El retiro se hizo, pero la confirmación está tardando. Recargá esta página en un minuto: se completa sola.",
        );
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [isSuccess, hash, declaracion.id, router]);

  return (
    <div className="flex flex-col gap-3">
      {!walletCorrecta ? (
        <p className="text-sm text-amber-700">
          Conectá la wallet {declaracion.wallet.slice(0, 6)}…{declaracion.wallet.slice(-4)}: la declaración está a su nombre.
        </p>
      ) : null}
      <TxButton
        onClick={() =>
          enviar(mercadoAddress, [
            declaracion.materialIndex,
            BigInt(declaracion.cantidadKg),
            declaracion.informeRef,
            declaracion.periodo,
          ])
        }
        isPending={isPending || confirmando}
        isConfirming={isConfirming}
        isSuccess={false}
        error={error ?? revertedError}
        disabled={!walletCorrecta}
      >
        {etiqueta}
      </TxButton>
      {confirmando ? <p className="text-sm text-forest">Retiro registrado en la cadena. Generando la constancia...</p> : null}
      {errorConfirmacion ? <p className="text-sm text-amber-700">{errorConfirmacion}</p> : null}
    </div>
  );
}
