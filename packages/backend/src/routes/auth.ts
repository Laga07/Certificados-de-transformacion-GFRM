import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
});

function signToken(accountId: number, email: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET no esta definido en el entorno");
  }
  return jwt.sign({ sub: accountId, email }, secret, { expiresIn: "30d" });
}

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    const body = credentialsSchema.safeParse(request.body);
    if (!body.success) return reply.badRequest(body.error.message);
    const { email, password } = body.data;

    const existente = await prisma.account.findUnique({ where: { email } });
    if (existente) return reply.conflict("Ese correo ya esta registrado");

    const passwordHash = await bcrypt.hash(password, 10);
    const account = await prisma.account.create({ data: { email, passwordHash } });

    return { token: signToken(account.id, account.email), email: account.email };
  });

  app.post("/auth/login", async (request, reply) => {
    const body = credentialsSchema.safeParse(request.body);
    if (!body.success) return reply.badRequest(body.error.message);
    const { email, password } = body.data;

    const account = await prisma.account.findUnique({ where: { email } });
    if (!account) return reply.unauthorized("Correo o contrasena incorrectos");

    const valido = await bcrypt.compare(password, account.passwordHash);
    if (!valido) return reply.unauthorized("Correo o contrasena incorrectos");

    return { token: signToken(account.id, account.email), email: account.email };
  });
}
