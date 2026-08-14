# Environments — dev, staging, production

lladlad runs in three environments. Each has its own database strategy, Spring profile, and deployment method.

---

## Overview

| Environment | Spring profile | Database | Where it runs | Config |
|-------------|----------------|----------|---------------|--------|
| **Development** | `dev` | H2 in-memory | Your laptop (IntelliJ / terminal) | `application-dev.properties` |
| **Staging** | `staging` | MySQL 8 (Docker) | Contabo VPS (same server as prod OK) | `docker/.env.staging` |
| **Production** | `prod` | MySQL 8 (Docker) | Contabo VPS | `docker/.env` |

```
Development (local)          Staging (VPS)              Production (VPS)
─────────────────          ─────────────              ────────────────
React :3000                staging.yourdomain.com     www.yourdomain.com
Spring Boot :8080          Docker Compose             Docker Compose
H2 (no MySQL)              MySQL (staging volume)     MySQL (prod volume)
profile: dev               profile: staging           profile: prod
                           ports: 8080 / 8443         ports: 80 / 443
```

---

## Development (local)

**Purpose:** Feature work, debugging, no infrastructure setup.

| Item | Value |
|------|-------|
| Profile | `dev` |
| Database | H2 — recreated each restart with seed data |
| Backend | http://localhost:8080 |
| Frontend | http://localhost:3000 |
| MySQL required? | **No** |

**Run:**

```powershell
# Backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.profiles.active=dev"

# Frontend
cd frontend && npm install && npm start
```

**First-time setup:** [LOCAL_SETUP.md](./LOCAL_SETUP.md)  
**IDE extras:** IntelliJ (backend) + VS Code (frontend) — see [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md).

**Login:** `admin` / `Admin123!@`

---

## Staging (VPS + MySQL)

**Purpose:** Test deployments, integrations, and data migrations before production. Uses real MySQL like prod.

| Item | Value |
|------|-------|
| Profile | `staging` |
| Database | MySQL in Docker (`blogdb_staging`, separate volume) |
| Typical URL | https://staging.yourdomain.com |
| Host ports | **8080** (HTTP), **8443** (HTTPS) — avoids conflict with prod |
| Compose project | `lladlad-staging` |

**Setup on Contabo:**

```bash
cd lladladprod/docker
cp .env.staging.example .env.staging
nano .env.staging   # domain, passwords, JWT secret
chmod +x scripts/*.sh
./scripts/deploy-staging.sh
./scripts/init-letsencrypt.sh .env.staging
# Update SITE_URL to https:// in .env.staging, then:
./scripts/deploy-staging.sh
```

**Cloudflare for staging:** See **[STAGING.md](./STAGING.md)** for full setup (DNS, ports 8080/8443, Origin Rules, deploy workflow).

**Staging vs prod differences:**

| Setting | Staging | Production |
|---------|---------|------------|
| SQL logging | `show-sql=true` | `show-sql=false` |
| MySQL volume | `lladlad-staging_*` | `lladlad-prod_*` |
| JWT secret | Separate | Separate |
| Razorpay | Test keys | Live keys |

---

## Production (VPS + MySQL)

**Purpose:** Live site on Contabo with Cloudflare, Nginx, Docker, Let's Encrypt.

| Item | Value |
|------|-------|
| Profile | `prod` |
| Database | MySQL in Docker (`blogdb`, prod volume) |
| Typical URL | https://www.yourdomain.com |
| Host ports | **80**, **443** |
| Compose project | `lladlad-prod` |

**Setup:**

```bash
cd lladladprod/docker
cp .env.example .env
nano .env
./scripts/deploy.sh
./scripts/init-letsencrypt.sh .env
# Update SITE_URL to https://www.yourdomain.com, then:
./scripts/deploy.sh
```

Full guide: [DEPLOYMENT.md](./DEPLOYMENT.md) · Cloudflare: [CLOUDFLARE.md](./CLOUDFLARE.md)

---

## Spring profiles reference

| File | Profile | Activated by |
|------|---------|--------------|
| `application-dev.properties` | `dev` | `--spring.profiles.active=dev` or IntelliJ run config |
| `application-staging.properties` | `staging` | `SPRING_PROFILES_ACTIVE=staging` in Docker |
| `application-prod.properties` | `prod` | `SPRING_PROFILES_ACTIVE=prod` in Docker |

Both **staging** and **prod** read database and secrets from environment variables (`DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, etc.) set in Docker Compose.

---

## Git branches

| Branch | Environment | Deploy target |
|--------|-------------|---------------|
| **`dev`** | Local development | Your machine (IntelliJ, H2) |
| **`staging`** | Staging VPS | `docker/.env.staging` → `./scripts/deploy-staging.sh` |
| **`main`** | Production | `docker/.env` → `./scripts/deploy.sh` |

**Workflow:**

```
dev  →  merge to staging  →  test on staging.yourdomain.com  →  merge to main  →  production
```

All three branches start with the same code. Only merge **staging → main** after testing on the staging server.

**Empty staging database?** Normal on first deploy. Spring Boot `DataInitializer` seeds categories, users, and sample posts when the staging backend starts against an empty MySQL volume.

---

## Frontend environment variables

React env vars are **baked in at build time** (Docker nginx build or `npm run build`).

| Variable | Dev default | Staging / Prod |
|----------|-------------|----------------|
| `REACT_APP_API_URL` | `http://localhost:8080` | `SITE_URL` from docker `.env` |
| `REACT_APP_SITE_URL` | `http://localhost:3000` | `SITE_URL` from docker `.env` |

Changing `SITE_URL` in `.env` or `.env.staging` requires rebuilding the nginx container (`./scripts/deploy.sh` or `deploy-staging.sh`).

---

## Running staging and production on the same VPS

Both stacks can run simultaneously because they use:

- Different **Compose project names** (`COMPOSE_PROJECT_NAME`)
- Different **MySQL volumes** and credentials
- Different **host ports** (staging: 8080/8443, prod: 80/443)

```bash
# Production
docker compose --env-file .env ps

# Staging
docker compose --env-file .env.staging ps
```

---

## Related docs

- [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) — local IDE setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) — VPS Docker deployment
- [DATABASE.md](./DATABASE.md) — schema and MySQL details
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system diagram
