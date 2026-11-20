"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL_SERVER as API_URL } from "@/lib/apiUrl";
import { cabecerasDelVisitante } from "@/lib/api.server";

const COOKIE_NAME = "session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias, igual que el vencimiento del JWT

async function guardarSesion(token: string) {
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

async function llamarApi(path: string, body: unknown): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: string }> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await cabecerasDelVisitante()) },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, error: `No se pudo conectar con la API (${API_URL}).` };
  }
  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!res.ok) {
    return { ok: false, error: (data?.message as string | undefined) ?? "No se pudo completar la operacion." };
  }
  return { ok: true, data: data ?? {} };
}

async function autenticar(path: "login" | "register", formData: FormData): Promise<string | null> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return "Completa el correo y la contrasena.";
  }
  if (path === "register" && formData.get("aceptaTerminos") !== "on") {
    return "Tenes que aceptar los Terminos de uso y la Politica de privacidad.";
  }

  const resultado = await llamarApi(path, { email, password });
  if (!resultado.ok) return resultado.error;

  await guardarSesion(resultado.data.token as string);
  redirect(path === "register" ? "/cuenta?bienvenida=1" : "/");
}

export async function loginAction(_prevState: string | null, formData: FormData) {
  return autenticar("login", formData);
}

export async function registerAction(_prevState: string | null, formData: FormData) {
  return autenticar("register", formData);
}

export async function logoutAction() {
  (await cookies()).delete(COOKIE_NAME);
  redirect("/login");
}

// ==== Verificacion de correo y restablecer contrasena ====

export async function verificarCorreoAction(_prevState: string | null, formData: FormData) {
  const token = String(formData.get("token") ?? "");
  if (!token) return "Falta el token del enlace.";
  const resultado = await llamarApi("verificar-email", { token });
  if (!resultado.ok) return resultado.error;
  await guardarSesion(resultado.data.token as string);
  redirect("/cuenta?verificado=1");
}

export async function olvideContrasenaAction(_prevState: string | null, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return "Escribi tu correo.";
  const resultado = await llamarApi("olvide-contrasena", { email });
  if (!resultado.ok) return resultado.error;
  // Mensaje identico exista o no la cuenta (lo decide la API).
  return `ok:${(resultado.data.mensaje as string | undefined) ?? "Revisa tu correo."}`;
}

export async function restablecerContrasenaAction(_prevState: string | null, formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmacion = String(formData.get("confirmacion") ?? "");
  if (!token) return "Falta el token del enlace.";
  if (password.length < 8) return "La contrasena debe tener al menos 8 caracteres.";
  if (password !== confirmacion) return "Las contrasenas no coinciden.";
  const resultado = await llamarApi("restablecer-contrasena", { token, password });
  if (!resultado.ok) return resultado.error;
  await guardarSesion(resultado.data.token as string);
  redirect("/cuenta?contrasena=1");
}
