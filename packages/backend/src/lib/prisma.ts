import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../generated/prisma/client.js";

// Decimal.js (usado por el tipo Decimal de Prisma) sigue la misma regla de notacion
// cientifica que Number.prototype.toString(): a partir de 1e21 se muestra como "1e+21".
// Nuestros pesoGramos/tokensMinteados (uint256 con hasta 18 decimales) superan ese umbral
// facilmente (1000g = 1e21 tokens), asi que deshabilitamos la notacion cientifica
// globalmente para que toString()/toJSON() siempre devuelvan el numero completo.
Prisma.Decimal.set({ toExpPos: 9_000_000, toExpNeg: -9_000_000 });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
