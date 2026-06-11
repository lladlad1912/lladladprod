#!/usr/bin/env bash
# One-time VPS setup for Ubuntu 22.04/24.04 (run as root or with sudo)
set -euo pipefail

echo "==> Installing packages..."
apt-get update
apt-get install -y openjdk-17-jre-headless nginx mysql-server certbot python3-certbot-nginx

echo "==> Creating lladlad system user and directories..."
id -u lladlad &>/dev/null || useradd --system --home /opt/lladlad --shell /usr/sbin/nologin lladlad
mkdir -p /opt/lladlad /var/lib/lladlad/uploads /var/www/lladlad /etc/lladlad
chown -R lladlad:lladlad /opt/lladlad /var/lib/lladlad

echo "==> MySQL: create database and user (edit password!)"
mysql -e "CREATE DATABASE IF NOT EXISTS blogdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'lladlad'@'localhost' IDENTIFIED BY 'CHANGE_ME_DB_PASSWORD';"
mysql -e "GRANT ALL PRIVILEGES ON blogdb.* TO 'lladlad'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

echo "==> Copy deploy/env.backend.example to /etc/lladlad/backend.env and edit secrets"
echo "==> Copy deploy/systemd/lladlad-backend.service to /etc/systemd/system/"
echo "==> Copy deploy/nginx/lladlad.conf to /etc/nginx/sites-available/lladlad"
echo "==> Then: systemctl daemon-reload && systemctl enable --now lladlad-backend nginx"
echo "==> SSL: certbot --nginx -d api.yourdomain.com -d www.yourdomain.com -d yourdomain.com"
echo "Done."
