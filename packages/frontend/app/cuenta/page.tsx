import Link from "next/link";
import { apiFetchServer } from "@/lib/api.server";
import type { Cuenta, EstadoRevision, TipoEntidad } from "@/lib/api";
import { EstadoBadge } from "@/components/EstadoBadge";
import { CuentaClient } from "./CuentaClient";

interface Me {
  cuenta: Cuenta;
  perfil: { id: number; tipo: TipoEntidad; estadoRevision: EstadoRevision; razonSocial: string } | null;
}

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ bienvenida?: string; verificado?: string; contrasena?: string }>;
}) {
  const [me, params] = await Promise.all([apiFetchServer<Me>("/api/auth/me"), searchParams]);

  if (!me) {
    return <p className="text-neutral-500">No se pudo cargar tu cuenta. Probá cerrar sesión y volver a entrar.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Mi cuenta</h1>
        <p className="text-sm text-foreground/70 max-w-2xl mt-1">
          Tu acceso al sitio, tu wallet vinculada y los datos de la entidad que representás. Esto es
          lo que el verificador de Green Foot revisa antes de aprobarte on-chain.
        </p>
      </div>

      {params.bienvenida ? (
        <Aviso>
          Cuenta creada. Te enviamos un correo para verificarla. Mientras tanto podés completar los
          datos de tu entidad y vincular tu wallet.
        </Aviso>
      ) : null}
      {params.verificado ? <Aviso>Correo verificado. Gracias.</Aviso> : null}
      {params.contrasena ? <Aviso>Contraseña actualizada.</Aviso> : null}

      <CuentaClient cuentaInicial={me.cuenta} />

      <section className="border border-neutral-300 bg-surface-warm p-5 flex flex-col gap-2">
        <h2 className="font-heading font-semibold text-navy">Datos de mi entidad</h2>
        {me.perfil ? (
          <p className="text-sm">
            <strong>{me.perfil.razonSocial}</strong> &middot; {me.perfil.tipo.toLowerCase()} &middot;{" "}
            <EstadoBadge estado={me.perfil.estadoRevision} />
          </p>
        ) : (
          <p className="text-sm text-foreground/70">
            Todavía no cargaste los datos de tu entidad (razón social, cédula, contacto, documentos).
            Sin esto el verificador no puede aprobarte.
          </p>
        )}
        <Link href="/cuenta/perfil" className="w-fit label-mono text-forest hover:underline">
          {me.perfil ? "Editar datos y documentos →" : "Completar datos →"}
        </Link>
      </section>
    </div>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return <p className="border border-forest bg-surface-warm px-4 py-2 text-sm text-forest">{children}</p>;
}
