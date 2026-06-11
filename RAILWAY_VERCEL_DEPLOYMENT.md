# Deploy lladlad — Vercel + Railway + MySQL

Minimal-change production setup. Keeps your existing MySQL stack — no Postgres migration needed.

## Architecture

```
Users → Vercel (React, free)
          ↓
        Railway (Spring Boot)
          ↓
        MySQL (external free/cheap host)
        + Railway Volume (/data/uploads)
```

**Estimated cost:** ~$0–10/month (Vercel free + Railway hobby + free MySQL tier).

---

## Part 1 — MySQL database (pick one)

### Option A — TiDB Cloud Starter (recommended — $0, MySQL-compatible)

Railway's **+ New → Database** menu often only shows Postgres/Redis. For free MySQL with **zero code changes**:

1. [tidbcloud.com](https://tidbcloud.com) → create a **Starter** cluster (free: 5 GB + 50M requests/month, no credit card)
2. MySQL-compatible — copy JDBC host/user/password from **Connect**
3. Paste into Railway backend variables:

```env
DB_URL=jdbc:mysql://HOST:4000/blogdb?sslMode=DISABLED&serverTimezone=UTC
DB_USER=...
DB_PASSWORD=...
```

> TiDB often uses port **4000**, not 3306 — use what the dashboard shows.

### Option B — Railway MySQL via template (not in Database menu)

MySQL is **not** in the Database dropdown for most accounts. Deploy it as a **template** instead:

1. Open [railway.com/deploy/mysql](https://railway.com/deploy/mysql) → deploy into your project
2. Set `MYSQL_ROOT_PASSWORD` and `MYSQL_DATABASE=blogdb`
3. Add a **Volume** at `/var/lib/mysql`
4. Reference in backend:

```env
DB_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
```

**Cost:** Railway usage only (~$5–8/mo) — no PlanetScale.

### Option C — Railway Postgres (cheapest in-project, small code change)

If you want everything inside Railway and minimal monthly cost, use **Postgres** from **+ New → Database → PostgreSQL**. Requires switching `application-prod.properties` to PostgreSQL (one file + driver in `pom.xml`). Ask to enable this if you want the cheapest all-Railway setup.

### Option D — PlanetScale Vitess (not recommended — expensive)

Works with your app but costs significantly more than other options.

No code changes needed for Options A–C — Hibernate `ddl-auto=update` creates tables on first run.

---

## Part 2 — Railway (backend)

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → `lladladprod`
2. Railway builds via `railway.toml` / `nixpacks.toml` (Java 17 + Maven)
3. **Variables** → set from `deploy/env.railway.example`:

| Variable | Value |
|----------|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_URL` | your MySQL JDBC URL |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | long random string |
| `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` |
| `SITE_URL` | `https://your-app.vercel.app` |
| `FILE_UPLOAD_DIR` | `/data/uploads` |

4. **Volumes** → mount `/data/uploads` (keeps uploaded images across redeploys)
5. **Networking** → **Generate Domain** → copy URL

Verify: `https://YOUR-RAILWAY-URL/api/categories`

---

## Part 3 — Vercel (frontend)

1. [vercel.com](https://vercel.com) → import `lladladprod`
2. **Root Directory:** `frontend`
3. **Environment Variables:**

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | `https://YOUR-RAILWAY-URL` |
| `REACT_APP_SITE_URL` | `https://your-app.vercel.app` |
| `REACT_APP_GOOGLE_CLIENT_ID` | (optional) |

4. Deploy → then update Railway `CORS_ALLOWED_ORIGINS` with the real Vercel URL

---

## Part 4 — Custom domain (optional)

| DNS | Points to |
|-----|-----------|
| `www` | Vercel |
| `api` | Railway domain |

Update env vars on both platforms and redeploy.

---

## Default login (seeded on first run)

| Username | Password |
|----------|----------|
| `admin` | `admin123` |

Change after first login.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | `CORS_ALLOWED_ORIGINS` must match Vercel URL exactly (`https://`, no trailing slash) |
| DB connection failed | Check `DB_URL` format and that MySQL allows connections from Railway's IP |
| Images lost on redeploy | Add Railway Volume at `/data/uploads` |
| Env vars not applied (frontend) | Redeploy Vercel after changing `REACT_APP_*` |

---

## What changed in code (minimal)

- `application-prod.properties` — MySQL + env vars (same dialect as local)
- `frontend/src/config.js` — API URL from env (already done)
- `railway.toml`, `nixpacks.toml`, `frontend/vercel.json` — deploy config only
- **No** schema migration, **no** new database driver, **no** entity changes
