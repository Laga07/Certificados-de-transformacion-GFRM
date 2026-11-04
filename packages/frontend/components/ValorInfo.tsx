export function ValorInfo() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-surface-warm p-3 text-xs text-foreground/70 flex flex-col gap-1.5">
      <p>
        <span className="font-medium text-forest">Valor económico:</span> el monto pagado en la
        recolección, si existe una transacción.
      </p>
      <p>
        <span className="font-medium text-forest">Valor ambiental:</span> el impacto positivo de
        evitar que ese plástico llegue a un río, playa o relleno sanitario.
      </p>
      <p>
        <span className="font-medium text-forest">Valor técnico:</span> qué tan reciclable es ese
        tipo de plástico según sus propiedades.
      </p>
      <p className="text-foreground/50">
        Podés registrar plástico valorizable aunque no haya un pago inmediato: el valor ambiental
        y técnico también cuentan.
      </p>
    </div>
  );
}
