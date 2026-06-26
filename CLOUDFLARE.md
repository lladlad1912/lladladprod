# Cloudflare in front of lladlad VPS

Put Cloudflare between users and your Docker VPS for CDN caching, DDoS protection, and managed edge SSL — without changing the same-origin React + `/api` design.

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
2. Change nameservers at GoDaddy to Cloudflare’s.
3. Create DNS records:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | VPS public IP | Proxied (orange cloud) |
| A | `www` | VPS public IP | Proxied (orange cloud) |

---

## 2. SSL/TLS mode (required)

Cloudflare dashboard → **SSL/TLS** → **Overview**

| Mode | Use with lladlad? |
|------|-------------------|
| **Full (strict)** | **Yes — recommended.** Edge HTTPS → your Nginx with Let’s Encrypt |
| Full | OK, less strict on origin certificate |
| Flexible | **No.** Cloudflare calls origin over HTTP; your Nginx redirects 80→443 and can loop |

Your VPS already terminates HTTPS with Let’s Encrypt (`docker/scripts/init-letsencrypt.sh`). Use **Full (strict)**.

Also enable:

- **SSL/TLS → Edge Certificates → Always Use HTTPS** — On
- **SSL/TLS → Edge Certificates → Automatic HTTPS Rewrites** — On

---

## 3. Cache rules (required)

Bypass cache for API traffic so POST/PUT/DELETE and authenticated admin calls are never cached.

Cloudflare dashboard → **Rules** → **Cache Rules** (or Page Rules on older plans):

| Rule | Match | Action |
|------|-------|--------|
| Bypass API | URI Path starts with `/api/` | Bypass cache |
| Cache uploads (optional) | URI Path starts with `/uploads/` | Cache, TTL 1 day+ |
| Cache static (optional) | File extension in `.js`, `.css`, `.png`, … | Cache |

Do **not** cache `/api/*`.

---

## 4. Nginx real client IP (included in repo)

When Cloudflare proxies traffic, Nginx sees Cloudflare edge IPs unless configured otherwise. That breaks:

- Access logs
- Rate limiting (`RateLimitingFilter`)
- Post view IP tracking (`PostViewService`)

This repo includes `docker/nginx/snippets/cloudflare-real-ip.conf`, included from `docker/nginx/nginx.conf`. It:

1. Trusts [Cloudflare’s published IP ranges](https://www.cloudflare.com/ips-v4)
2. Uses `CF-Connecting-IP` as the real client address
3. Makes `$remote_addr` correct for proxy headers sent to Spring Boot

After pulling this change, rebuild/reload Nginx:

```bash
cd lladladprod/docker
docker compose up -d --build nginx
docker compose exec nginx nginx -t
docker compose exec nginx nginx -s reload
```

Refresh Cloudflare IP ranges occasionally (they change rarely):

```bash
chmod +x scripts/update-cloudflare-ips.sh
./scripts/update-cloudflare-ips.sh
docker compose exec nginx nginx -s reload
```

---

## 5. Let’s Encrypt with proxied DNS (important)

With the **orange cloud on**, HTTP-01 certbot challenges may fail because Let’s Encrypt reaches Cloudflare, not your VPS directly.

Pick one approach:

### Option A — DNS-only during cert issue (simplest)

1. Set `@` and `www` to **DNS only** (gray cloud).
2. Run `./scripts/init-letsencrypt.sh`.
3. Turn proxy back **on** (orange cloud).
4. For renewals: briefly gray-cloud during renewal, or use Option B.

### Option B — DNS-01 with Cloudflare API (best long-term)

Use certbot’s Cloudflare DNS plugin so challenges go through DNS, not HTTP. Works with proxy always on. Requires a Cloudflare API token with **Zone:DNS:Edit**.

### Option C — Cloudflare Origin Certificate

1. Cloudflare → **SSL/TLS → Origin Server → Create certificate**
2. Install cert + key on Nginx instead of Let’s Encrypt for origin TLS
3. Only trusted between Cloudflare and your VPS; browsers still see Cloudflare’s edge cert

---

## 6. Optional hardening

### Restrict VPS firewall to Cloudflare only

Block direct access to your VPS IP (bypassing Cloudflare/WAF):

1. Allow inbound 80/443 only from [Cloudflare IP ranges](https://www.cloudflare.com/ips-v4)
2. Allow SSH from your IP
3. Deny other 80/443 traffic

### Upload size limit

Cloudflare free plan limits proxied upload bodies to **100 MB**. Normal blog images are fine; large file uploads need a higher plan or an unproxied subdomain.

### Bot Fight Mode

**Security → Bots → Bot Fight Mode** can challenge aggressive bots. If login or API feels flaky, tune or disable for `/api/*` via WAF skip rules.

---

## 7. Checklist

| Step | Done? |
|------|-------|
| Domain on Cloudflare, nameservers updated | |
| A records proxied to VPS IP | |
| SSL mode = **Full (strict)** | |
| Cache bypass for `/api/*` | |
| Nginx `cloudflare-real-ip.conf` active (rebuild nginx container) | |
| Let’s Encrypt strategy chosen (gray cloud / DNS-01 / origin cert) | |
| `SITE_URL` and `CORS_ALLOWED_ORIGINS` still use `https://www.yourdomain.com` | |
| `./scripts/deploy.sh` run after any URL change | |

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Redirect loop | SSL mode = Flexible | Switch to Full (strict) |
| Certbot / renewal fails | Orange cloud on during HTTP-01 | Gray cloud temporarily or DNS-01 |
| All users share one rate-limit bucket | Real IP snippet missing | Rebuild nginx; verify `cloudflare-real-ip.conf` |
| Stale admin or API data | API cached at edge | Bypass cache for `/api/*` |
| 502 after enabling CF | Origin unreachable or wrong IP | Check A record, VPS firewall, `docker compose ps` |
| Mixed content warnings | `SITE_URL` still `http://` | Update `.env`, rerun `./scripts/deploy.sh` |

---

## Related docs

- [VPS_DOCKER_DEPLOYMENT.md](./VPS_DOCKER_DEPLOYMENT.md) — base Docker + Nginx + Let’s Encrypt setup
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — how frontend, backend, and DB connect
