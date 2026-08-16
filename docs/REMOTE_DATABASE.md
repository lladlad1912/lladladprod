# Connect local lladlad to staging or production MySQL

The frontend never talks to MySQL. Only Spring Boot does. Staging and production already have their own databases in Docker. This page is for pointing **your laptop backend** at one of those databases, or confirming the VPS stacks are wired correctly.

## Do not point a laptop at production for daily work

| Target | Safe? | Why |
|--------|--------|-----|
| Local `dev` (H2) | Yes | Isolated, resets on restart |
| Staging MySQL | Use with care | Real data, but not the live site |
| Production MySQL | Avoid | `ddl-auto=update` or seed code from the wrong profile can change live posts/users |

The `remote` profile sets `spring.jpa.hibernate.ddl-auto=none` and `app.seed-data=false` so a local process will not create tables, seed admin users, or backfill slugs on the shared database.

## Staging and production on the VPS (already connected)

Each Docker stack has its own MySQL volume and credentials:

| Environment | Compose env file | Database name | Profile |
|-------------|------------------|---------------|---------|
| Staging | `docker/.env.staging` | `blogdb_staging` | `staging` |
| Production | `docker/.env` | `blogdb` | `prod` |

`docker-compose.yml` sets `DB_URL=jdbc:mysql://mysql:3306/${MYSQL_DATABASE}`. After `./scripts/deploy-staging.sh` or `./scripts/deploy.sh`, that environment is already using its own DB. You do not paste production URLs into Git.

## Google OAuth against staging/prod users

Google Sign-In already looks up `users.email` in **whatever database the running backend uses**.

1. Create the user in that environment first (admin Users page, or SQL), with the same email as the Google account.
2. Set `GOOGLE_CLIENT_ID` on the backend to the Web client ID from Google Cloud Console (same value as `REACT_APP_GOOGLE_CLIENT_ID`).
3. Set `OAUTH_REQUIRE_EXISTING_USER=true` so Google cannot create a new USER row. If the email is missing, login returns 403.

The backend verifies the Google ID token with Google (`tokeninfo`). It does not trust email fields sent from the browser.

## Point local Spring Boot at staging (SSH tunnel)

On the VPS, MySQL is not public. Tunnel it:

```bash
ssh -L 3307:127.0.0.1:3306 your-user@your-vps
```

If MySQL only listens on the Docker network, tunnel through the staging mysql container IP or publish 3306 only on localhost. Then in IntelliJ (or PowerShell):

```powershell
$env:SPRING_PROFILES_ACTIVE="remote"
$env:DB_URL="jdbc:mysql://127.0.0.1:3307/blogdb_staging?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
$env:DB_USER="lladlad_staging"
$env:DB_PASSWORD="(from docker/.env.staging MYSQL_PASSWORD)"
$env:JWT_SECRET="(from docker/.env.staging JWT_SECRET)"
$env:GOOGLE_CLIENT_ID="your-google-web-client-id"
$env:OAUTH_REQUIRE_EXISTING_USER="true"
.\mvnw.cmd spring-boot:run
```

Frontend stays `npm start` on http://localhost:3000. CORS already allows that origin.

Copy the password from the VPS `.env.staging` file. Do not put it in the repo.

## Production tunnel (emergency only)

Same as staging, but database `blogdb`, user/password from `docker/.env`, and profile still `remote` so schema/seed stay off. Prefer a DB dump instead of a live laptop connection:

```bash
docker compose --env-file .env exec mysql mysqldump -u lladlad -p blogdb > prod-backup.sql
```

Load that dump into local MySQL if you need a copy of production data.

## Checklist before a remote connection

- [ ] You are using profile `remote`, not `dev` or default `application.properties`
- [ ] `APP_SEED_DATA` is not forced to `true`
- [ ] `ddl-auto` is `none`
- [ ] Staging vs prod credentials are not mixed
- [ ] Google client ID matches the OAuth client that lists `http://localhost:3000` as an authorized origin
