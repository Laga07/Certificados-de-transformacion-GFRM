import type { FastifyInstance } from "fastify";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { ethers } from "ethers";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { cuentaPublica, requireAuth, signSession } from "../lib/auth.js";
import { APP_URL, enviarCorreo } from "../lib/mailer.js";
import { hashCedula, hashNombre } from "../lib/identidad.js";
import type { TipoAuthToken } from "../generated/prisma/enums.js";

const credentialsSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres").max(200),
});

const BCRYPT_ROUNDS = 12;
const MAX_INTENTOS = 5;
const BLOQUEO_MINUTOS = 15;
const VERIFICACION_HORAS = 24;
const RESET_MINUTOS = 60;

// Rate limit mas estricto que el global para todo lo que toca credenciales.
const LIMITE_AUTH = { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } };

function esAdminBootstrap(email: string): boolean {
  // Primer admin: lista de correos en ADMIN_EMAILS (coma-separada). Despues, los admins se
  // nombran desde el panel (POST /admin/cuentas/:id/rol).
  const lista = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return lista.includes(email.toLowerCase());
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function emitirToken(accountId: number, tipo: TipoAuthToken, minutos: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  // Un solo token vivo por tipo y cuenta: los anteriores se invalidan.
  await prisma.authToken.updateMany({
    where: { accountId, tipo, usadoEn: null },
    data: { usadoEn: new Date() },
  });
  await prisma.authToken.create({
    data: { accountId, tipo, tokenHash: sha256(token), expiraEn: new Date(Date.now() + minutos * 60_000) },
  });
  return token;
}

async function consumirToken(token: string, tipo: TipoAuthToken) {
  const registro = await prisma.authToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!registro || registro.tipo !== tipo || registro.usadoEn || registro.expiraEn < new Date()) {
    return null;
  }
  await prisma.authToken.update({ where: { id: registro.id }, data: { usadoEn: new Date() } });
  return registro;
}

async function enviarVerificacion(accountId: number, email: string) {
  const token = await emitirToken(accountId, "VERIFICAR_EMAIL", VERIFICACION_HORAS * 60);
  const enlace = `${APP_URL}/verificar-correo?token=${token}`;
  await enviarCorreo({
    to: email,
    subject: "Verifica tu correo - Certificado de Transformacion",
    text:
      `Hola,\n\nPara activar tu cuenta en la plataforma de Certificado de Transformacion, abri este enlace ` +
      `(vale ${VERIFICACION_HORAS} horas):\n\n${enlace}\n\nSi no creaste esta cuenta, ignora este correo.`,
  });
}

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", LIMITE_AUTH, async (request, reply) => {
    const body = credentialsSchema.safeParse(request.body);
    if (!body.success) return reply.badRequest(body.error.issues[0]?.message ?? "Datos invalidos");
    const email = body.data.email.toLowerCase();

    const existente = await prisma.account.findUnique({ where: { email } });
    if (existente) return reply.conflict("Ese correo ya esta registrado");

    const passwordHash = await bcrypt.hash(body.data.password, BCRYPT_ROUNDS);
    const account = await prisma.account.create({
      data: { email, passwordHash, rol: esAdminBootstrap(email) ? "ADMIN" : "USER" },
    });

    // Si el correo falla (Resend caido) la cuenta igual queda creada: puede pedir el reenvio.
    enviarVerificacion(account.id, account.email).catch((error) =>
      request.log.error({ error }, "No se pudo enviar el correo de verificacion"),
    );

    return { token: signSession(account), cuenta: cuentaPublica(account) };
  });

  app.post("/auth/login", LIMITE_AUTH, async (request, reply) => {
    const body = credentialsSchema.safeParse(request.body);
    if (!body.success) return reply.badRequest("Correo o contrasena incorrectos");
    const email = body.data.email.toLowerCase();

    const account = await prisma.account.findUnique({ where: { email } });
    // Mismo mensaje y mismo costo (bcrypt igual se ejecuta) exista o no la cuenta, para no
    // revelar que correos estan registrados.
    const hashComparar = account?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva";
    if (account?.bloqueadoHasta && account.bloqueadoHasta > new Date()) {
      return reply.tooManyRequests(
        `Demasiados intentos fallidos. Proba de nuevo en ${Math.ceil((account.bloqueadoHasta.getTime() - Date.now()) / 60_000)} minutos`,
      );
    }

    const valido = await bcrypt.compare(body.data.password, hashComparar);
    if (!account || !valido) {
      if (account) {
        const intentos = account.intentosFallidos + 1;
        await prisma.account.update({
          where: { id: account.id },
          data: {
            intentosFallidos: intentos >= MAX_INTENTOS ? 0 : intentos,
            bloqueadoHasta: intentos >= MAX_INTENTOS ? new Date(Date.now() + BLOQUEO_MINUTOS * 60_000) : null,
          },
        });
      }
      return reply.unauthorized("Correo o contrasena incorrectos");
    }

    const actualizada = await prisma.account.update({
      where: { id: account.id },
      data: {
        intentosFallidos: 0,
        bloqueadoHasta: null,
        // Promocion tardia: si el correo se agrego a ADMIN_EMAILS despues de crear la cuenta.
        ...(account.rol === "USER" && esAdminBootstrap(email) ? { rol: "ADMIN" as const } : {}),
      },
    });

    return { token: signSession(actualizada), cuenta: cuentaPublica(actualizada) };
  });

  app.get("/auth/me", { preHandler: requireAuth }, async (request) => {
    const account = request.account!;
    const perfil = await prisma.entidadPerfil.findUnique({
      where: { accountId: account.id },
      select: { id: true, tipo: true, estadoRevision: true, razonSocial: true },
    });
    return { cuenta: cuentaPublica(account), perfil };
  });

  // ==== VERIFICACION DE CORREO ====

  app.post("/auth/verificar-email", LIMITE_AUTH, async (request, reply) => {
    const body = z.object({ token: z.string().min(32).max(128) }).safeParse(request.body);
    if (!body.success) return reply.badRequest("Token invalido");

    const registro = await consumirToken(body.data.token, "VERIFICAR_EMAIL");
    if (!registro) return reply.badRequest("El enlace es invalido o ya vencio. Pedi uno nuevo.");

    const account = await prisma.account.update({
      where: { id: registro.accountId },
      data: { emailVerificadoEn: new Date() },
    });
    return { token: signSession(account), cuenta: cuentaPublica(account) };
  });

  app.post("/auth/reenviar-verificacion", { ...LIMITE_AUTH, preHandler: requireAuth }, async (request, reply) => {
    const account = request.account!;
    if (account.emailVerificadoEn) return reply.badRequest("El correo ya esta verificado");
    await enviarVerificacion(account.id, account.email);
    return { ok: true };
  });

  // ==== RESTABLECER CONTRASENA ====

  app.post("/auth/olvide-contrasena", LIMITE_AUTH, async (request, reply) => {
    const body = z.object({ email: z.string().email() }).safeParse(request.body);
    if (!body.success) return reply.badRequest("Correo invalido");
    const email = body.data.email.toLowerCase();

    const account = await prisma.account.findUnique({ where: { email } });
    // Respuesta identica exista o no la cuenta.
    if (account) {
      const token = await emitirToken(account.id, "RESET_PASSWORD", RESET_MINUTOS);
      const enlace = `${APP_URL}/restablecer-contrasena?token=${token}`;
      enviarCorreo({
        to: account.email,
        subject: "Restablecer contrasena - Certificado de Transformacion",
        text:
          `Recibimos un pedido para cambiar la contrasena de tu cuenta. Abri este enlace (vale ${RESET_MINUTOS} ` +
          `minutos):\n\n${enlace}\n\nSi no fuiste vos, ignora este correo: tu contrasena no cambia.`,
      }).catch((error) => request.log.error({ error }, "No se pudo enviar el correo de reset"));
    }
    return { ok: true, mensaje: "Si el correo existe, te enviamos un enlace para restablecer la contrasena." };
  });

  app.post("/auth/restablecer-contrasena", LIMITE_AUTH, async (request, reply) => {
    const body = z
      .object({ token: z.string().min(32).max(128), password: credentialsSchema.shape.password })
      .safeParse(request.body);
    if (!body.success) return reply.badRequest(body.error.issues[0]?.message ?? "Datos invalidos");

    const registro = await consumirToken(body.data.token, "RESET_PASSWORD");
    if (!registro) return reply.badRequest("El enlace es invalido o ya vencio. Pedi uno nuevo.");

    const account = await prisma.account.update({
      where: { id: registro.accountId },
      data: {
        passwordHash: await bcrypt.hash(body.data.password, BCRYPT_ROUNDS),
        intentosFallidos: 0,
        bloqueadoHasta: null,
        // Llegar por el enlace del correo tambien demuestra que el correo es suyo.
        emailVerificadoEn: new Date(),
      },
    });
    return { token: signSession(account), cuenta: cuentaPublica(account) };
  });

  // ==== VINCULO DE WALLET (firma de mensaje, estilo Sign-In With Ethereum) ====
  // 1) GET nonce -> 2) la wallet firma el mensaje -> 3) POST firma -> la direccion queda
  // asociada a la cuenta. Sin esto no hay forma de saber que persona esta detras de que
  // direccion. Una direccion solo puede estar vinculada a una cuenta.

  function mensajeVinculo(email: string, address: string, nonce: string): string {
    return (
      `Certificado de Transformacion\n\n` +
      `Vincular la wallet ${address} a la cuenta ${email}.\n\n` +
      `Esta firma no cuesta gas ni autoriza ninguna transaccion.\n\n` +
      `Nonce: ${nonce}`
    );
  }

  app.get("/auth/wallet/nonce", { preHandler: requireAuth }, async (request, reply) => {
    const query = z.object({ address: z.string() }).safeParse(request.query);
    if (!query.success) return reply.badRequest("Falta address");
    let address: string;
    try {
      address = ethers.getAddress(query.data.address);
    } catch {
      return reply.badRequest("Direccion invalida");
    }
    const nonce = randomBytes(16).toString("hex");
    await prisma.account.update({ where: { id: request.account!.id }, data: { walletNonce: nonce } });
    return { address, nonce, mensaje: mensajeVinculo(request.account!.email, address, nonce) };
  });

  app.post("/auth/wallet/vincular", { ...LIMITE_AUTH, preHandler: requireAuth }, async (request, reply) => {
    const body = z.object({ address: z.string(), signature: z.string() }).safeParse(request.body);
    if (!body.success) return reply.badRequest("Datos invalidos");
    const account = request.account!;
    if (!account.walletNonce) return reply.badRequest("Pedi un nonce primero");

    let address: string;
    try {
      address = ethers.getAddress(body.data.address);
    } catch {
      return reply.badRequest("Direccion invalida");
    }

    let firmante: string;
    try {
      firmante = ethers.verifyMessage(mensajeVinculo(account.email, address, account.walletNonce), body.data.signature);
    } catch {
      return reply.badRequest("Firma invalida");
    }
    if (firmante.toLowerCase() !== address.toLowerCase()) {
      return reply.badRequest("La firma no corresponde a esa direccion");
    }

    const otra = await prisma.account.findUnique({ where: { walletAddress: address } });
    if (otra && otra.id !== account.id) return reply.conflict("Esa wallet ya esta vinculada a otra cuenta");

    const actualizada = await prisma.account.update({
      where: { id: account.id },
      data: { walletAddress: address, walletVinculadaEn: new Date(), walletNonce: null },
    });
    return { cuenta: cuentaPublica(actualizada) };
  });

  app.delete("/auth/wallet", { preHandler: requireAuth }, async (request) => {
    const actualizada = await prisma.account.update({
      where: { id: request.account!.id },
      data: { walletAddress: null, walletVinculadaEn: null, walletNonce: null },
    });
    return { cuenta: cuentaPublica(actualizada) };
  });

  // ==== HASH DE IDENTIDAD (ver lib/identidad.ts) ====
  // El navegador ya no calcula keccak256(cedula): pide aca el HMAC con el pepper del servidor
  // y manda ESE valor al contrato. Con sesion + rate limit para que no sirva de oraculo.

  app.post(
    "/identidad/hash",
    { config: { rateLimit: { max: 20, timeWindow: "1 minute" } }, preHandler: requireAuth },
    async (request, reply) => {
      const body = z
        .object({ cedula: z.string().min(3).max(40).optional(), nombre: z.string().min(2).max(200).optional() })
        .safeParse(request.body);
      if (!body.success || (!body.data.cedula && !body.data.nombre)) {
        return reply.badRequest("Indica cedula y/o nombre");
      }
      return {
        cedulaHash: body.data.cedula ? hashCedula(body.data.cedula) : null,
        nombreHash: body.data.nombre ? hashNombre(body.data.nombre) : null,
      };
    },
  );
}
