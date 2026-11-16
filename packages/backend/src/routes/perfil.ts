import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";
import { hashCedula } from "../lib/identidad.js";
import { provinciaDesdeIndice } from "../indexer/enumMaps.js";

// Perfil off-chain de la entidad detras de la cuenta (plan de produccion, B5). El usuario lo
// llena ANTES de registrarse on-chain; el verificador lo revisa junto con los documentos y
// recien entonces aprueba la wallet en RegistroEntidades.

export const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads"));
const MAX_DOC_BYTES = 5 * 1024 * 1024;
const MAX_DOCS_POR_PERFIL = 10;
const MIME_PERMITIDOS: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

const perfilSchema = z.object({
  tipo: z.enum(["SEPARADOR", "INTERMEDIARIO", "TRANSFORMADOR", "COMPRADOR"]),
  razonSocial: z.string().trim().min(2).max(200),
  cedula: z.string().trim().min(3).max(40),
  representante: z.string().trim().max(200).optional().nullable(),
  telefono: z.string().trim().max(40).optional().nullable(),
  correoContacto: z.string().trim().email().max(255).optional().nullable().or(z.literal("")),
  direccion: z.string().trim().max(500).optional().nullable(),
  provinciaId: z.number().int().min(0).max(6),
  cantonId: z.number().int().min(1).max(99),
  subtipo: z.number().int().min(0).max(255).optional().nullable(),
  descripcion: z.string().trim().max(2000).optional().nullable(),
});

export function perfilPublico<T extends { cedula: string }>(perfil: T) {
  // La cedula en claro solo se devuelve al dueno y a los admins (ambos pasan por aca), pero
  // nunca se incluye en listados anonimos.
  return perfil;
}

export async function perfilRoutes(app: FastifyInstance) {
  await mkdir(UPLOADS_DIR, { recursive: true });

  app.get("/perfil", { preHandler: requireAuth }, async (request) => {
    const perfil = await prisma.entidadPerfil.findUnique({
      where: { accountId: request.account!.id },
      include: { documentos: { orderBy: { createdAt: "asc" } } },
    });
    return { perfil };
  });

  // Crea o actualiza el perfil propio. Si ya estaba APROBADO y cambian datos sensibles
  // (razon social, cedula, tipo) vuelve a PENDIENTE: el verificador tiene que volver a mirar.
  app.put("/perfil", { preHandler: requireAuth }, async (request, reply) => {
    const body = perfilSchema.safeParse(request.body);
    if (!body.success) return reply.badRequest(body.error.issues[0]?.message ?? "Datos invalidos");
    const d = body.data;
    const accountId = request.account!.id;

    const datos = {
      tipo: d.tipo,
      razonSocial: d.razonSocial,
      cedula: d.cedula,
      cedulaHash: hashCedula(d.cedula),
      representante: d.representante || null,
      telefono: d.telefono || null,
      correoContacto: d.correoContacto || null,
      direccion: d.direccion || null,
      provincia: provinciaDesdeIndice(d.provinciaId),
      cantonId: d.cantonId,
      subtipo: d.subtipo ?? null,
      descripcion: d.descripcion || null,
    };

    const existente = await prisma.entidadPerfil.findUnique({ where: { accountId } });
    const cambioSensible =
      existente &&
      (existente.tipo !== datos.tipo || existente.cedulaHash !== datos.cedulaHash || existente.razonSocial !== datos.razonSocial);

    const perfil = existente
      ? await prisma.entidadPerfil.update({
          where: { accountId },
          data: {
            ...datos,
            ...(cambioSensible && existente.estadoRevision === "APROBADO"
              ? { estadoRevision: "PENDIENTE", notasRevisor: null, revisadoEn: null, revisadoPorId: null }
              : {}),
          },
          include: { documentos: true },
        })
      : await prisma.entidadPerfil.create({ data: { accountId, ...datos }, include: { documentos: true } });

    return { perfil };
  });

  // ==== DOCUMENTOS ====

  app.post("/perfil/documentos", { preHandler: requireAuth }, async (request, reply) => {
    const perfil = await prisma.entidadPerfil.findUnique({
      where: { accountId: request.account!.id },
      include: { _count: { select: { documentos: true } } },
    });
    if (!perfil) return reply.badRequest("Primero guarda tu perfil");
    if (perfil._count.documentos >= MAX_DOCS_POR_PERFIL) {
      return reply.badRequest(`Maximo ${MAX_DOCS_POR_PERFIL} documentos por perfil`);
    }

    const archivo = await request.file({ limits: { fileSize: MAX_DOC_BYTES, files: 1 } });
    if (!archivo) return reply.badRequest("Falta el archivo");
    const extension = MIME_PERMITIDOS[archivo.mimetype];
    if (!extension) return reply.badRequest("Solo se aceptan PDF, JPG o PNG");

    const buffer = await archivo.toBuffer().catch(() => null);
    if (!buffer) return reply.badRequest(`El archivo supera ${MAX_DOC_BYTES / 1024 / 1024} MB`);

    const storageKey = path.posix.join(String(perfil.id), `${randomUUID()}${extension}`);
    const destino = path.join(UPLOADS_DIR, storageKey);
    await mkdir(path.dirname(destino), { recursive: true });
    await writeFile(destino, buffer);

    const documento = await prisma.perfilDocumento.create({
      data: {
        perfilId: perfil.id,
        nombre: archivo.filename.slice(0, 255),
        mimeType: archivo.mimetype,
        tamano: buffer.length,
        storageKey,
      },
    });

    // Subir un documento nuevo a un perfil rechazado lo devuelve a la cola de revision.
    if (perfil.estadoRevision === "RECHAZADO") {
      await prisma.entidadPerfil.update({ where: { id: perfil.id }, data: { estadoRevision: "PENDIENTE" } });
    }

    return { documento };
  });

  // Descarga: el dueno del perfil o un admin.
  app.get<{ Params: { id: string } }>("/perfil/documentos/:id", { preHandler: requireAuth }, async (request, reply) => {
    const id = Number(request.params.id);
    if (!Number.isInteger(id)) return reply.badRequest("Id invalido");

    const documento = await prisma.perfilDocumento.findUnique({ where: { id }, include: { perfil: true } });
    if (!documento) return reply.notFound("Documento no encontrado");
    const account = request.account!;
    if (documento.perfil.accountId !== account.id && account.rol !== "ADMIN") {
      return reply.forbidden("No tenes acceso a este documento");
    }

    const ruta = path.join(UPLOADS_DIR, documento.storageKey);
    try {
      await stat(ruta);
    } catch {
      return reply.notFound("El archivo ya no esta disponible");
    }
    return reply
      .header("Content-Type", documento.mimeType)
      .header("Content-Disposition", `inline; filename="${encodeURIComponent(documento.nombre)}"`)
      .send(createReadStream(ruta));
  });

  app.delete<{ Params: { id: string } }>("/perfil/documentos/:id", { preHandler: requireAuth }, async (request, reply) => {
    const id = Number(request.params.id);
    if (!Number.isInteger(id)) return reply.badRequest("Id invalido");

    const documento = await prisma.perfilDocumento.findUnique({ where: { id }, include: { perfil: true } });
    if (!documento) return reply.notFound("Documento no encontrado");
    if (documento.perfil.accountId !== request.account!.id) return reply.forbidden("No es tu documento");

    await prisma.perfilDocumento.delete({ where: { id } });
    await unlink(path.join(UPLOADS_DIR, documento.storageKey)).catch(() => undefined);
    return { ok: true };
  });
}
