import "server-only";
import { cookies, headers as requestHeaders } from "next/headers";
import { API_URL_SERVER as API_URL } from "./apiUrl";

// Cuando el servidor de Next llama a la API en nombre de un visitante, la API veria siempre
// la IP del contenedor de Next: el rate limit (10 intentos de login por minuto) se aplicaria
// a TODOS los usuarios juntos. Se reenvia la IP real que puso Caddy en X-Forwarded-For. Es
// seguro porque el puerto de la API no esta expuesto: solo Caddy y Next pueden hablarle, y
// Caddy reemplaza cualquier X-Forwarded-For que mande el cliente.
export async function cabecerasDelVisitante(): Promise<Record<string, string>> {
  const h = await requestHeaders();
  const ip = h.get("x-forwarded-for") ?? h.get("x-real-ip");
  return ip ? { "X-Forwarded-For": ip } : {};
}

// Version para Server Components / server actions: el navegador no esta en medio, asi que la
// cookie de sesion hay que reenviarla a mano en el header Cookie.
export async function apiFetchServer<T>(path: string, init: RequestInit = {}): Promise<T | null> {
  const session = (await cookies()).get("session")?.value;
  const headers = new Headers(init.headers);
  if (session) headers.set("Cookie", `session=${session}`);
  for (const [k, v] of Object.entries(await cabecerasDelVisitante())) headers.set(k, v);
  try {
    const res = await fetch(`${API_URL}${path}`, { ...init, headers, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
