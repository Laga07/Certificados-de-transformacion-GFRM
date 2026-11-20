import nodemailer, { type Transporter } from "nodemailer";
import { logger } from "./logger.js";

// Correo transaccional (verificacion de cuenta, restablecer contrasena). Tres modos, en
// este orden de prioridad:
//   1. SMTP_URL definido  -> cualquier proveedor SMTP (Brevo, SendGrid, Mailgun, Amazon SES,
//      Postmark, incluso Gmail con "contrasena de aplicacion" para pruebas). Formato:
//      smtp://usuario:contrasena@smtp.proveedor.com:587  (o smtps://...:465)
//   2. RESEND_API_KEY     -> API HTTP de Resend (plan gratuito 3,000/mes), sin SMTP.
//   3. Ninguno            -> desarrollo: el correo NO se envia, se escribe completo en el log
//      (incluido el enlace) para poder seguir probando el flujo.
export interface Correo {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const APP_URL = (process.env.APP_URL ?? "http://localhost:3001").replace(/\/$/, "");
const FROM = process.env.MAIL_FROM ?? "Certificado de Transformacion <onboarding@resend.dev>";

let transporte: Transporter | null = null;
function smtp(): Transporter | null {
  const url = process.env.SMTP_URL;
  if (!url) return null;
  if (!transporte) transporte = nodemailer.createTransport(url);
  return transporte;
}

export function modoCorreo(): "smtp" | "resend" | "log" {
  if (process.env.SMTP_URL) return "smtp";
  if (process.env.RESEND_API_KEY) return "resend";
  return "log";
}

export async function enviarCorreo(correo: Correo): Promise<void> {
  const html = correo.html ?? `<pre style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(correo.text)}</pre>`;

  const viaSmtp = smtp();
  if (viaSmtp) {
    await viaSmtp.sendMail({ from: FROM, to: correo.to, subject: correo.subject, text: correo.text, html });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [correo.to], subject: correo.subject, text: correo.text, html }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      logger.error({ status: res.status, body }, "Resend rechazo el envio");
      throw new Error("No se pudo enviar el correo");
    }
    return;
  }

  logger.warn(
    { to: correo.to, subject: correo.subject, text: correo.text },
    "Sin SMTP_URL ni RESEND_API_KEY: el correo NO se envio, se muestra aca (modo desarrollo)",
  );
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}
