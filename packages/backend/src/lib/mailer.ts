import { logger } from "./logger.js";

// Correo transaccional (verificacion de cuenta, restablecer contrasena). Con RESEND_API_KEY
// configurado se envia por la API HTTP de Resend (plan gratuito: 3,000 correos/mes, sin
// dependencia npm). Sin la clave -- desarrollo local -- el correo NO se envia: se escribe
// completo en el log, incluido el enlace, para poder seguir probando el flujo.
export interface Correo {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const APP_URL = (process.env.APP_URL ?? "http://localhost:3001").replace(/\/$/, "");

export async function enviarCorreo(correo: Correo): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM ?? "Certificado de Transformacion <onboarding@resend.dev>";

  if (!apiKey) {
    logger.warn(
      { to: correo.to, subject: correo.subject, text: correo.text },
      "RESEND_API_KEY no configurado: el correo NO se envio, se muestra aca (modo desarrollo)",
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [correo.to],
      subject: correo.subject,
      text: correo.text,
      html: correo.html ?? `<pre style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(correo.text)}</pre>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logger.error({ status: res.status, body }, "Resend rechazo el envio");
    throw new Error("No se pudo enviar el correo");
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}
