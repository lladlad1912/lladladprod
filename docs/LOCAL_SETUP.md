# Local environment setup

Use this checklist the first time you run lladlad on your laptop. You will run **two programs**: the Java backend in **IntelliJ** and the React frontend in **VS Code**.

You do **not** need MySQL for local work. The `dev` profile uses H2 (in-memory).

For extra IDE detail, see [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md).

---

## 1. Install these once

| Tool | Version | Needed for | Download |
|------|---------|------------|----------|
| **Git** | Latest | Clone the repo | [git-scm.com](https://git-scm.com/) |
| **JDK** | **17** | Backend in IntelliJ | [Adoptium Temurin 17](https://adoptium.net/) |
| **Node.js** | **18+** (20 LTS recommended) | Frontend in VS Code | [nodejs.org](https://nodejs.org/) (LTS) |

JDK 17 is required for Spring Boot. Node is **not** required for IntelliJ. Node **is** required to open the website at http://localhost:3000.

Check in a terminal (PowerShell or Command Prompt):

```text
java -version
node -v
npm -v
```

`java -version` should show **17**. `node -v` should be **v18** or higher.

On Windows, IntelliJ can use the Maven wrapper (`mvnw.cmd`) in the repo — you do not have to install Maven separately.

---

## 2. Clone the `dev` branch

```powershell
git clone https://github.com/lladlad1912/lladladprod.git
cd lladladprod
git checkout dev
```

The folder you are now in is the **repo root**. In File Explorer it looks like:

```text
C:\Users\<your-windows-user>\...\lladladprod
```

That folder must contain both `pom.xml` (backend) and `frontend\package.json` (frontend).

---

## 3. File Explorer map — what to open where

Replace `lladladprod` with the full path of your clone.

### IntelliJ — File → Open → repo root

Open the folder that contains `pom.xml`, **not** `frontend`.

```text
lladladprod\
  pom.xml
  mvnw.cmd
  src\main\java\com\blogapp\BlogApplication.java
  src\main\java\com\blogapp\controller\PostController.java
  src\main\java\com\blogapp\service\PostService.java
  src\main\java\com\blogapp\security\SecurityConfig.java
  src\main\resources\application.properties.example
  src\main\resources\application-dev.properties
```

### VS Code — File → Open Folder → `frontend`

```text
lladladprod\frontend\
  package.json
  src\App.js
  src\config.js
  src\services\api.js
  src\components\PostForm.js
```

You can also open the whole repo in VS Code; then run frontend commands from the `frontend` folder.

---

## 4. Create local `application.properties` (required)

`src\main\resources\application.properties` is **gitignored**, so a fresh clone does not include it. Without it the backend fails with `Could not resolve placeholder 'jwt.secret'`.

Copy the example file **once** on your machine:

**Windows (PowerShell, from the repo root):**

```powershell
Copy-Item src\main\resources\application.properties.example src\main\resources\application.properties
```

**Mac / Linux:**

```bash
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

Do not commit this file. The example JWT secret is fine for local H2.

---

## 5. Run the backend (IntelliJ)

1. **File → Open** → `lladladprod` (repo root).
2. Wait for Maven import.
3. **File → Project Structure → Project SDK = 17**.
4. Open `src\main\java\com\blogapp\BlogApplication.java`.
5. **Run → Edit Configurations → + → Application**
   - Main class: `com.blogapp.BlogApplication`
   - Active profiles: `dev`  
     (or program arguments: `--spring.profiles.active=dev`)
6. Click **Run**.

Backend: http://localhost:8080

There is no website homepage on port 8080. A blank page or 403 is normal.

Check the API:

| URL | Expected |
|-----|----------|
| http://localhost:8080/api/categories | JSON list of categories |
| http://localhost:8080/api/posts | JSON list of posts |

Optional H2 console: http://localhost:8080/h2-console  
JDBC URL `jdbc:h2:mem:blogdb`, user `sa`, password empty.

**Terminal instead of IntelliJ (Windows):**

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.profiles.active=dev"
```

---

## 6. Run the frontend (VS Code)

1. **File → Open Folder** → `lladladprod\frontend`.
2. Terminal → New Terminal.
3. Run:

```powershell
npm install
npm start
```

Browser opens at http://localhost:3000. The UI talks to http://localhost:8080/api (see `frontend\src\config.js`). No `.env` file is needed locally.

---

## 7. Login

Seed users are created on each backend start (H2 is empty every restart).

| User | Password | Role |
|------|----------|------|
| `admin` | `Admin123!@` | ADMIN |
| `editor` | `Editor123!@` | EDITOR |

---

## 8. What needs what

| You want to… | JDK 17 | Node.js |
|--------------|--------|---------|
| Run backend in IntelliJ | Yes | No |
| Call `/api/posts` in the browser | Yes | No |
| Open the website at :3000 | Yes (backend must be up) | Yes |
| Edit `PostForm.js` and see it in the browser | Yes | Yes |

Keep **both** running while you work: IntelliJ on **8080**, VS Code / `npm start` on **3000**.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Could not resolve placeholder 'jwt.secret'` | Copy `application.properties.example` → `application.properties` (step 4) |
| `java -version` is 21 or 11 | Install JDK **17** and set IntelliJ Project SDK to 17 |
| `node` / `npm` not recognized | Install Node.js LTS and reopen the terminal |
| Port 8080 in use | Stop the other Java process, or change `server.port` in `application-dev.properties` |
| Port 3000 in use | `$env:PORT=3001; npm start` (PowerShell) |
| Frontend loads but API fails | Confirm IntelliJ is running with profile `dev` and http://localhost:8080/api/categories works |
| Wrong folder in IntelliJ | Open the folder that contains `pom.xml`, not `frontend` |
| H2 data disappeared | Expected — H2 is in-memory; restarting the backend reseeds it |

---

## Related docs

- [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) — more IDE options, Maven wrapper, optional local MySQL
- [ENVIRONMENTS.md](./ENVIRONMENTS.md) — local vs staging vs production
- [ARCHITECTURE.md](./ARCHITECTURE.md) — how frontend, backend, and DB connect
