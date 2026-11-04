// Permite serializar BigInt en JSON.stringify (usado por Fastify por defecto).
// Prisma.Decimal ya trae su propio toJSON(), asi que solo hace falta parchear BigInt nativo.
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function (this: bigint) {
  return this.toString();
};

export {};
