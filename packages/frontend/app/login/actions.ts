"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const COOKIE_NAME = "session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias, igual que el vencimiento del JWT

async function autenticar(
  path: "login" | "register",
  formData: FormData,
): Promise<string | null> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return "Completa el correo y la contrasena.";
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return `No se pudo conectar con la API (${API_URL}).`;
  }

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { message?: string } | null;
    return data?.message ?? "No se pudo completar la operacion.";
  }

  const data = (await res.json()) as { token: string };
  (await cookies()).set(COOKIE_NAME, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  redirect("/");
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
