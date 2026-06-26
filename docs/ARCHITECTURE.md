# lladlad — System Architecture

> **LIVE LIKE A DREAM LAD** — full-stack blog platform.

## High-level overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (User)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Nginx (production) or React dev server (localhost:3000)        │
│  • Serves React static files (HTML/JS/CSS)                      │
│  • Proxies /api/* and /uploads/* → Spring Boot                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│  React Frontend         │   │  Spring Boot Backend    │
│  (SPA)                  │   │  REST API :8080         │
│                         │   │                         │
│  • React Router         │   │  • Controllers          │
│  • AuthContext (JWT)    │───│  • Services             │
│  • axios → /api         │   │  • JPA Repositories     │
└─────────────────────────┘   └────────────┬────────────┘
                                           │ JDBC
                                           ▼
                              ┌─────────────────────────┐
                              │  MySQL 8                │
                              │  (or H2 in dev profile)   │
                              └─────────────────────────┘
```

The frontend **never** talks to MySQL directly. All data goes through the REST API.

---

## How frontend and backend are linked

### 1. URL configuration

| Environment | Frontend | API base | Config |
|-------------|----------|----------|--------|
| Local dev | `http://localhost:3000` | `http://localhost:8080/api` | defaults in `frontend/src/config.js` |
| Production (Docker) | `https://www.yourdomain.com` | same origin `/api` | `REACT_APP_API_URL` baked at build time |

```javascript
// frontend/src/config.js
API_BASE_URL = `${REACT_APP_API_URL}/api`
UPLOADS_BASE_URL = `${REACT_APP_API_URL}/uploads`
```

### 2. HTTP client

`frontend/src/services/api.js` creates an **Axios** instance:

- **Request interceptor** — attaches `Authorization: Bearer <token>` from `localStorage`
- **Response interceptor** — on 401, clears token and redirects to `/login`

Every component imports functions from `api.js` (e.g. `getPosts()`, `login()`), not raw fetch.

### 3. Authentication handshake

```
1. User logs in → POST /api/auth/login
2. Backend returns { token, username, email, id }
3. Frontend stores token in localStorage + AuthContext
4. All subsequent API calls include Bearer token
5. JwtAuthenticationFilter (backend) validates token per request
6. SecurityContext holds UserDetails for @PreAuthorize checks
```

### 4. CORS (cross-origin)

When frontend and backend are on **different origins** (e.g. Netlify + Railway), the backend must allow the frontend URL:

```properties
app.cors.allowed-origins=https://your-frontend.com
```

When using **Docker + Nginx on one domain**, frontend and API share the same origin — CORS is simpler.

### 5. Static uploads

Images uploaded via `POST /api/upload/image` are stored on disk (`file.upload-dir`). Served at:

```
GET /uploads/{filename}
```

Frontend builds full URLs with `uploadUrl()` from `config.js`.

---

## Backend internal layers

```
HTTP Request
    → RateLimitingFilter (token bucket per IP)
    → JwtAuthenticationFilter (JWT parse)
    → Controller (@RestController, /api/*)
    → Service (business logic, DTO mapping, caching)
    → Repository (Spring Data JPA)
    → MySQL
```

**DTOs** sit between entities and JSON responses — API never exposes JPA entities directly (avoids lazy-load issues and hides passwords).

---

## Frontend internal structure

```
index.js
  → App.js
      → AuthProvider (global user/token)
      → SidebarProvider (drawer state)
      → Router
          → Navbar (always visible)
          → Routes → Page components
          → Footer
```

Protected pages wrap content in `<ProtectedRoute>` which checks auth + role before rendering.

---

## Production deployment (Docker VPS)

See [VPS_DOCKER_DEPLOYMENT.md](../VPS_DOCKER_DEPLOYMENT.md).

| Container | Role |
|-----------|------|
| `nginx` | React build + reverse proxy |
| `backend` | Spring Boot JAR |
| `mysql` | Database |
| `certbot` | Let's Encrypt renewal |

One domain serves everything:

- `/` → React
- `/api/*` → Spring Boot
- `/uploads/*` → Spring Boot static handler

---

## Local development

| Terminal | Command | Port |
|----------|---------|------|
| Backend | `.\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=dev` | 8080 |
| Frontend | `cd frontend && npm start` | 3000 |

Dev profile uses **H2 in-memory** database — no MySQL install required.

---

## Related docs

- [BACKEND.md](./BACKEND.md) — Java/Spring details, patterns, endpoints
- [FRONTEND.md](./FRONTEND.md) — React components, routes, flows
- [DATABASE.md](./DATABASE.md) — MySQL schema, tables, relationships
