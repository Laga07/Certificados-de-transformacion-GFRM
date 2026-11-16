import { apiFetch, apiPost, type Perfil } from "./api";

// Hash de identidad calculado en el servidor (HMAC con secreto), ver
// backend/src/lib/identidad.ts para el porque. Reemplaza al antiguo keccak256 en el navegador.
export async function hashIdentidad(input: { cedula?: string; nombre?: string }) {
  return apiPost<{ cedulaHash: `0x${string}` | null; nombreHash: `0x${string}` | null }>(
    "/api/identidad/hash",
    input,
  );
}

export async function cargarPerfilPropio(): Promise<Perfil | null> {
  try {
    const { perfil } = await apiFetch<{ perfil: Perfil | null }>("/api/perfil");
    return perfil;
  } catch {
    return null;
  }
}

// Indice del enum Provincia a partir de la clave que devuelve la API ("SanJose" -> 0).
export const PROVINCIA_KEYS = ["SanJose", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limon"] as const;
export function provinciaIdDesdeClave(clave: string): number {
  const idx = (PROVINCIA_KEYS as readonly string[]).indexOf(clave);
  return idx === -1 ? 0 : idx;
}
