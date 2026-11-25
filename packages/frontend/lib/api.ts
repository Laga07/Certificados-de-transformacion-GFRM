import { API_URL } from "./apiUrl";

// Cliente de la API para Client Components. La sesion viaja en la cookie httpOnly "session"
// (la pone login/actions.ts): el frontend (:3001) y la API (:4001) son el mismo sitio
// (mismo host, distinto puerto; en produccion app.dominio / api.dominio comparten dominio
// registrable), asi que con credentials: "include" el navegador la manda sola y la API la
// lee del header Cookie (ver backend/src/lib/auth.ts). Nunca hace falta exponer el JWT a JS.
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API_URL}${path}`, { ...init, headers, credentials: "include" });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(res.status, data?.message ?? `Error ${res.status} de la API`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

// Tipos compartidos con el backend (routes/auth.ts, routes/perfil.ts, routes/admin.ts).
export interface Cuenta {
  id: number;
  email: string;
  rol: "USER" | "ADMIN";
  emailVerificado: boolean;
  wallet: string | null;
  walletVinculadaEn: string | null;
  createdAt: string;
}

export type TipoEntidad = "SEPARADOR" | "INTERMEDIARIO" | "TRANSFORMADOR" | "COMPRADOR";
export type EstadoRevision = "PENDIENTE" | "APROBADO" | "RECHAZADO";

export interface PerfilDocumento {
  id: number;
  nombre: string;
  mimeType: string;
  tamano: number;
  createdAt: string;
}

export interface Perfil {
  id: number;
  accountId: number;
  tipo: TipoEntidad;
  razonSocial: string;
  cedula: string;
  cedulaHash: string;
  representante: string | null;
  telefono: string | null;
  correoContacto: string | null;
  direccion: string | null;
  provincia: string;
  cantonId: number;
  subtipo: number | null;
  descripcion: string | null;
  estadoRevision: EstadoRevision;
  notasRevisor: string | null;
  revisadoEn: string | null;
  createdAt: string;
  updatedAt: string;
  documentos: PerfilDocumento[];
}

// ---- Declaraciones de cumplimiento (backend/src/routes/declaraciones.ts) ----
export type EstadoDeclaracion = "PENDIENTE" | "CONFIRMADA";

export interface Declaracion {
  id: number;
  codigo: string;
  wallet: string;
  material: string;
  materialIndex: number;
  cantidadKg: string;
  periodo: number;
  periodoTexto: string;
  entidadDestino: string;
  referencia: string | null;
  descripcion: string | null;
  razonSocial: string | null;
  cedulaJuridica: string | null;
  informeRef: `0x${string}`;
  contenido: string;
  estado: EstadoDeclaracion;
  txHash: string | null;
  blockNumber: string | null;
  confirmadaEn: string | null;
  createdAt: string;
}

export interface CantonOrigen {
  provincia: string;
  cantonId: number;
  kgAportados: string;
}

export interface TramoOrigen {
  emisionId: string;
  kg: string;
  compraTxHash?: string;
  compraBloque?: string;
  transformadorWallet?: string;
  precioUSDTporKg?: string;
  kgTransformadosEmision?: string;
  separadores: number;
  intermediarios: number;
  cantones: CantonOrigen[];
  mermaTotalGramos?: string;
}

export interface OrigenDeclaracion {
  tramos: TramoOrigen[];
  kgSinOrigen: string;
}

export interface VerificacionPublica {
  codigo: string;
  estado: EstadoDeclaracion;
  razonSocial: string | null;
  cedulaJuridica: string | null;
  wallet: string;
  material: string;
  cantidadKg: string;
  periodoTexto: string;
  entidadDestino: string;
  referencia: string | null;
  confirmadaEn: string | null;
  txHash: string | null;
  blockNumber: string | null;
  informeRef: string;
  contenido: string;
  huellaCoincide: boolean;
  retiroIndexado: boolean;
  origen: OrigenDeclaracion;
}
