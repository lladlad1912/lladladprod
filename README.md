# lladlad

> **LIVE LIKE A DREAM LAD**

Full-stack blog platform — Spring Boot backend, React frontend, MySQL in staging/production.

---

## Documentation

All docs are in **[docs/](./docs/README.md)**.

| Doc | What's inside |
|-----|----------------|
| [**Docs index**](./docs/README.md) | Full list and read order |
| [**Environments**](./docs/ENVIRONMENTS.md) | **Dev, staging, production** — profiles, MySQL, Docker |
| [**Architecture**](./docs/ARCHITECTURE.md) | How frontend, backend, and DB connect |
| [**Local setup**](./docs/LOCAL_SETUP.md) | **First-time laptop setup** — clone, JDK 17, Node, IntelliJ + VS Code |
| [**Local development**](./docs/LOCAL_DEVELOPMENT.md) | Extra IDE detail, Maven wrapper, optional MySQL |
| [**Staging**](./docs/STAGING.md) | Staging on Contabo — MySQL, subdomain, deploy workflow |
| [**Deployment**](./docs/DEPLOYMENT.md) | Production — Contabo + Docker + Nginx |
| [**Cloudflare**](./docs/CLOUDFLARE.md) | CDN/WAF in front of VPS |
| [**Backend**](./docs/BACKEND.md) | Spring Boot layers, patterns, API |
| [**Frontend**](./docs/FRONTEND.md) | React routes, components, flows |
| [**Database**](./docs/DATABASE.md) | MySQL schema, tables, relationships |

**New to the project?** Read [Architecture](./docs/ARCHITECTURE.md) → [Environments](./docs/ENVIRONMENTS.md).

---

## Quick start (local dev)

Requires **JDK 17** and **Node 18+**. Uses **H2** (no MySQL install).

```powershell
# Backend (Windows)
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.profiles.active=dev"

# Frontend
cd frontend
npm install
npm start
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8080 |
| Login | `admin` / `Admin123!@` |

First-time laptop setup: [docs/LOCAL_SETUP.md](./docs/LOCAL_SETUP.md)  
IDE extras: [docs/LOCAL_DEVELOPMENT.md](./docs/LOCAL_DEVELOPMENT.md)

---

## Environments at a glance

| Environment | Profile | Database | Where |
|-------------|---------|----------|-------|
| **Development** | `dev` | H2 in-memory | Local machine |
| **Staging** | `staging` | MySQL (Docker) | Contabo VPS |
| **Production** | `prod` | MySQL (Docker) | Contabo VPS + Cloudflare |

Details: [docs/ENVIRONMENTS.md](./docs/ENVIRONMENTS.md)

---

## Production deploy (Contabo)

```bash
git clone https://github.com/lladlad1912/lladladprod.git
cd lladladprod/docker
cp .env.example .env && nano .env
chmod +x scripts/*.sh && ./scripts/deploy.sh
```

Full guide: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

## Repository layout

```
BlogApp/
├── README.md
├── pom.xml / mvnw.cmd     # Backend (Maven)
├── src/                   # Spring Boot
├── frontend/              # React
├── docker/                # Compose, Nginx, deploy scripts, .env examples
└── docs/                  # All documentation
```

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Java 17, Spring Boot 3.2, Spring Security, JWT |
| Frontend | React 18, React Router, Axios |
| Database | H2 (dev), MySQL 8 (staging/prod) |
| Deploy | Docker Compose, Nginx, Let's Encrypt, Cloudflare |

---

## License

Private project — lladlad1912
