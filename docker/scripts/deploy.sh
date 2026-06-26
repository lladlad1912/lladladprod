#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
  echo "Create docker/.env from docker/.env.example first."
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

mkdir -p nginx/conf.d

if [[ -f nginx/conf.d/app.conf ]] && grep -q "ssl_certificate" nginx/conf.d/app.conf 2>/dev/null; then
  echo "Using existing SSL nginx config."
else
  echo "Generating HTTP bootstrap nginx config for ${DOMAIN}..."
  sed -e "s/YOUR_DOMAIN/${DOMAIN}/g" nginx/templates/bootstrap.conf.template > nginx/conf.d/app.conf
fi

echo "Building and starting containers..."
docker compose up -d --build

echo ""
echo "Done. Test: http://${DOMAIN}/ (or http://YOUR_VPS_IP if DNS not ready yet)"
echo "When DNS points to this server, run: ./scripts/init-letsencrypt.sh"
