# Production Deployment Guide (GoDaddy domain)

This app has:

- **Frontend**: React (builds to static files)
- **Backend**: Spring Boot (REST API)
- **DB**: MySQL (recommended in production)

## Recommended “minimal + best” approach

### Option A (AWS) — best cost/perf/standard

- **Frontend**: S3 static hosting + CloudFront CDN
- **Backend**: ECS Fargate *or* Elastic Beanstalk *or* EC2
- **DB**: Amazon RDS (MySQL)
- **Secrets**: AWS Secrets Manager / SSM Parameter Store
- **TLS/HTTPS**: AWS Certificate Manager (ACM) + CloudFront / ALB

Pros:
- Scales well, common setup, good pricing

### Option B (Azure) — easiest if you prefer Azure

- **Frontend**: Azure Static Web Apps *or* Storage Static Website + CDN
- **Backend**: Azure App Service (Java)
- **DB**: Azure Database for MySQL
- **Secrets**: Azure Key Vault
- **TLS/HTTPS**: managed certificates

Pros:
- Great developer experience, easy to operate

## Lowest-effort option (single VM)

### Option C (VPS / EC2 / Azure VM)

- Run Spring Boot + Nginx on a single VM
- Frontend served by Nginx (static build) or via separate hosting
- DB on managed service (recommended) or on VM (not recommended)

Pros:
- Simple mental model
Cons:
- Manual ops, scaling and reliability are harder

## Domain (GoDaddy) setup

You have two common patterns:

- **Frontend** at `www.yourdomain.com`
- **Backend API** at `api.yourdomain.com`

In GoDaddy DNS:

- Create `CNAME` for `www` → CloudFront domain (AWS) / Static Web Apps domain (Azure)
- Create `CNAME` for `api` → ALB/EB endpoint (AWS) / App Service hostname (Azure)

## CORS + API Base URL

- Backend `allowed-origins` should be your production frontend URL
- Frontend should use a configurable API base URL (env var) instead of hardcoding localhost

## Suggested CI/CD (fastest wins)

- **GitHub Actions**
  - Build backend JAR
  - Build frontend bundle
  - Deploy artifacts to your chosen platform

## Production security notes

- Never commit secrets
- Turn off dev tools
- Use strong `jwt.secret`
- Use DB migrations (Flyway/Liquibase) instead of auto schema updates
- Add payment webhooks + order DB tables before selling real products





