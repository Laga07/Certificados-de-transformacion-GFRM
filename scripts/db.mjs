#!/usr/bin/env node
// Levanta/baja la instancia de PostgreSQL de ESTE proyecto, totalmente separada e
// independiente de cualquier otra base de datos en la maquina (proceso propio, carpeta de
// datos propia en .pgdata/, puerto propio 5433). No usa Docker: este entorno no lo tiene
// instalado, asi que en vez de docker-compose.yml (que queda documentado como alternativa
// para quien si tenga Docker) se usan directo los binarios nativos de PostgreSQL ya
// instalados en la maquina para correr un SEGUNDO cluster independiente del que use
// cualquier otro proyecto.
//
// Uso: node scripts/db.mjs up | down | status

import { execFileSync } from "node:child_process";
import path from "node:path";
import { existsSync } from "node:fs";

const PG_BIN = "C:\\Program Files\\PostgreSQL\\18\\bin";
const DATA_DIR = path.join(import.meta.dirname, "..", ".pgdata");
const LOG_FILE = path.join(DATA_DIR, "server.log");

function pgCtl(args) {
  return execFileSync(path.join(PG_BIN, "pg_ctl.exe"), args, { encoding: "utf-8" });
}

function main() {
  const cmd = process.argv[2];

  if (!existsSync(DATA_DIR)) {
    console.error(
      `No existe ${DATA_DIR} -- correr primero: "${PG_BIN}\\initdb.exe" -D "${DATA_DIR}" -U postgres --pwfile=<archivo-con-password>`,
    );
    process.exitCode = 1;
    return;
  }

  if (cmd === "up") {
    console.log(pgCtl(["-D", DATA_DIR, "-l", LOG_FILE, "start"]));
  } else if (cmd === "down") {
    console.log(pgCtl(["-D", DATA_DIR, "stop"]));
  } else if (cmd === "status") {
    try {
      console.log(pgCtl(["-D", DATA_DIR, "status"]));
    } catch (error) {
      console.log(error.stdout ?? "Servidor detenido");
    }
  } else {
    console.error("Uso: node scripts/db.mjs up | down | status");
    process.exitCode = 1;
  }
}

main();
