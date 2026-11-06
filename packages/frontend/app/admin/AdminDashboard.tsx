"use client";

import { useAccount } from "wagmi";
import {
  useReadRegistroEntidadesDefaultAdminRole,
  useReadRegistroEntidadesHasRole,
  useReadRegistroEntidadesVerifierRole,
} from "@/lib/generated";
import { PendientesPanel } from "./PendientesPanel";

export function AdminDashboard({ registroAddress }: { registroAddress: `0x${string}` }) {
  const { address, isConnected } = useAccount();

  const verifierRole = useReadRegistroEntidadesVerifierRole({ address: registroAddress });
  const adminRole = useReadRegistroEntidadesDefaultAdminRole({ address: registroAddress });

  const esVerificador = useReadRegistroEntidadesHasRole({
    address: registroAddress,
    args: verifierRole.data && address ? ([verifierRole.data, address] as const) : undefined,
    query: { enabled: Boolean(verifierRole.data && address), staleTime: 0, refetchOnMount: "always" },
  });

  const esAdmin = useReadRegistroEntidadesHasRole({
    address: registroAddress,
    args: adminRole.data && address ? ([adminRole.data, address] as const) : undefined,
    query: { enabled: Boolean(adminRole.data && address), staleTime: 0, refetchOnMount: "always" },
  });

  if (!isConnected) {
    return (
      <p className="text-neutral-500">
        Conectá la wallet de administración (la que hizo el deploy, o una con rol de
        verificador) para continuar.
      </p>
    );
  }

  const loading =
    verifierRole.isLoading || adminRole.isLoading || esVerificador.isLoading || esAdmin.isLoading;

  if (loading) {
    return <p className="text-neutral-500">Verificando permisos on-chain...</p>;
  }

  if (!esVerificador.data && !esAdmin.data) {
    return (
      <p className="text-amber-700 text-sm">
        Tu wallet conectada (<span className="font-mono">{address}</span>) no tiene rol de
        verificador ni de administrador en RegistroEntidades.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h2 className="font-heading font-semibold text-navy">Intermediarios pendientes de verificación</h2>
        <PendientesPanel registroAddress={registroAddress} tipo="intermediario" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading font-semibold text-navy">Transformadores pendientes de verificación</h2>
        <PendientesPanel registroAddress={registroAddress} tipo="transformador" />
      </section>
    </div>
  );
}
