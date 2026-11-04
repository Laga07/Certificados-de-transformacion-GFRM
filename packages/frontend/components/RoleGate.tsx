"use client";

import { useAccount } from "wagmi";
import {
  useReadRegistroEntidadesEsCentroVerificado,
  useReadRegistroEntidadesEsMunicipalidad,
  useReadRegistroEntidadesEsUsuario,
} from "@/lib/generated";

export function RoleGate({
  role,
  registroAddress,
  children,
}: {
  role: "usuario" | "centro" | "municipalidad";
  registroAddress: `0x${string}`;
  children: React.ReactNode;
}) {
  const { address, isConnected } = useAccount();

  const options = {
    address: registroAddress,
    args: address ? ([address] as const) : undefined,
    query: { enabled: Boolean(address), staleTime: 0, refetchOnMount: "always" as const },
  };

  const esUsuario = useReadRegistroEntidadesEsUsuario(options);
  const esCentro = useReadRegistroEntidadesEsCentroVerificado(options);
  const esMunicipalidad = useReadRegistroEntidadesEsMunicipalidad(options);

  if (!isConnected) {
    return <p className="text-neutral-500">Conecta tu wallet para continuar.</p>;
  }

  const loading = esUsuario.isLoading || esCentro.isLoading || esMunicipalidad.isLoading;
  if (loading) {
    return <p className="text-neutral-500">Verificando rol on-chain...</p>;
  }

  const autorizado =
    role === "usuario" ? esUsuario.data : role === "centro" ? esCentro.data : esMunicipalidad.data;

  if (!autorizado) {
    const nombreRol =
      role === "usuario" ? "usuario registrado" : role === "centro" ? "centro verificado" : "municipalidad";
    return (
      <p className="text-amber-700 text-sm">
        Tu wallet conectada no tiene el rol requerido ({nombreRol}) para esta acción.
      </p>
    );
  }

  return <>{children}</>;
}
