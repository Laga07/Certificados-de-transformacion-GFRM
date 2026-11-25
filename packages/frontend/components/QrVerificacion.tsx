"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

// QR con el enlace publico de verificacion de una constancia. Usa el dominio desde el que se
// abre la pagina (valorverde.org en produccion, localhost en desarrollo).
export function QrVerificacion({ codigo }: { codigo: string }) {
  const [url, setUrl] = useState("");
  const [imagen, setImagen] = useState<string | null>(null);

  useEffect(() => {
    const destino = `${window.location.origin}/verificar/${codigo}`;
    let cancelado = false;
    QRCode.toDataURL(destino, { margin: 1, width: 240, color: { dark: "#1e2f22", light: "#ffffff" } })
      .then((dataUrl) => {
        if (!cancelado) {
          setUrl(destino);
          setImagen(dataUrl);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelado = true;
    };
  }, [codigo]);

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      {imagen ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL generada en el cliente
        <img src={imagen} alt={`Código QR para verificar la constancia ${codigo}`} width={120} height={120} />
      ) : (
        <div className="h-[120px] w-[120px] animate-pulse bg-neutral-200" />
      )}
      <span className="label-mono">Verificar en</span>
      <span className="font-mono text-[0.65rem] break-all max-w-[160px]">{url.replace(/^https?:\/\//, "")}</span>
    </div>
  );
}
