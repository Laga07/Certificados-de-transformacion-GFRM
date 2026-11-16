import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { cuentaPublica, requireAdmin } from "../lib/auth.js";
import { paginatedResponse, paginationSchema, toSkipTake } from "../lib/pagination.js";

// Panel de administracion de la app (rol ADMIN de la cuenta, no VERIFIER_ROLE on-chain):
// revisar perfiles con sus documentos, aprobarlos o rechazarlos, y administrar cuentas. La
// aprobacion on-chain (verificarIntermediario / verificarTransformador) sigue siendo una
// transaccion que firma la wallet con VERIFIER_ROLE desde el frontend; esto es el paso previo
// humano que hoy faltaba (plan de produccion, punto 3 del diagnostico).

const listaPerfilesSchema = paginationSchema.extend({
  estado: z.enum(["PENDIENTE", "APROBADO", "RECHAZADO"]).optional(),
  tipo: z.enum(["SEPARADOR", "INTERMEDIARIO", "TRANSFORMADOR", "COMPRADOR"]).optional(),
});

// Estado on-chain de la wallet vinculada, para que el admin vea en una sola pantalla si la
// entidad ya se registro en el contrato y si ya esta verificada.
async function estadoOnChain(wallet: string | null, tipo: string) {
  if (!wallet) return { registrado: false, verificado: null as boolean | null, activo: null as boolean | null };
  if (tipo === "INTERMEDIARIO") {
    const r = await prisma.intermediario.findUnique({ where: { wallet } });
    return { registrado: Boolean(r), verificado: r?.verificado ?? null, activo: r?.activo ?? null };
  }
  if (tipo === "TRANSFORMADOR") {
    const r = await prisma.transformador.findUnique({ where: { wallet } });
    return { registrado: Boolean(r), verificado: r?.verificado ?? null, activo: r?.activo ?? null };
  }
  if (tipo === "SEPARADOR") {
    const r = await prisma.separador.findUnique({ where: { wallet } });
    return { registrado: Boolean(r), verificado: null, activo: r?.activo ?? null };
  }
  const r = await prisma.comprador.findUnique({ where: { wallet } });
  return { registrado: Boolean(r), verificado: null, activo: r?.activo ?? null };
}

export async function adminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAdmin);

  app.get("/admin/perfiles", async (request, reply) => {
    const query = listaPerfilesSchema.safeParse(request.query);
    if (!query.success) return reply.badRequest(query.error.message);

    const where = {
      ...(query.data.estado ? { estadoRevision: query.data.estado } : {}),
      ...(query.data.tipo ? { tipo: query.data.tipo } : {}),
    };

    const [perfiles, total] = await Promise.all([
      prisma.entidadPerfil.findMany({
        where,
        ...toSkipTake(query.data),
        orderBy: [{ estadoRevision: "asc" }, { createdAt: "asc" }],
        include: {
          account: { select: { id: true, email: true, walletAddress: true, emailVerificadoEn: true } },
          _count: { select: { documentos: true } },
        },
      }),
      prisma.entidadPerfil.count({ where }),
    ]);

    const data = await Promise.all(
      perfiles.map(async (p) => ({
        ...p,
        onChain: await estadoOnChain(p.account.walletAddress, p.tipo),
      })),
    );
    return paginatedResponse(data, total, query.data);
  });

  app.get<{ Params: { id: string } }>("/admin/perfiles/:id", async (request, reply) => {
    const id = Number(request.params.id);
    if (!Number.isInteger(id)) return reply.badRequest("Id invalido");

    const perfil = await prisma.entidadPerfil.findUnique({
      where: { id },
      include: {
        account: { select: { id: true, email: true, walletAddress: true, emailVerificadoEn: true, createdAt: true } },
        documentos: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!perfil) return reply.notFound("Perfil no encontrado");
    return { ...perfil, onChain: await estadoOnChain(perfil.account.walletAddress, perfil.tipo) };
  });

  app.post<{ Params: { id: string } }>("/admin/perfiles/:id/revision", async (request, reply) => {
    const id = Number(request.params.id);
    if (!Number.isInteger(id)) return reply.badRequest("Id invalido");
    const body = z
      .object({ estado: z.enum(["PENDIENTE", "APROBADO", "RECHAZADO"]), notas: z.string().trim().max(2000).optional() })
      .safeParse(request.body);
    if (!body.success) return reply.badRequest("Datos invalidos");

    const existente = await prisma.entidadPerfil.findUnique({ where: { id } });
    if (!existente) return reply.notFound("Perfil no encontrado");

    const perfil = await prisma.entidadPerfil.update({
      where: { id },
      data: {
        estadoRevision: body.data.estado,
        notasRevisor: body.data.notas ?? null,
        revisadoPorId: request.account!.id,
        revisadoEn: new Date(),
      },
    });
    return { perfil };
  });

  // ==== CUENTAS ====

  app.get("/admin/cuentas", async (request, reply) => {
    const query = paginationSchema.safeParse(request.query);
    if (!query.success) return reply.badRequest(query.error.message);
    const [cuentas, total] = await Promise.all([
      prisma.account.findMany({ ...toSkipTake(query.data), orderBy: { createdAt: "desc" }, include: { perfil: { select: { tipo: true, estadoRevision: true } } } }),
      prisma.account.count(),
    ]);
    return paginatedResponse(
      cuentas.map((c) => ({ ...cuentaPublica(c), perfil: c.perfil })),
      total,
      query.data,
    );
  });

  app.post<{ Params: { id: string } }>("/admin/cuentas/:id/rol", async (request, reply) => {
    const id = Number(request.params.id);
    if (!Number.isInteger(id)) return reply.badRequest("Id invalido");
    const body = z.object({ rol: z.enum(["USER", "ADMIN"]) }).safeParse(request.body);
    if (!body.success) return reply.badRequest("Rol invalido");
    if (id === request.account!.id && body.data.rol === "USER") {
      return reply.badRequest("No podes quitarte el rol de admin a vos mismo");
    }
    const cuenta = await prisma.account.update({ where: { id }, data: { rol: body.data.rol } });
    return { cuenta: cuentaPublica(cuenta) };
  });
}
