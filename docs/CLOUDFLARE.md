# Cloudflare in front of lladlad VPS

Put Cloudflare between users and your Contabo Docker VPS for CDN caching, DDoS protection, and managed edge SSL — without changing the same-origin React + `/api` design.

```
Browser → Cloudflare (CDN / WAF / edge SSL) → VPS Nginx → React + Spring Boot → MySQL
```

---

## What stays the same

| Item | Why |
|------|-----|
| `SITE_URL` / `REACT_APP_API_URL` | Still your public domain (`https://www.yourdomain.com`) |
| `CORS_ALLOWED_ORIGINS` | Same public origins |
| JWT auth | Bearer tokens in `Authorization` header — no cookie issues |
| Docker Compose layout | MySQL stays on the internal network |
| Spring Boot / React code | No changes required for a basic Cloudflare setup |

---

## 1. DNS setup

1. Add your domain to Cloudflare.
2. Update nameservers at your registrar (GoDaddy, etc.) to Cloudflare's.
3. Create DNS records:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | Contabo VPS IP | Proxied (orange cloud) |
| A | `www` | Contabo VPS IP | Proxied |
| A | `staging` | Contabo VPS IP | Proxied (if using staging) |

---

## 2. SSL/TLS mode (required)

Cloudflare dashboard → **SSL/TLS** → **Overview**

| Mode | Use with lladlad? |
|------|-------------------|
| **Full (strict)** | **Yes — recommended.** Edge HTTPS → your Nginx with Let's Encrypt |
| Full | OK, less strict on origin certificate |
| Flexible | **No.** Cloudflare calls origin over HTTP; your Nginx redirects 80→443 and can loop |

Use **Full (strict)** with Let's Encrypt on Nginx (`docker/scripts/init-letsencrypt.sh`).

Also enable:

- **SSL/TLS → Edge Certificates → Always Use HTTPS** — On
- **SSL/TLS → Edge Certificates → Automatic HTTPS Rewrites** — On

---

## 3. Cache rules (required)

Bypass cache for API traffic so POST/PUT/DELETE and authenticated admin calls are never cached.

Cloudflare dashboard → **Rules** → **Cache Rules**:

| Rule | Match | Action |
|------|-------|--------|
| Bypass API | URI Path starts with `/api/` | Bypass cache |
| Cache uploads (optional) | URI Path starts with `/uploads/` | Cache, TTL 1 day+ |
| Cache static (optional) | File extension in `.js`, `.css`, `.png`, … | Cache |

Do **not** cache `/api/*`.

---

## 4. Nginx real client IP (included in repo)

When Cloudflare proxies traffic, Nginx sees Cloudflare edge IPs unless configured otherwise. That breaks rate limiting and post view IP tracking.

This repo includes `docker/nginx/snippets/cloudflare-real-ip.conf`:

```bash
cd lladladprod/docker
docker compose --env-file .env exec nginx nginx -t
docker compose --env-file .env exec nginx nginx -s reload
```

Refresh Cloudflare IP ranges occasionally:

```bash
./scripts/update-cloudflare-ips.sh
docker compose --env-file .env exec nginx nginx -s reload
```

---

## 5. Let's Encrypt with proxied DNS

With the **orange cloud on**, HTTP-01 certbot challenges may fail.

**Options:**

1. **Gray cloud temporarily** during cert issue and renewal
2. **DNS-01** with Cloudflare API token
3. **Cloudflare Origin Certificate** on Nginx

---

## 6. Staging on non-standard ports

Production uses ports **80/443**. Staging uses **8080/8443** on the same VPS. For `staging.yourdomain.com` through Cloudflare, configure an **Origin Rule** or connect staging via gray-cloud DNS during setup. See [ENVIRONMENTS.md](./ENVIRONMENTS.md).

---

## 7. Checklist

| Step | Done? |
|------|-------|
| Domain on Cloudflare | |
| A records proxied to Contabo IP | |
| SSL mode = **Full (strict)** | |
| Cache bypass for `/api/*` | |
| Nginx real-IP snippet active | |
| `SITE_URL` uses `https://` | |
| `./scripts/deploy.sh` run after URL changes | |

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Redirect loop | SSL mode = Flexible | Switch to Full (strict) |
| Certbot fails | Orange cloud on | Gray cloud or DNS-01 |
| Stale API data | API cached | Bypass cache for `/api/*` |
| 502 | Origin down | `docker compose ps` on VPS |

---

## Related docs

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Contabo Docker setup
- [ENVIRONMENTS.md](./ENVIRONMENTS.md) — staging vs production
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system overview
