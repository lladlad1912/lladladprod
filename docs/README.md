# Documentation index — lladlad

All project documentation lives in this folder. Start here, then drill into what you need.

---

## Read order for new developers

| # | Document | Purpose |
|---|----------|---------|
| 1 | [ARCHITECTURE.md](./ARCHITECTURE.md) | How frontend, backend, and database connect |
| 2 | [ENVIRONMENTS.md](./ENVIRONMENTS.md) | **Dev, staging, and production** — profiles, URLs, databases |
| 3 | [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) | IDEs (IntelliJ + VS Code), local run commands |
| 4 | [BACKEND.md](./BACKEND.md) | Spring Boot layers, patterns, security, API |
| 5 | [FRONTEND.md](./FRONTEND.md) | React routes, components, API usage |
| 6 | [DATABASE.md](./DATABASE.md) | MySQL schema, tables, relationships |

---

## Deployment and operations

| Document | Purpose |
|----------|---------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Contabo VPS + Docker + Nginx + Let's Encrypt |
| [CLOUDFLARE.md](./CLOUDFLARE.md) | CDN/WAF in front of VPS — SSL, cache rules, real IP |

---

## Quick links by task

| I want to… | Read |
|------------|------|
| Run locally on my laptop | [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) |
| Understand dev vs staging vs prod | [ENVIRONMENTS.md](./ENVIRONMENTS.md) |
| Deploy production on Contabo | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Add Cloudflare | [CLOUDFLARE.md](./CLOUDFLARE.md) |
| Add a new API endpoint | [BACKEND.md](./BACKEND.md) → Making changes safely |
| Add a new React page | [FRONTEND.md](./FRONTEND.md) → Making changes safely |
| Change database schema | [DATABASE.md](./DATABASE.md) |

---

## Repository layout (what is not in `docs/`)

```
BlogApp/
├── README.md              ← Entry point (links here)
├── pom.xml                ← Backend Maven project
├── mvnw.cmd               ← Maven wrapper (Windows local dev)
├── src/                   ← Spring Boot source
├── frontend/              ← React source
└── docker/                ← Compose, Nginx, deploy scripts, .env examples
```

Legacy hosting configs (Netlify, Railway, bare-metal deploy) have been removed. Production path is **Docker on VPS** with optional **Cloudflare**.
