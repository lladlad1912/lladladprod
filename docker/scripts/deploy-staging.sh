#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

ENV_FILE="${1:-.env.staging}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Create docker/$ENV_FILE from docker/.env.staging.example first."
  exit 1
fi

set -a
# shellcheck disable=SC1091
source "$ENV_FILE"
set +a

mkdir -p nginx/conf.d

if [[ -f nginx/conf.d/app.conf ]] && grep -q "ssl_certificate" nginx/conf.d/app.conf 2>/dev/null; then
  echo "Using existing SSL nginx config."
else
  echo "Generating HTTP bootstrap nginx config for ${DOMAIN}..."
  sed -e "s/YOUR_DOMAIN/${DOMAIN}/g" nginx/templates/bootstrap.conf.template > nginx/conf.d/app.conf
fi

echo "Building and starting STAGING containers (project: ${COMPOSE_PROJECT_NAME:-lladlad-staging})..."
docker compose --env-file "$ENV_FILE" up -d --build

echo ""
echo "Done. Staging test URL:"
echo "  http://${DOMAIN}:${NGINX_HTTP_PORT:-8080}/"
