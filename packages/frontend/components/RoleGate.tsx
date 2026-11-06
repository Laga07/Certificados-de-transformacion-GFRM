"use client";

import { useAccount } from "wagmi";
import {
  useReadRegistroEntidadesEsComprador,
  useReadRegistroEntidadesEsIntermediarioVerificado,
  useReadRegistroEntidadesEsSeparador,
  useReadRegistroEntidadesEsTransformadorVerificado,
} from "@/lib/generated";

export type Rol = "separador" | "intermediario" | "transformador" | "comprador";

export function RoleGate({
  role,
  registroAddress,
  children,
}: {
  role: Rol | Rol[];
  registroAddress: `0x${string}`;
  children: React.ReactNode;
}) {
  const rolesPermitidos = Array.isArray(role) ? role : [role];
  const { address, isConnected } = useAccount();

  const options = {
    address: registroAddress,
    args: address ? ([address] as const) : undefined,
    query: { enabled: Boolean(address), staleTime: 0, refetchOnMount: "always" as const },
  };

  const esSeparador = useReadRegistroEntidadesEsSeparador(options);
  const esIntermediario = useReadRegistroEntidadesEsIntermediarioVerificado(options);
  const esTransformador = useReadRegistroEntidadesEsTransformadorVerificado(options);
  const esComprador = useReadRegistroEntidadesEsComprador(options);

  if (!isConnected) {
    return <p className="text-neutral-500">Conectá tu wallet para continuar.</p>;
  }

  const loading =
    esSeparador.isLoading || esIntermediario.isLoading || esTransformador.isLoading || esComprador.isLoading;
  if (loading) {
    return <p className="text-neutral-500">Verificando rol on-chain...</p>;
  }

  const porRol = {
    separador: esSeparador.data,
    intermediario: esIntermediario.data,
    transformador: esTransformador.data,
    comprador: esComprador.data,
  };
  const nombresRol = {
    separador: "separador registrado",
    intermediario: "intermediario verificado",
    transformador: "transformador verificado",
    comprador: "comprador registrado",
  };

  const autorizado = rolesPermitidos.some((r) => porRol[r]);

  if (!autorizado) {
    return (
      <p className="text-amber-700 text-sm">
        Tu wallet conectada no tiene ninguno de los roles requeridos (
        {rolesPermitidos.map((r) => nombresRol[r]).join(" o ")}) para esta acción.
      </p>
    );
  }

  return <>{children}</>;
}
