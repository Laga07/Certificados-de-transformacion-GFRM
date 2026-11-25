import { BuscarCodigo } from "./BuscarCodigo";

export const metadata = { title: "Verificar una constancia" };

// Publica: no requiere cuenta (ver proxy.ts).
export default function VerificarPage() {
  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <div>
        <span className="tag-mono">Verificación pública</span>
        <h1 className="text-3xl font-heading italic font-semibold text-navy mt-3">Verificar una constancia</h1>
        <p className="text-foreground/70 mt-2">
          Ingresá el código impreso en la constancia (empieza con <span className="font-mono">VV-</span>) o escaneá su
          código QR. Vas a ver qué empresa retiró cuántos certificados, para qué informe, y la transacción en la
          blockchain que lo prueba.
        </p>
      </div>
      <BuscarCodigo />
    </div>
  );
}
