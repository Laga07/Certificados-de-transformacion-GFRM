#!/usr/bin/env bash
# Actualiza la app en el servidor: trae lo ultimo de main, reconstruye las imagenes, corre
# las migraciones pendientes y reinicia solo lo que cambio. Se usa a mano (ssh) o desde el
# workflow de GitHub Actions (.github/workflows/deploy.yml). Idempotente.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f deploy/.env.prod ]]; then
  echo "Falta deploy/.env.prod (copiar de deploy/.env.prod.example y completar)." >&2
  exit 1
fi

COMPOSE=(docker compose --env-file deploy/.env.prod -f docker-compose.prod.yml)

echo "==> git pull"
git fetch --quiet origin main
git reset --hard --quiet origin/main
echo "    en $(git log --oneline -1)"

echo "==> build"
"${COMPOSE[@]}" build --pull

echo "==> up (migrate corre antes que api/indexer)"
"${COMPOSE[@]}" up -d --remove-orphans

echo "==> esperando /api/health"
DOMINIO=$(grep -E '^APP_DOMAIN=' deploy/.env.prod | cut -d= -f2)
for i in $(seq 1 30); do
  if "${COMPOSE[@]}" exec -T api node -e "fetch('http://localhost:4001/api/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null; then
    echo "    API sana. Sitio: https://$DOMINIO"
    docker image prune -f >/dev/null
    exit 0
  fi
  sleep 5
done

echo "La API no respondio en 150 s. Ultimos logs:" >&2
"${COMPOSE[@]}" logs --tail=60 migrate api >&2
exit 1
