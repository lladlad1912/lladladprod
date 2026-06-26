# lladlad

> **LIVE LIKE A DREAM LAD**

Full-stack blog platform — Spring Boot backend, React frontend, MySQL database.

---

## Documentation

| Doc | What's inside |
|-----|----------------|
| [**Architecture**](./docs/ARCHITECTURE.md) | How frontend, backend, and DB connect; deployment diagram |
| [**Backend**](./docs/BACKEND.md) | Spring Boot layers, patterns, security, API reference |
| [**Frontend**](./docs/FRONTEND.md) | React routes, components, Context, API usage, user flows |
| [**Database**](./docs/DATABASE.md) | MySQL schema, tables, relationships, seed data |
| [**VPS Docker Deploy**](./VPS_DOCKER_DEPLOYMENT.md) | Production: Docker + Nginx + Let's Encrypt + GoDaddy |

Start with **Architecture** if you're new to the project.

---

## Quick start (local)

### Backend (H2 — no MySQL install)

```powershell
.\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=dev
```

Runs at `http://localhost:8080`

### Frontend

```powershell
cd frontend
npm install
npm start
```

Runs at `http://localhost:3000`

### Login

| User | Password |
|------|----------|
| admin | `Admin123!@` |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Java 17, Spring Boot 3.2, Spring Security, JWT |
| Frontend | React 18, React Router, Axios, Context API |
| Database | MySQL 8 (production), H2 (dev) |
| Deploy | Docker Compose, Nginx, Let's Encrypt |

---

## Project structure

```
BlogApp/
├── src/main/java/com/blogapp/   # Backend (controllers, services, models)
├── frontend/src/                # React app
├── docker/                      # Docker Compose, Nginx, deploy scripts
├── docs/                        # Technical documentation
├── netlify.toml                 # Optional Netlify frontend-only deploy
└── pom.xml
```

---

## Production

Recommended: **single VPS with Docker** — see [VPS_DOCKER_DEPLOYMENT.md](./VPS_DOCKER_DEPLOYMENT.md).

```
https://www.yourdomain.com      → React (Nginx)
https://www.yourdomain.com/api  → Spring Boot
MySQL container                 → persistent volume
```

---

## License

Private project — lladlad1912
