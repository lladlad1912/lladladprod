# Production deployment — Contabo VPS + Docker + Nginx

Deploy lladlad on a Contabo (or any Ubuntu) VPS using Docker Compose. Optional [Cloudflare](./CLOUDFLARE.md) sits in front for CDN and WAF.

For **staging** on the same server, see [ENVIRONMENTS.md](./ENVIRONMENTS.md).

```
Internet → Cloudflare (optional) → Nginx (80/443) → React static
                                                → /api, /uploads → Spring Boot
                                                → MySQL container
                                                → Let's Encrypt (certbot)
```

---

## 1. VPS setup (Contabo)

1. Ubuntu 22.04/24.04 VPS with ports **80** and **443** open (and **8080/8443** if running staging on the same box).
2. Install Docker:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# log out and back in
```

---

## 2. DNS (Cloudflare recommended)

Point your domain to the Contabo VPS public IP. If using Cloudflare, see [CLOUDFLARE.md](./CLOUDFLARE.md).

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | `@` | VPS IP | Proxied (recommended) |
| A | `www` | VPS IP | Proxied |

---

## 3. Deploy production

```bash
git clone https://github.com/lladlad1912/lladladprod.git
cd lladladprod/docker
cp .env.example .env
nano .env   # DOMAIN, passwords, SITE_URL, JWT_SECRET
chmod +x scripts/*.sh
./scripts/deploy.sh
```

### `docker/.env` essentials

```env
COMPOSE_PROJECT_NAME=lladlad-prod
SPRING_PROFILES_ACTIVE=prod
SITE_URL=http://yourdomain.com          # https after SSL
CORS_ALLOWED_ORIGINS=http://yourdomain.com,http://www.yourdomain.com
DOMAIN=yourdomain.com
JWT_SECRET=...
MYSQL_ROOT_PASSWORD=...
MYSQL_PASSWORD=...
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

Test: `http://yourdomain.com`

---

## 4. Enable HTTPS

When DNS points to the VPS:

```bash
./scripts/init-letsencrypt.sh .env
```

Update `.env`:

```env
SITE_URL=https://www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://www.yourdomain.com,https://yourdomain.com
```

Rebuild frontend with HTTPS URLs:

```bash
./scripts/deploy.sh
```

Enable Cloudflare **Full (strict)** after origin HTTPS works.

---

## 5. Default login

| User | Password |
|------|----------|
| `admin` | `Admin123!@` |

Change after first login.

---

## 6. Useful commands

```bash
cd lladladprod/docker

docker compose --env-file .env ps
docker compose --env-file .env logs -f backend
docker compose --env-file .env logs -f nginx
docker compose --env-file .env restart backend
docker compose --env-file .env down
docker compose --env-file .env up -d --build   # after git pull
```

---

## 7. What runs in Docker

| Container | Role |
|-----------|------|
| `nginx` | React build + reverse proxy |
| `backend` | Spring Boot JAR (`prod` profile) |
| `mysql` | MySQL 8 database |
| `certbot` | Let's Encrypt renewal |

Single domain serves site and API (same origin):

- `https://www.yourdomain.com` → React
- `https://www.yourdomain.com/api/...` → Spring Boot

`REACT_APP_API_URL` = `SITE_URL` at Docker build time.

---

## 8. Cloudflare

See **[CLOUDFLARE.md](./CLOUDFLARE.md)** — SSL mode, cache bypass for `/api/*`, real client IP snippet.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Nginx won't start | `docker compose --env-file .env logs nginx` |
| Backend crash on start | Check MySQL passwords in `.env` |
| Blank frontend API calls | Rebuild nginx after changing `SITE_URL` |
| Certbot fails | DNS must point to VPS; see Cloudflare gray-cloud workaround |
| 502 on /api | Wait for backend; `docker compose ps` |

---

## Related docs

- [ENVIRONMENTS.md](./ENVIRONMENTS.md) — dev / staging / prod
- [CLOUDFLARE.md](./CLOUDFLARE.md) — CDN and WAF
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system overview
