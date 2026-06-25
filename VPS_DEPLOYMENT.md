# VPS Deployment Guide (lladlad)

> **Note:** The current recommended deployment is **Vercel + Railway + MySQL**.  
> See [RAILWAY_VERCEL_DEPLOYMENT.md](./RAILWAY_VERCEL_DEPLOYMENT.md).  
> This VPS guide remains available as a lower-cost self-hosted alternative.

Low-cost production setup for ~25k users/month.

## Architecture

```
Users
  │
  ├─ www.yourdomain.com  →  Cloudflare Pages (free CDN)  OR  Nginx on VPS
  │
  └─ api.yourdomain.com  →  Nginx → Spring Boot (8080)
                                    → MySQL
                                    → /var/lib/lladlad/uploads
```

**Recommended cost:** ~$5–6/month (Hetzner CX22 or DigitalOcean $6 droplet) + domain.

---

## 1. Provision a VPS

- **Hetzner CX22** (~€4.51/mo) or **DigitalOcean** $6 droplet
- Ubuntu 22.04 or 24.04
- Open ports: 22 (SSH), 80, 443

---

## 2. One-time server setup

SSH into the VPS and run:

```bash
git clone https://github.com/lladlad1912/lladladprod.git
cd lladladprod
sudo bash deploy/setup-vps.sh
```

Then configure:

```bash
# Backend secrets
sudo cp deploy/env.backend.example /etc/lladlad/backend.env
sudo nano /etc/lladlad/backend.env   # set DB password, JWT_SECRET, CORS, domain URLs

# Systemd service
sudo cp deploy/systemd/lladlad-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable lladlad-backend

# Nginx (replace yourdomain.com with your real domain)
sudo cp deploy/nginx/lladlad.conf /etc/nginx/sites-available/lladlad
sudo sed -i 's/yourdomain.com/lladlad.com/g' /etc/nginx/sites-available/lladlad
sudo ln -sf /etc/nginx/sites-available/lladlad /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# HTTPS
sudo certbot --nginx -d api.yourdomain.com -d www.yourdomain.com -d yourdomain.com
```

---

## 3. Frontend env (before build)

```bash
cd frontend
cp .env.production.example .env.production
```

Edit `.env.production`:

```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SITE_URL=https://www.yourdomain.com
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 4. Deploy

From your dev machine (Git Bash or WSL on Windows):

```bash
./deploy/deploy.sh user@YOUR_VPS_IP
```

This builds the JAR + React app, uploads them, and restarts the backend.

### Frontend hosting options

**Option A — Cloudflare Pages (recommended, free CDN)**

1. Connect GitHub repo `lladladprod`
2. Build command: `cd frontend && npm install && npm run build`
3. Output directory: `frontend/build`
4. Set env vars: `REACT_APP_API_URL`, `REACT_APP_SITE_URL`
5. Point `www` CNAME to Cloudflare Pages

**Option B — Same VPS (included in nginx config)**

- `deploy.sh` syncs `frontend/build` to `/var/www/lladlad`
- Point `www` A record to VPS IP

---

## 5. DNS (GoDaddy or Cloudflare)

| Record | Type | Value |
|--------|------|-------|
| `www` | CNAME | Cloudflare Pages URL **or** VPS IP (A record) |
| `api` | A | VPS public IP |
| `@` | A or redirect | VPS IP or redirect to `www` |

---

## 6. Azure cleanup (optional)

The remote `main` branch has Azure GitHub Actions workflows. You can remove them:

```bash
rm .github/workflows/azure-*.yml .github/workflows/main_lladlad-backend.yml
git commit -m "Remove Azure workflows; switch to VPS deployment"
git push origin main
```

---

## 7. Backups

Add a daily cron on the VPS:

```bash
# /etc/cron.daily/lladlad-backup
mysqldump -u lladlad -p'YOUR_DB_PASSWORD' blogdb > /var/backups/blogdb-$(date +%F).sql
tar -czf /var/backups/uploads-$(date +%F).tar.gz /var/lib/lladlad/uploads
```

---

## 8. Verify

- `https://api.yourdomain.com/api/categories` → JSON
- `https://www.yourdomain.com` → homepage
- Login as `admin` / `admin123` (change password after first login)
- Upload an image on a post → should load from `https://api.yourdomain.com/uploads/...`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | Check `CORS_ALLOWED_ORIGINS` in `/etc/lladlad/backend.env` |
| 502 on API | `sudo systemctl status lladlad-backend` and `journalctl -u lladlad-backend -f` |
| Images 404 | Ensure `/var/lib/lladlad/uploads` exists and nginx `alias` path matches |
| Blank React page | Check `REACT_APP_API_URL` was set **before** `npm run build` |
