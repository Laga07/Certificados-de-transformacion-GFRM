// Vacia TODAS las tablas que llena el indexer (y su estado de avance), conservando las
// cuentas de usuario (`accounts`) y el historial de migraciones de Prisma. Se usa despues de
// un deploy completo de contratos (direcciones nuevas): la base de datos refleja UNA
// instancia de los contratos y mezclar dos deploys corrompe los ids de lote y emision.
//
// Uso (desde packages/backend, con el indexer y la API detenidos):
//   node scripts/reset-indexed.mjs --yes
//
// Despues: actualizar INDEXER_START_BLOCK en .env con el startBlock del deploy nuevo y volver
// a levantar el indexer -- rellena todo desde ese bloque.
import "dotenv/config";
import pg from "pg";

const TABLAS_INDEXADAS = [
  "raw_events",
  "indexer_state",
  "certificado_retiros",
  "pagos_retiros",
  "pagos_acreditados",
  "ventas_primarias",
  "emision_eslabones",
  "emision_aportes",
  "emisiones",
  "certificado_contratos",
  "traspasos",
  "lote_division_eventos",
  "lote_union_eventos",
  "entregas",
  "lotes",
  "compradores",
  "transformadores",
  "intermediarios",
  "separadores",
];

if (!process.argv.includes("--yes")) {
  console.error("Esto borra todos los datos indexados (no las cuentas). Confirma con --yes.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
  );
  const existentes = new Set(rows.map((r) => r.table_name));
  const aVaciar = TABLAS_INDEXADAS.filter((t) => existentes.has(t));
  const faltantes = TABLAS_INDEXADAS.filter((t) => !existentes.has(t));
  if (faltantes.length) console.warn(`Tablas no encontradas (se saltan): ${faltantes.join(", ")}`);

  // TRUNCATE ... CASCADE en una sola sentencia respeta las FKs entre ellas.
  await client.query(`TRUNCATE TABLE ${aVaciar.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE`);
  console.log(`Vaciadas ${aVaciar.length} tablas: ${aVaciar.join(", ")}`);

  const { rows: cuentas } = await client.query(`SELECT COUNT(*)::int AS n FROM accounts`);
  console.log(`Cuentas de usuario conservadas: ${cuentas[0].n}`);
} finally {
  await client.end();
}
