#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

ENV_FILE="${1:-.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Create docker/$ENV_FILE first (see .env.example or .env.staging.example)."
  exit 1
fi

set -a
# shellcheck disable=SC1091
source "$ENV_FILE"
set +a

if [[ -z "${CERTBOT_EMAIL:-}" || "${CERTBOT_EMAIL}" == "you@yourdomain.com" ]]; then
  echo "Set CERTBOT_EMAIL in docker/$ENV_FILE"
  exit 1
fi

echo "Ensure DNS for ${DOMAIN} points to this VPS before continuing."
read -r -p "Press Enter when DNS is ready..."

docker compose --env-file "$ENV_FILE" up -d mysql backend nginx

CERTBOT_DOMAIN_ARGS=(-d "${DOMAIN}")
if [[ "${CERTBOT_INCLUDE_WWW:-true}" != "false" ]]; then
  CERTBOT_DOMAIN_ARGS+=(-d "www.${DOMAIN}")
fi

echo "Requesting Let's Encrypt certificate for ${DOMAIN}..."
docker compose --env-file "$ENV_FILE" run --rm --entrypoint certbot certbot certonly --webroot \
  -w /var/www/certbot \
  "${CERTBOT_DOMAIN_ARGS[@]}" \
  --email "${CERTBOT_EMAIL}" \
  --agree-tos \
  --no-eff-email

echo "Enabling HTTPS nginx config..."
sed -e "s/YOUR_DOMAIN/${DOMAIN}/g" \
    -e "s/LETSENCRYPT_DOMAIN/${LETSENCRYPT_DOMAIN}/g" \
    nginx/templates/ssl.conf.template > nginx/conf.d/app.conf

docker compose --env-file "$ENV_FILE" exec nginx nginx -t
docker compose --env-file "$ENV_FILE" exec nginx nginx -s reload

echo ""
echo "SSL enabled. Update docker/$ENV_FILE if needed:"
echo "  SITE_URL=https://${DOMAIN}"
echo "  CORS_ALLOWED_ORIGINS=https://${DOMAIN}"
if [[ "${CERTBOT_INCLUDE_WWW:-true}" != "false" ]]; then
  echo "  (include https://www.${DOMAIN} in CORS for production)"
fi
echo "Then run ./scripts/deploy.sh or ./scripts/deploy-staging.sh to rebuild the frontend."
