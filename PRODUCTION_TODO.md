# Production TODO / Checklist

Use this as the master “done list” before going live.

## Backend

- **Database**
  - Choose: MySQL (recommended) / Postgres
  - Provision managed DB (RDS / Azure Database) or self-host
  - Set `spring.datasource.*` for production
  - Use migrations (Flyway/Liquibase) instead of `ddl-auto=update`

- **Secrets**
  - Move secrets to environment variables / secret manager
  - Do not commit:
    - `jwt.secret`
    - DB password
    - SMTP password
    - Razorpay keys
    - Google OAuth client secret

- **Auth**
  - Configure Google OAuth callback URLs for production domain
  - Validate JWT expiration/refresh strategy

- **Email (SMTP)**
  - Pick provider: SendGrid / Mailgun / SES / Gmail app password (dev only)
  - Configure `spring.mail.*`
  - Implement newsletter email sending + unsubscribe flow

- **CORS**
  - Lock down `allowed-origins` to your production frontend domain

- **Rate limiting**
  - Tune limits (GET/WRITE)
  - Consider Redis-based limiter if you scale to multiple instances

- **Observability**
  - Add structured logging
  - Add error monitoring (Sentry) and/or metrics (Prometheus)

## Frontend

- **Build**
  - Set API base URL for production (env var)
  - `npm run build`

- **SEO**
  - Verify `robots.txt`, sitemap endpoints, meta tags

## Payments

- Razorpay keys in secret store
- Store orders/payments in DB
- Add webhooks
- Verify signature server-side (already present) and enforce product-price on server

## Deployment

- HTTPS everywhere
- Domain + DNS config (GoDaddy)
- CI/CD pipeline (GitHub Actions recommended)
- Backups for DB
- CDN for static frontend











