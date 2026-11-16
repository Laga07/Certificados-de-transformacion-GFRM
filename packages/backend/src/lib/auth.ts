import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma.js";
import type { Account } from "../generated/prisma/client.js";

declare module "fastify" {
  interface FastifyRequest {
    // Cuenta autenticada, cargada fresca de la DB por requireAuth (no solo el payload del
    // JWT): asi un cambio de rol o un bloqueo aplica de inmediato aunque el token siga vigente.
    account: Account | null;
  }
}

export interface SessionPayload {
  sub: number;
  email: string;
  rol: "USER" | "ADMIN";
  // email verificado -- el frontend lo usa para mostrar el aviso de "verifica tu correo".
  ev: boolean;
}

export const SESSION_TTL = "30d";

function secret(): string {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET no esta definido en el entorno");
  return value;
}

export function signSession(account: Account): string {
  const payload: SessionPayload = {
    sub: account.id,
    email: account.email,
    rol: account.rol,
    ev: account.emailVerificadoEn !== null,
  };
  return jwt.sign(payload, secret(), { expiresIn: SESSION_TTL });
}

export function verifySession(token: string): SessionPayload {
  const decoded = jwt.verify(token, secret());
  if (typeof decoded !== "object" || decoded === null || typeof decoded.sub === "undefined") {
    throw new Error("Token invalido");
  }
  return decoded as unknown as SessionPayload;
}

function extraerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();
  // El frontend guarda el JWT en la cookie httpOnly "session" -- se acepta tambien para que
  // los Server Components puedan reenviarla tal cual sin reempaquetar.
  const cookie = request.headers.cookie;
  if (cookie) {
    const match = cookie.match(/(?:^|;\s*)session=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const token = extraerToken(request);
  if (!token) return reply.unauthorized("Hace falta iniciar sesion");

  let payload: SessionPayload;
  try {
    payload = verifySession(token);
  } catch {
    return reply.unauthorized("Sesion invalida o vencida");
  }

  const account = await prisma.account.findUnique({ where: { id: Number(payload.sub) } });
  if (!account) return reply.unauthorized("La cuenta ya no existe");
  request.account = account;
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  await requireAuth(request, reply);
  if (reply.sent) return;
  if (request.account?.rol !== "ADMIN") return reply.forbidden("Solo administradores");
}

export function cuentaPublica(account: Account) {
  return {
    id: account.id,
    email: account.email,
    rol: account.rol,
    emailVerificado: account.emailVerificadoEn !== null,
    wallet: account.walletAddress,
    walletVinculadaEn: account.walletVinculadaEn,
    createdAt: account.createdAt,
  };
}
