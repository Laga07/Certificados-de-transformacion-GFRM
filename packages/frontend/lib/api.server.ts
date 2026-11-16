import "server-only";
import { cookies } from "next/headers";
import { API_URL } from "./apiUrl";

// Version para Server Components / server actions: el navegador no esta en medio, asi que la
// cookie de sesion hay que reenviarla a mano en el header Cookie.
export async function apiFetchServer<T>(path: string, init: RequestInit = {}): Promise<T | null> {
  const session = (await cookies()).get("session")?.value;
  const headers = new Headers(init.headers);
  if (session) headers.set("Cookie", `session=${session}`);
  try {
    const res = await fetch(`${API_URL}${path}`, { ...init, headers, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
