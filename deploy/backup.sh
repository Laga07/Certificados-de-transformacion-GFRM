#!/usr/bin/env bash
# Respaldo de la base de datos + documentos adjuntos. Lo corre el cron que instala
# setup-servidor.sh (03:15 todos los dias). Guarda 14 dias en el servidor y, si esta
# configurado rclone con un remoto llamado "r2" (Cloudflare R2, 10 GB gratis), sube una copia
# fuera del servidor: un respaldo que vive en la misma maquina no protege si la maquina muere.
#
# Restaurar (probarlo al menos una vez, ver docs/despliegue.md):
#   gunzip -c /var/backups/certificado/db-AAAAMMDD-HHMM.sql.gz | \
#     docker compose --env-file deploy/.env.prod -f docker-compose.prod.yml exec -T postgres \
#     psql -U postgres -d certificado_transformacion
set -euo pipefail
cd "$(dirname "$0")/.."

DESTINO=${BACKUP_DIR:-/var/backups/certificado}
RETENCION_DIAS=${BACKUP_RETENTION_DAYS:-14}
FECHA=$(date +%Y%m%d-%H%M)
COMPOSE=(docker compose --env-file deploy/.env.prod -f docker-compose.prod.yml)
DB_USER=$(grep -E '^POSTGRES_USER=' deploy/.env.prod | cut -d= -f2); DB_USER=${DB_USER:-postgres}
DB_NAME=$(grep -E '^POSTGRES_DB=' deploy/.env.prod | cut -d= -f2); DB_NAME=${DB_NAME:-certificado_transformacion}

mkdir -p "$DESTINO"

echo "[$(date -Is)] respaldo de la base"
"${COMPOSE[@]}" exec -T postgres pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --clean --if-exists \
  | gzip -9 > "$DESTINO/db-$FECHA.sql.gz"

echo "[$(date -Is)] respaldo de documentos adjuntos"
"${COMPOSE[@]}" exec -T api tar -C /data -czf - uploads > "$DESTINO/uploads-$FECHA.tar.gz"

# Validacion minima: un dump vacio o cortado es peor que no tener respaldo (da falsa calma).
if [[ $(gunzip -c "$DESTINO/db-$FECHA.sql.gz" | head -c 2000 | grep -c "PostgreSQL database dump") -eq 0 ]]; then
  echo "ERROR: el dump no parece valido" >&2
  exit 1
fi

find "$DESTINO" -name '*.gz' -mtime +"$RETENCION_DIAS" -delete

if command -v rclone >/dev/null && rclone listremotes | grep -q '^r2:'; then
  echo "[$(date -Is)] copia fuera del servidor (r2:certificado-backups)"
  rclone copy "$DESTINO" r2:certificado-backups --max-age 25h
fi

echo "[$(date -Is)] ok: $(du -h "$DESTINO/db-$FECHA.sql.gz" | cut -f1) db, $(du -h "$DESTINO/uploads-$FECHA.tar.gz" | cut -f1) documentos"
