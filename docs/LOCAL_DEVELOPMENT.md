# Local development — IDEs, prerequisites, and run commands

Use this guide on any machine (without Cursor). You need **two processes** running: backend on port **8080**, frontend on port **3000**.

---

## Prerequisites

Install these once on each machine:

| Tool | Version | Download |
|------|---------|----------|
| **JDK** | **17** | [Adoptium Temurin 17](https://adoptium.net/) or Oracle JDK 17 |
| **Node.js** | **18+** (20 LTS recommended) | [nodejs.org](https://nodejs.org/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |
| **Maven** | 3.9+ | Optional on Windows if using `mvnw.cmd`; **required on Mac/Linux** (see [Maven wrapper](#maven-wrapper) below) |
| **MySQL 8** | Optional | Only if you skip the `dev` profile and use the default MySQL config |

Verify:

```bash
java -version    # should show 17
node -version    # v18 or higher
npm -version
```

---

## Recommended IDEs (no Cursor)

Use **one IDE for backend** and **one for frontend**, or a single editor for both.

### Backend — Spring Boot (Java 17)

| IDE | Edition | Cost | Best for |
|-----|---------|------|----------|
| **[IntelliJ IDEA](https://www.jetbrains.com/idea/)** | **Community** | Free | **Recommended** — run/debug `BlogApplication`, Maven, Spring |
| **Eclipse** | Eclipse IDE for Java Developers + Spring Tools | Free | Alternative if you already use Eclipse |
| **VS Code** | + [Extension Pack for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack) | Free | Lighter; good if you also use VS Code for frontend |

### Frontend — React 18

| IDE | Cost | Best for |
|-----|------|----------|
| **[VS Code](https://code.visualstudio.com/)** | Free | **Recommended** — React, terminal, Git |
| **[WebStorm](https://www.jetbrains.com/webstorm/)** | Paid | Best React/JS debugging and refactoring |
| **IntelliJ IDEA Ultimate** | Paid | Frontend + backend in one IDE (optional) |

### Practical combo (free)

| Role | IDE |
|------|-----|
| Backend | **IntelliJ IDEA Community** |
| Frontend | **VS Code** |

Open the **same repo folder** in both, or open `frontend/` as a separate window in VS Code.

---

## Run from IntelliJ IDEA (backend)

1. **File → Open** → select the repo root (folder with `pom.xml`).
2. Wait for Maven import to finish.
3. Confirm **Project SDK = 17** (File → Project Structure → Project).
4. Open `src/main/java/com/blogapp/BlogApplication.java`.
5. **Run → Edit Configurations → + → Application**
   - **Main class:** `com.blogapp.BlogApplication`
   - **Active profiles:** `dev`  
     *(or Program arguments: `--spring.profiles.active=dev`)*
6. Click **Run** (green play).

Backend URL: http://localhost:8080

**Important:** The backend is an **API only** — there is no homepage at `http://localhost:8080/`. A blank page or **403 Forbidden** is normal.

**Test with these URLs:**

| URL | Expected |
|-----|----------|
| http://localhost:8080/api/categories | JSON list of categories |
| http://localhost:8080/api/posts | JSON list of posts |

**Why `dev` profile?** Uses **H2 in-memory** DB — no MySQL install. See [DATABASE.md](./DATABASE.md).

**H2 console (optional):** http://localhost:8080/h2-console

| Field | Value |
|-------|--------|
| JDBC URL | `jdbc:h2:mem:blogdb` |
| User | `sa` |
| Password | *(leave empty)* |

Click **Connect**. Restart the backend after code updates if H2 console previously returned 403.

**Website UI:** Start the frontend separately — http://localhost:3000 (see below).

---

## Run from VS Code (frontend)

1. **File → Open Folder** → `frontend/` (or whole repo).
2. Open terminal (**Terminal → New Terminal**).
3. Run:

```bash
npm install
npm start
```

Browser opens at http://localhost:3000.

**Extensions (optional):** ESLint, ES7+ React/Redux/React-Native snippets.

---

## Run from WebStorm (frontend)

1. **File → Open** → `frontend/`.
2. WebStorm detects `package.json` and offers to install dependencies.
3. Open **npm** tool window → run script **`start`**, or terminal: `npm start`.

---

## Terminal commands (all platforms)

### Backend (H2 — recommended)

**Windows (PowerShell):**

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.profiles.active=dev"
```

**Mac / Linux** (system Maven — `mvnw` shell script is not in this repo yet):

```bash
mvn spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Login (seed data)

| User | Password |
|------|----------|
| `admin` | `Admin123!@` |

---

## Maven wrapper

| File | In Git? | Platform |
|------|---------|----------|
| `mvnw.cmd` | Yes | Windows |
| `mvnw` (Unix script) | No | Mac/Linux — use `mvn` or add the wrapper script |
| `.mvn/wrapper/maven-wrapper.properties` | Yes | All |

On Mac/Linux, install Maven (`brew install maven` / `sudo apt install maven`) or generate the Unix `mvnw` script with `mvn wrapper:wrapper`.

---

## Database: H2 vs MySQL locally

| Profile | Database | When to use |
|---------|----------|-------------|
| **`dev`** | H2 in-memory | Default for local work — **no MySQL** |
| **default** (no profile) | MySQL on `localhost:3306/blogdb` | When you want to test against real MySQL |
| **`prod`** | MySQL via env vars | Docker / VPS only |

**Production always uses MySQL.** Local dev uses H2 unless you explicitly choose MySQL.

### Optional: local MySQL

```sql
CREATE DATABASE blogdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Ensure MySQL matches `src/main/resources/application.properties` (user/password), or set env vars and run **without** the `dev` profile:

```bash
mvn spring-boot:run
```

---

## How frontend talks to backend locally

| Setting | Default |
|---------|---------|
| Frontend | http://localhost:3000 |
| API | http://localhost:8080/api |
| Config | `frontend/src/config.js` |

No `.env` needed for local dev — defaults point at `localhost:8080`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 8080 in use | Stop other Java apps or change `server.port` in `application-dev.properties` |
| Port 3000 in use | Set `PORT=3001` before `npm start` |
| Backend starts but frontend shows errors | Confirm backend is up; check browser Network tab for `/api` calls |
| `mvnw` not found on Mac/Linux | Use `mvn` or install Maven |
| MySQL connection refused | Use `--spring.profiles.active=dev` for H2, or start MySQL |
| IntelliJ uses wrong Java | Set Project SDK to **17** |

---

## Related docs

- [ENVIRONMENTS.md](./ENVIRONMENTS.md) — dev, staging, production
- [ARCHITECTURE.md](./ARCHITECTURE.md) — how frontend, backend, and DB connect
- [BACKEND.md](./BACKEND.md) — Spring Boot internals
- [FRONTEND.md](./FRONTEND.md) — React structure
- [DATABASE.md](./DATABASE.md) — schema and MySQL details
