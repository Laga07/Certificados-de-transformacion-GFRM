import "server-only";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export interface Sesion {
  email: string;
  rol: "USER" | "ADMIN";
  emailVerificado: boolean;
}

// Lee y valida la cookie de sesion en Server Components. null = visitante sin cuenta.
// (El backend vuelve a validar contra la base en cada llamada; esto es solo para la UI.)
export async function getSesion(): Promise<Sesion | null> {
  const token = (await cookies()).get("session")?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload !== "object" || !("email" in payload)) return null;
    return {
      email: String(payload.email),
      rol: payload.rol === "ADMIN" ? "ADMIN" : "USER",
      emailVerificado: Boolean(payload.ev),
    };
  } catch {
    return null;
  }
}
