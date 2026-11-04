"use client";

import { useState } from "react";
import { IniciarLoteForm } from "./IniciarLoteForm";
import { RegistrarEntregaForm } from "./RegistrarEntregaForm";
import { CerrarLoteForm } from "./CerrarLoteForm";

// Estado compartido entre los tres pasos: el lote que se acaba de iniciar se autocompleta
// en "Registrar entrega" y "Cerrar lote", en vez de que la municipalidad tenga que copiar
// el numero a mano entre formularios.
export function LotesWorkflow({ transaccionesAddress }: { transaccionesAddress: `0x${string}` }) {
  const [loteActivo, setLoteActivo] = useState<bigint | null>(null);

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-navy">1. Iniciar lote</h2>
        <IniciarLoteForm transaccionesAddress={transaccionesAddress} onLoteCreado={setLoteActivo} />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-navy">2. Registrar entrega</h2>
        <RegistrarEntregaForm transaccionesAddress={transaccionesAddress} loteIdInicial={loteActivo} />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-navy">3. Cerrar lote</h2>
        <CerrarLoteForm transaccionesAddress={transaccionesAddress} loteIdInicial={loteActivo} />
      </section>
    </div>
  );
}
