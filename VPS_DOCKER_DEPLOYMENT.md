# VPS Docker Deployment — lladlad

One VPS runs everything in Docker:

```
Internet → Nginx (443/80) → React static files
                          → /api, /uploads → Spring Boot
                          → MySQL container
                          → Let's Encrypt (certbot)
```

**Cost:** ~$5–6/month (Hetzner CX22, DigitalOcean, etc.) + GoDaddy domain.

---

## 1. VPS setup

1. Ubuntu 22.04/24.04 VPS with ports **80** and **443** open.
2. Install Docker:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# log out and back in
```

---

## 2. GoDaddy DNS

| Type | Name | Value |
|------|------|--------|
| A | `@` | Your VPS public IP |
| A | `www` | Your VPS public IP |

Wait a few minutes for DNS to propagate.

---

## 3. Deploy lladlad

```bash
git clone https://github.com/lladlad1912/lladladprod.git
cd lladladprod/docker
cp .env.example .env
nano .env   # set DOMAIN, emails, passwords, SITE_URL
chmod +x scripts/*.sh
./scripts/deploy.sh
```

### `docker/.env` essentials

```env
DOMAIN=yourdomain.com
LETSENCRYPT_DOMAIN=yourdomain.com
CERTBOT_EMAIL=you@yourdomain.com
SITE_URL=http://yourdomain.com          # use http first; https after SSL
CORS_ALLOWED_ORIGINS=http://yourdomain.com,http://www.yourdomain.com
MYSQL_ROOT_PASSWORD=...
MYSQL_PASSWORD=...
JWT_SECRET=...
```

Test: `http://yourdomain.com` (or VPS IP if DNS not ready).

---

## 4. Enable HTTPS

When DNS points to the VPS:

```bash
./scripts/init-letsencrypt.sh
```

Then update `.env`:

```env
SITE_URL=https://www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://www.yourdomain.com,https://yourdomain.com
```

Rebuild frontend with HTTPS URLs:

```bash
./scripts/deploy.sh
```

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

docker compose ps
docker compose logs -f backend
docker compose logs -f nginx
docker compose restart backend
docker compose down          # stop
docker compose up -d --build   # rebuild after git pull
```

---

## 7. Adding another project (same VPS)

1. Add a new service to `docker-compose.yml` (or a separate compose file with `docker compose -f ...`).
2. Copy `nginx/templates/future-project.conf.template` → customize `server_name` + upstream.
3. Write generated config to `nginx/conf.d/another-app.conf`.
4. Extend certbot with `-d app2.yourdomain.com` (re-run certbot or expand cert).
5. `docker compose exec nginx nginx -s reload`.

No new server — one Nginx, one certbot, many containers.

---

## 8. Architecture vs Netlify/Railway

| Piece | Where |
|-------|--------|
| React frontend | Nginx container (built into image) |
| Spring Boot | `backend` container |
| MySQL | `mysql` container |
| HTTPS | certbot + nginx |
| Uploads | Docker volume `uploads_data` |

Single domain serves both site and API:

- `https://www.yourdomain.com` → React
- `https://www.yourdomain.com/api/...` → Spring Boot

`REACT_APP_API_URL` = `SITE_URL` (same origin — simple CORS).

---

## 9. Cloudflare (optional)

To put Cloudflare in front of this VPS (CDN, DDoS protection, edge SSL), see **[CLOUDFLARE.md](./CLOUDFLARE.md)**.

Key points:

- Use SSL mode **Full (strict)**
- Bypass cache for `/api/*`
- Nginx real-IP snippet is already in `docker/nginx/snippets/cloudflare-real-ip.conf`
- Plan for Let’s Encrypt renewal when the orange cloud is on

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Nginx won't start | `docker compose logs nginx` — check `nginx/conf.d/app.conf` exists |
| Backend crash on start | `docker compose logs backend` — check MySQL passwords in `.env` |
| Blank frontend API calls | Rebuild nginx after changing `SITE_URL` |
| Certbot fails | DNS must point to VPS; port 80 open; bootstrap config serving `/.well-known/acme-challenge/` |
| 502 on /api | Wait for backend startup; `docker compose ps` |
