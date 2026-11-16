"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  useReadRegistroEntidadesHasRole,
  useReadRegistroEntidadesVerifierRole,
  useWriteRegistroEntidadesVerificarIntermediario,
  useWriteRegistroEntidadesVerificarTransformador,
} from "@/lib/generated";
import { apiFetch, apiPost, ApiError, type EstadoRevision, type Perfil } from "@/lib/api";
import { API_URL } from "@/lib/apiUrl";
import { PROVINCIAS } from "@/lib/catalogos";
import { nombreCanton } from "@/lib/cantones";
import { provinciaIdDesdeClave } from "@/lib/identidad";
import { SUBTIPOS_INTERMEDIARIO, TIPOS_SEPARADOR } from "@/lib/catalogos";
import { TxButton } from "@/components/TxButton";
import { useTxReceipt } from "@/lib/useTxReceipt";
import { GAS_FEE_OVERRIDES } from "@/lib/gasOverrides";
import { EstadoBadge } from "@/components/EstadoBadge";

interface PerfilAdmin extends Perfil {
  account: { id: number; email: string; walletAddress: string | null; emailVerificadoEn: string | null };
  onChain: { registrado: boolean; verificado: boolean | null; activo: boolean | null };
  _count?: { documentos: number };
}

const TABS: { estado: EstadoRevision; label: string }[] = [
  { estado: "PENDIENTE", label: "Pendientes" },
  { estado: "APROBADO", label: "Aprobados" },
  { estado: "RECHAZADO", label: "Rechazados" },
];

export function RevisionEntidades({ registroAddress }: { registroAddress: `0x${string}` }) {
  const [estado, setEstado] = useState<EstadoRevision>("PENDIENTE");
  const [perfiles, setPerfiles] = useState<PerfilAdmin[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setPerfiles(null);
    setError(null);
    try {
      const res = await apiFetch<{ data: PerfilAdmin[] }>(`/api/admin/perfiles?estado=${estado}&pageSize=100`);
      setPerfiles(res.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo cargar la lista.");
      setPerfiles([]);
    }
  }, [estado]);

  useEffect(() => {
    // Diferido a una microtarea: react-hooks/set-state-in-effect exige que ningun setState
    // corra de forma sincrona dentro del cuerpo del efecto.
    void Promise.resolve().then(cargar);
  }, [cargar]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.estado}
            type="button"
            onClick={() => setEstado(tab.estado)}
            className={`label-mono px-3 py-1.5 border ${estado === tab.estado ? "border-forest text-forest bg-surface-warm" : "border-neutral-300"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {perfiles === null ? (
        <p className="text-sm text-neutral-500">Cargando...</p>
      ) : perfiles.length === 0 ? (
        <p className="text-sm text-neutral-500">Nada en esta bandeja.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {perfiles.map((p) => (
            <FilaPerfil key={p.id} perfil={p} registroAddress={registroAddress} onCambio={cargar} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilaPerfil({
  perfil,
  registroAddress,
  onCambio,
}: {
  perfil: PerfilAdmin;
  registroAddress: `0x${string}`;
  onCambio: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [detalle, setDetalle] = useState<PerfilAdmin | null>(null);
  const [notas, setNotas] = useState(perfil.notasRevisor ?? "");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto || detalle) return;
    apiFetch<PerfilAdmin>(`/api/admin/perfiles/${perfil.id}`)
      .then(setDetalle)
      .catch(() => setDetalle(perfil));
  }, [abierto, detalle, perfil]);

  async function revisar(estado: EstadoRevision) {
    setOcupado(true);
    setError(null);
    try {
      await apiPost(`/api/admin/perfiles/${perfil.id}/revision`, { estado, notas });
      onCambio();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar la revisión.");
    } finally {
      setOcupado(false);
    }
  }

  const provinciaId = provinciaIdDesdeClave(perfil.provincia);
  const subtipoNombre =
    perfil.tipo === "INTERMEDIARIO"
      ? SUBTIPOS_INTERMEDIARIO[perfil.subtipo ?? 0]
      : perfil.tipo === "SEPARADOR"
        ? TIPOS_SEPARADOR[perfil.subtipo ?? 0]
        : null;
  const necesitaVerificacionOnChain = perfil.tipo === "INTERMEDIARIO" || perfil.tipo === "TRANSFORMADOR";

  return (
    <li className="border border-neutral-300 bg-surface-warm">
      <button type="button" onClick={() => setAbierto((v) => !v)} className="w-full text-left p-4 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-heading font-semibold text-navy">{perfil.razonSocial}</span>
        <span className="label-mono">{perfil.tipo.toLowerCase()}{subtipoNombre ? ` · ${subtipoNombre}` : ""}</span>
        <span className="text-xs text-foreground/60">{PROVINCIAS[provinciaId]} · {nombreCanton(provinciaId, perfil.cantonId)}</span>
        <span className="ml-auto flex items-center gap-2">
          <OnChainBadge perfil={perfil} />
          <EstadoBadge estado={perfil.estadoRevision} />
        </span>
      </button>

      {abierto ? (
        <div className="border-t border-neutral-300 p-4 flex flex-col gap-4 text-sm">
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            <Dato label="Cédula" valor={perfil.cedula} />
            <Dato label="Representante" valor={perfil.representante} />
            <Dato label="Correo de la cuenta" valor={`${perfil.account.email}${perfil.account.emailVerificadoEn ? "" : " (sin verificar)"}`} />
            <Dato label="Correo de contacto" valor={perfil.correoContacto} />
            <Dato label="Teléfono" valor={perfil.telefono} />
            <Dato label="Dirección" valor={perfil.direccion} />
            <Dato label="Wallet vinculada" valor={perfil.account.walletAddress} mono />
            <Dato label="Descripción" valor={perfil.descripcion} />
          </dl>

          <div>
            <span className="label-mono">Documentos</span>
            {detalle === null ? (
              <p className="text-neutral-500">Cargando...</p>
            ) : detalle.documentos.length === 0 ? (
              <p className="text-amber-700">Sin documentos adjuntos.</p>
            ) : (
              <ul className="flex flex-wrap gap-2 mt-1">
                {detalle.documentos.map((d) => (
                  <li key={d.id}>
                    <a href={`${API_URL}/api/perfil/documentos/${d.id}`} target="_blank" rel="noreferrer" className="border border-neutral-300 px-2 py-1 text-forest hover:underline">
                      {d.nombre}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label className="flex flex-col gap-1">
            Notas para la entidad (las ve en su perfil)
            <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} className="rounded border border-neutral-300 bg-white px-3 py-2" />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            {perfil.estadoRevision !== "APROBADO" ? (
              <button type="button" onClick={() => revisar("APROBADO")} disabled={ocupado} className="rounded bg-forest px-4 py-2 text-white hover:bg-forest-light disabled:opacity-50">
                Aprobar en la plataforma
              </button>
            ) : null}
            {perfil.estadoRevision !== "RECHAZADO" ? (
              <button type="button" onClick={() => revisar("RECHAZADO")} disabled={ocupado} className="rounded border border-red-600 px-4 py-2 text-red-700 hover:bg-red-50 disabled:opacity-50">
                Rechazar
              </button>
            ) : null}
            {perfil.estadoRevision !== "PENDIENTE" ? (
              <button type="button" onClick={() => revisar("PENDIENTE")} disabled={ocupado} className="text-xs text-neutral-500 hover:underline">
                Volver a pendiente
              </button>
            ) : null}
            {error ? <span className="text-red-600">{error}</span> : null}
          </div>

          {necesitaVerificacionOnChain ? (
            <VerificacionOnChain perfil={perfil} registroAddress={registroAddress} onCambio={onCambio} />
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function OnChainBadge({ perfil }: { perfil: PerfilAdmin }) {
  if (!perfil.account.walletAddress) return <span className="label-mono text-amber-700">sin wallet</span>;
  if (!perfil.onChain.registrado) return <span className="label-mono text-amber-700">sin registro on-chain</span>;
  if (perfil.onChain.activo === false) return <span className="label-mono text-red-700">desactivada</span>;
  if (perfil.onChain.verificado === false) return <span className="label-mono text-amber-700">on-chain sin verificar</span>;
  return <span className="label-mono text-forest">on-chain ok</span>;
}

function Dato({ label, valor, mono }: { label: string; valor: string | null | undefined; mono?: boolean }) {
  return (
    <div>
      <dt className="label-mono">{label}</dt>
      <dd className={mono ? "font-mono text-xs break-all" : ""}>{valor || <span className="text-foreground/40">—</span>}</dd>
    </div>
  );
}

function VerificacionOnChain({
  perfil,
  registroAddress,
  onCambio,
}: {
  perfil: PerfilAdmin;
  registroAddress: `0x${string}`;
  onCambio: () => void;
}) {
  const { address, isConnected } = useAccount();
  const verifierRole = useReadRegistroEntidadesVerifierRole({ address: registroAddress });
  const esVerificador = useReadRegistroEntidadesHasRole({
    address: registroAddress,
    args: verifierRole.data && address ? ([verifierRole.data, address] as const) : undefined,
    query: { enabled: Boolean(verifierRole.data && address), staleTime: 0 },
  });
  const intermediarioWrite = useWriteRegistroEntidadesVerificarIntermediario();
  const transformadorWrite = useWriteRegistroEntidadesVerificarTransformador();
  const write = perfil.tipo === "INTERMEDIARIO" ? intermediarioWrite : transformadorWrite;
  const { isConfirming, isSuccess, revertedError } = useTxReceipt(write.data);

  useEffect(() => {
    if (isSuccess) onCambio();
  }, [isSuccess, onCambio]);

  const wallet = perfil.account.walletAddress as `0x${string}` | null;

  return (
    <div className="border-t border-neutral-200 pt-3 flex flex-col gap-2">
      <span className="label-mono">Verificación on-chain ({perfil.tipo.toLowerCase()})</span>
      {!wallet ? (
        <p className="text-amber-700">La entidad todavía no vinculó su wallet.</p>
      ) : !perfil.onChain.registrado ? (
        <p className="text-amber-700">La wallet {wallet.slice(0, 6)}…{wallet.slice(-4)} todavía no se registró en el contrato.</p>
      ) : perfil.onChain.verificado ? (
        <p className="text-forest">Ya verificada on-chain.</p>
      ) : perfil.estadoRevision !== "APROBADO" ? (
        <p className="text-foreground/60">Aprobá el perfil en la plataforma antes de verificar on-chain.</p>
      ) : !isConnected ? (
        <p className="text-foreground/60">Conectá la wallet con VERIFIER_ROLE para verificar.</p>
      ) : esVerificador.data === false ? (
        <p className="text-amber-700">La wallet conectada no tiene VERIFIER_ROLE.</p>
      ) : (
        <TxButton
          onClick={() => write.writeContract({ address: registroAddress, args: [wallet], ...GAS_FEE_OVERRIDES })}
          isPending={write.isPending}
          isConfirming={isConfirming}
          isSuccess={isSuccess}
          error={write.error ?? revertedError}
        >
          Verificar on-chain
        </TxButton>
      )}
    </div>
  );
}
