#!/usr/bin/env bash
# Build and deploy lladlad to VPS from your local machine or CI
# Usage: ./deploy/deploy.sh user@your-vps-ip
set -euo pipefail

VPS_HOST="${1:-}"
if [[ -z "$VPS_HOST" ]]; then
  echo "Usage: ./deploy/deploy.sh user@your-vps-ip"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Building backend..."
if [[ -x ./mvnw ]]; then
  ./mvnw -q -DskipTests package
else
  ./mvnw.cmd -q -DskipTests package
fi
JAR="$(ls target/blog-application-*.jar | head -1)"

echo "==> Building frontend..."
cd frontend
if [[ -f .env.production ]]; then
  npm run build
else
  echo "Warning: frontend/.env.production missing — using .env.production.example values"
  cp -n .env.production.example .env.production 2>/dev/null || true
  npm run build
fi
cd "$ROOT_DIR"

echo "==> Uploading to VPS..."
ssh "$VPS_HOST" 'mkdir -p /tmp/lladlad-frontend'
scp "$JAR" "$VPS_HOST:/tmp/blog-application.jar"
scp -r frontend/build/. "$VPS_HOST:/tmp/lladlad-frontend/"

ssh "$VPS_HOST" 'bash -s' <<'REMOTE'
set -euo pipefail
sudo mkdir -p /opt/lladlad /var/www/lladlad
sudo mv /tmp/blog-application.jar /opt/lladlad/blog-application.jar
sudo chown lladlad:lladlad /opt/lladlad/blog-application.jar
sudo rsync -a --delete /tmp/lladlad-frontend/ /var/www/lladlad/
sudo systemctl restart lladlad-backend
REMOTE

echo "==> Deploy complete."
