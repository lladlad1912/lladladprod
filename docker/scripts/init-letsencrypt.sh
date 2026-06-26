#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "Create docker/.env from docker/.env.example first."
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

if [[ -z "${CERTBOT_EMAIL:-}" || "${CERTBOT_EMAIL}" == "you@yourdomain.com" ]]; then
  echo "Set CERTBOT_EMAIL in docker/.env"
  exit 1
fi

echo "Ensure GoDaddy DNS A records for @ and www point to this VPS before continuing."
read -r -p "Press Enter when DNS is ready..."

docker compose up -d mysql backend nginx

echo "Requesting Let's Encrypt certificate..."
docker compose run --rm --entrypoint certbot certbot certonly --webroot \
  -w /var/www/certbot \
  -d "${DOMAIN}" \
  -d "www.${DOMAIN}" \
  --email "${CERTBOT_EMAIL}" \
  --agree-tos \
  --no-eff-email

echo "Enabling HTTPS nginx config..."
sed -e "s/YOUR_DOMAIN/${DOMAIN}/g" \
    -e "s/LETSENCRYPT_DOMAIN/${LETSENCRYPT_DOMAIN}/g" \
    nginx/templates/ssl.conf.template > nginx/conf.d/app.conf

docker compose exec nginx nginx -t
docker compose exec nginx nginx -s reload

echo ""
echo "SSL enabled. Update docker/.env if needed:"
echo "  SITE_URL=https://www.${DOMAIN}"
echo "  CORS_ALLOWED_ORIGINS=https://www.${DOMAIN},https://${DOMAIN}"
echo "Then run ./scripts/deploy.sh to rebuild the frontend with HTTPS URLs."
