# Staging environment — setup guide

Use staging to test deployments on **real MySQL** before touching production. Staging runs on the same Contabo VPS as prod using a **separate Docker stack**, database, and subdomain.

```
Browser → Cloudflare → staging.yourdomain.com → Nginx (:8443) → Spring Boot (staging) → MySQL (staging)
```

Production continues on `www.yourdomain.com` at ports **80/443** independently.

---

## What staging gives you

| Benefit | Detail |
|---------|--------|
| Real MySQL | Same as production — catches migration and JPA issues H2 won't |
| Isolated data | Separate volume `lladlad-staging_*` — won't affect live users |
| Safe deploy test | Pull branch → deploy staging → verify → deploy prod |
| Separate secrets | Own JWT secret, DB passwords, Razorpay test keys |

---

## Architecture on one VPS

| | Staging | Production |
|---|---------|------------|
| **URL** | `https://staging.yourdomain.com` | `https://www.yourdomain.com` |
| **Spring profile** | `staging` | `prod` |
| **MySQL database** | `blogdb_staging` | `blogdb` |
| **Compose project** | `lladlad-staging` | `lladlad-prod` |
| **HTTP port** | **8080** | **80** |
| **HTTPS port** | **8443** | **443** |
| **Config file** | `docker/.env.staging` | `docker/.env` |
| **SQL logging** | On (`show-sql=true`) | Off |

Both stacks can run at the same time on one Contabo server.

---

## Prerequisites

- Contabo VPS with Docker installed (same server as production is fine)
- Production already deployed, or at least Docker working on the VPS
- Domain on **Cloudflare** (recommended)
- Git repo cloned on the VPS: `lladladprod`

---

## Step 1 — DNS (Cloudflare)

Add a record for the staging subdomain:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `staging` | Contabo VPS IP | Proxied (orange cloud) |

Example: `staging.yourdomain.com` → your VPS IP.

---

## Step 2 — Create staging env file

On the VPS:

```bash
cd ~/lladladprod/docker
cp .env.staging.example .env.staging
nano .env.staging
```

### Required values

```env
COMPOSE_PROJECT_NAME=lladlad-staging
SPRING_PROFILES_ACTIVE=staging

SITE_URL=http://staging.yourdomain.com          # https after SSL step
CORS_ALLOWED_ORIGINS=http://staging.yourdomain.com

DOMAIN=staging.yourdomain.com
LETSENCRYPT_DOMAIN=staging.yourdomain.com
CERTBOT_EMAIL=you@yourdomain.com
CERTBOT_INCLUDE_WWW=false

MYSQL_ROOT_PASSWORD=<strong-staging-root-password>
MYSQL_DATABASE=blogdb_staging
MYSQL_USER=lladlad_staging
MYSQL_PASSWORD=<strong-staging-db-password>

JWT_SECRET=<different-from-production-256-bit-secret>
JWT_EXPIRATION=86400000

NGINX_HTTP_PORT=8080
NGINX_HTTPS_PORT=8443
```

**Important:** Use **different passwords and JWT secret** from production.

Optional — Razorpay **test** keys for payment testing:

```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

---

## Step 3 — First deploy (HTTP)

```bash
chmod +x scripts/*.sh
./scripts/deploy-staging.sh
```

This will:

1. Build backend with `staging` profile
2. Start MySQL (creates `blogdb_staging` on first run)
3. Build React frontend with staging `SITE_URL`
4. Start Nginx on ports **8080** and **8443**

**Test (before SSL):**

```bash
curl -I http://staging.yourdomain.com:8080/api/categories
```

Or open in browser: `http://YOUR_VPS_IP:8080/api/categories`

If using Cloudflare proxy on port 8080, you may need a **Cloudflare Origin Rule** to route `staging.yourdomain.com` to port 8080, or temporarily set the record to **DNS only** (gray cloud) for initial testing.

---

## Step 4 — Enable HTTPS (Let's Encrypt)

When DNS points to the VPS:

```bash
./scripts/init-letsencrypt.sh .env.staging
```

Then update `.env.staging`:

```env
SITE_URL=https://staging.yourdomain.com
CORS_ALLOWED_ORIGINS=https://staging.yourdomain.com
```

Rebuild so the frontend uses HTTPS URLs:

```bash
./scripts/deploy-staging.sh
```

---

## Step 5 — Cloudflare for staging (port 8443)

Production uses standard ports 80/443. Staging uses **8443** for HTTPS so both stacks coexist.

### Option A — Cloudflare Origin Rule (recommended)

1. Cloudflare → **Rules** → **Origin Rules**
2. Create rule for hostname `staging.yourdomain.com`
3. Set **Destination port** → **8443**
4. SSL mode: **Full (strict)**

### Option B — Gray cloud during setup

Set `staging` A record to **DNS only** while testing with `https://staging.yourdomain.com:8443` directly.

See [CLOUDFLARE.md](./CLOUDFLARE.md) for cache bypass on `/api/*` (same rules as production).

---

## Step 6 — Verify staging works

| Check | URL / command |
|-------|----------------|
| Categories API | `https://staging.yourdomain.com/api/categories` |
| Homepage | `https://staging.yourdomain.com/` |
| Admin login | `admin` / `Admin123!@` (seed data on first start) |
| Containers running | `docker compose --env-file .env.staging ps` |
| Backend logs | `docker compose --env-file .env.staging logs -f backend` |
| MySQL connected | No crash loop in backend logs |

---

## Day-to-day commands

All commands from `docker/` directory:

```bash
cd ~/lladladprod/docker

# Deploy / rebuild after git pull
git pull
./scripts/deploy-staging.sh

# Status
docker compose --env-file .env.staging ps

# Logs
docker compose --env-file .env.staging logs -f backend
docker compose --env-file .env.staging logs -f nginx

# Restart backend only
docker compose --env-file .env.staging restart backend

# Stop staging (production unaffected)
docker compose --env-file .env.staging down

# Stop staging AND delete volumes (fresh DB — destructive)
docker compose --env-file .env.staging down -v
```

---

## Deploy workflow (recommended)

```
1. Develop locally     → dev profile (H2)
2. Push to GitHub
3. SSH to VPS          → git pull
4. Deploy staging      → ./scripts/deploy-staging.sh
5. Test on staging URL → login, posts, uploads, payments
6. Deploy production   → ./scripts/deploy.sh
```

Never skip staging when changing database schema, Docker config, or env vars.

---

## Staging vs production checklist

Before promoting to production, confirm on staging:

- [ ] Homepage loads with posts and categories
- [ ] Login / register works
- [ ] Admin can create/edit posts
- [ ] Image upload works
- [ ] Comments and likes work
- [ ] No errors in `docker compose logs backend`
- [ ] HTTPS works (no mixed content in browser console)
- [ ] Cloudflare cache bypass on `/api/*` is configured

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 8080/8443 already in use | Change `NGINX_HTTP_PORT` / `NGINX_HTTPS_PORT` in `.env.staging` |
| 502 on /api | Wait for MySQL healthcheck; `docker compose --env-file .env.staging logs backend` |
| Blank frontend, API works | Rebuild nginx: `./scripts/deploy-staging.sh` after fixing `SITE_URL` |
| Certbot fails | Gray-cloud DNS temporarily, or use DNS-01 challenge |
| Cloudflare 522/525 | Origin rule for port 8443; SSL mode Full (strict) |
| Staging shows prod data | Wrong env file — ensure `--env-file .env.staging` |
| Can't reach :8080 through Cloudflare | Add Origin Rule or test with VPS IP:8080 directly |

---

## File reference

| File | Purpose |
|------|---------|
| `docker/.env.staging.example` | Template — copy to `.env.staging` |
| `docker/scripts/deploy-staging.sh` | Build and start staging stack |
| `docker/scripts/init-letsencrypt.sh .env.staging` | SSL for staging domain |
| `src/main/resources/application-staging.properties` | Spring staging profile (MySQL, SQL logging) |

---

## Related docs

- [ENVIRONMENTS.md](./ENVIRONMENTS.md) — all three environments compared
- [DEPLOYMENT.md](./DEPLOYMENT.md) — production on Contabo
- [CLOUDFLARE.md](./CLOUDFLARE.md) — CDN, SSL, cache rules
- [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) — local dev with H2
