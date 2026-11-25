"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { MATERIALES } from "@/lib/catalogos";
import { useSaldosCertificados } from "@/lib/useSaldosCertificados";

export function MisCertificados({ certificados }: { certificados: (`0x${string}` | undefined)[] }) {
  const { address } = useAccount();
  const { kg, cargando } = useSaldosCertificados(certificados, address);

  if (cargando) return <p className="text-sm text-neutral-500">Consultando saldos en la cadena...</p>;

  const total = kg.reduce<bigint>((acc, k) => acc + (k ?? BigInt(0)), BigInt(0));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {MATERIALES.map((nombre, i) => {
          const saldo = kg[i];
          const tiene = saldo !== null && saldo > BigInt(0);
          return (
            <div key={nombre} className={`border p-4 flex flex-col gap-2 ${tiene ? "border-forest bg-surface-warm" : "border-neutral-300"}`}>
              <span className="label-mono">{nombre}</span>
              <span className="text-2xl font-heading font-semibold text-navy tabular-nums">
                {saldo === null ? "—" : saldo.toLocaleString("es-CR")} <span className="text-sm text-foreground/60">kg</span>
              </span>
              {tiene ? (
                <Link href={`/declaraciones/nueva?material=${i}`} className="w-fit label-mono text-forest hover:underline">
                  Declarar →
                </Link>
              ) : (
                <span className="text-xs text-foreground/50">Sin certificados</span>
              )}
            </div>
          );
        })}
      </div>
      {total === BigInt(0) ? (
        <p className="text-sm text-foreground/70">
          Todavía no tenés certificados.{" "}
          <Link href="/mercado" className="text-forest hover:underline">
            Comprá en el catálogo
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
