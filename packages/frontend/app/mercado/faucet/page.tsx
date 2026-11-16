import { getDeploymentAddresses } from "@/lib/addresses.server";
import { FaucetForm } from "./FaucetForm";

export default function FaucetPage() {
  const deployment = getDeploymentAddresses();

  if (!deployment) {
    return <p className="text-neutral-500">Los contratos aún no se han desplegado en Amoy.</p>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-navy">USDT y POL de prueba</h1>
        <p className="text-sm text-foreground/70 mt-1">
          Mientras el sistema corre en Polygon Amoy, ni el USDT ni el POL tienen valor. Necesitás
          POL para pagar el gas de cualquier transacción y USDT de prueba para comprar certificados.
        </p>
      </div>

      <section className="border border-neutral-300 p-5 flex flex-col gap-3">
        <h2 className="font-heading font-semibold text-navy">1. POL de Amoy (para el gas)</h2>
        <p className="text-sm text-foreground/70">
          Lo entrega el faucet oficial de Polygon. Pegá tu dirección y elegí la red &ldquo;Polygon
          Amoy&rdquo;. Con 0.5 POL alcanza para muchas transacciones.
        </p>
        <a
          href="https://faucet.polygon.technology/"
          target="_blank"
          rel="noreferrer"
          className="w-fit rounded-sm border border-forest px-4 py-2 font-mono text-xs uppercase tracking-wider text-forest hover:bg-surface-warm"
        >
          Abrir faucet de Polygon ↗
        </a>
      </section>

      <section className="border border-neutral-300 p-5 flex flex-col gap-3">
        <h2 className="font-heading font-semibold text-navy">2. USDT de prueba (para comprar certificados)</h2>
        <p className="text-sm text-foreground/70">
          El contrato MockUSDT de esta plataforma tiene un faucet público: hasta 10 000 USDT por
          llamada, directo a tu wallet conectada. Necesitás tener POL primero.
        </p>
        <FaucetForm usdtAddress={deployment.MockUSDT} />
      </section>
    </div>
  );
}
