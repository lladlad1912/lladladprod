# Database — Technical Reference

MySQL 8 · Spring Data JPA · Hibernate

---

## Table of contents

1. [Overview](#1-overview)
2. [Environment setup](#2-environment-setup)
3. [Schema management](#3-schema-management)
4. [Entity-relationship model](#4-entity-relationship-model)
5. [Tables reference](#5-tables-reference)
6. [Indexes and constraints](#6-indexes-and-constraints)
7. [Data structures in the DB](#7-data-structures-in-the-db)
8. [Seed data](#8-seed-data)
9. [Queries and repositories](#9-queries-and-repositories)
10. [Backup and operations](#10-backup-and-operations)

---

## 1. Overview

| Aspect | Choice | Reason |
|--------|--------|--------|
| **Production DB** | MySQL 8.0 | Mature, matches local dev, JDBC well-supported |
| **Dev DB (profile `dev`)** | H2 in-memory | Zero install for quick start |
| **ORM** | Hibernate via Spring Data JPA | Entity mapping, DDL auto-update |
| **ID strategy** | `GenerationType.IDENTITY` | Auto-increment BIGINT primary keys |
| **Timestamps** | `LocalDateTime` + `@PrePersist` / `@PreUpdate` | Automatic created/updated times |
| **Concurrency** | `@Version` on key entities | Optimistic locking |

The frontend **never** connects to the database. All access is through the Spring Boot API.

---

## 2. Environment setup

### Local development (H2 — recommended for quick start)

```powershell
$env:SPRING_PROFILES_ACTIVE="dev"
.\mvnw.cmd spring-boot:run
```

H2 console: `http://localhost:8080/h2-console`  
JDBC: `jdbc:h2:mem:blogdb` · user: `sa` · password: (empty)

### Local development (MySQL)

```sql
CREATE DATABASE blogdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Configure `application.properties` (gitignored) with localhost credentials.

### Production (Docker)

MySQL runs in the `mysql` container. Backend connects via Docker network:

```
jdbc:mysql://mysql:3306/blogdb?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
```

Data persisted in Docker volume `mysql_data`.

---

## 3. Schema management

**Current approach:** `spring.jpa.hibernate.ddl-auto=update`

| Mode | Behavior |
|------|----------|
| `update` | Hibernate adds new tables/columns on startup; **does not** drop columns |
| `validate` | Fail if schema mismatch (recommended before strict production) |
| `create-drop` | Recreate each run (dev only) |

**Why `update` for now:** Simple deployment — first backend start creates all tables automatically.

**Future improvement:** Flyway/Liquibase migrations for controlled schema changes.

---

## 4. Entity-relationship model

```
                    ┌─────────────┐
                    │  categories │
                    └──────┬──────┘
                           │ 1
                           │
                    ┌──────▼──────┐      ┌───────────────┐
                    │sub_categories│      │    users      │
                    └──────┬──────┘      └───────┬───────┘
                           │                     │
                           │         ┌───────────┼───────────┐
                           │         │           │           │
                    ┌──────▼─────────▼───┐       │           │
                    │       posts        │       │           │
                    └──────┬─────────────┘       │           │
                           │                     │           │
              ┌────────────┼────────────┐        │           │
              │            │            │        │           │
       ┌──────▼─────┐ ┌────▼────┐ ┌─────▼────┐ ┌─▼────────┐ ┌▼─────────┐
       │  comments  │ │post_likes│ │bookmarks │ │post_views│ │user_follows│
       └────────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
              │
              └── (self-ref: parent_id → comments.id)

Standalone: ad_placements, contact_submissions, site_settings
```

### Cardinality

| Relationship | Type | FK column |
|--------------|------|-----------|
| User → Post | One-to-Many | `posts.user_id` |
| Category → Post | One-to-Many | `posts.category_id` |
| SubCategory → Post | One-to-Many (optional) | `posts.sub_category_id` |
| Post → Comment | One-to-Many | `comments.post_id` |
| Comment → Comment | Self Many-to-One | `comments.parent_id` |
| User → Comment | Many-to-One | `comments.user_id` |
| Post + User → PostLike | Many-to-Many via junction | unique `(post_id, user_id)` |
| Post + User → Bookmark | Many-to-Many via junction | unique `(user_id, post_id)` |
| User → User (follow) | Many-to-Many via junction | `(follower_id, following_id)` |

---

## 5. Tables reference

### `users`

| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK AI | |
| username | VARCHAR UNIQUE NOT NULL | |
| email | VARCHAR UNIQUE NOT NULL | |
| password | VARCHAR NOT NULL | BCrypt hash |
| first_name, last_name | VARCHAR | |
| bio | VARCHAR(1000) | |
| profile_image | VARCHAR | filename in uploads/ |
| role | VARCHAR | USER, EDITOR, ADMIN |
| enabled | BOOLEAN | |
| newsletter_subscribed | BOOLEAN | |
| newsletter_subscribed_at | DATETIME | |
| created_at, updated_at | DATETIME | |
| version | BIGINT | optimistic lock |

### `posts`

| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK AI | |
| title | VARCHAR(200) NOT NULL | |
| content | TEXT | HTML from rich editor |
| youtube_url | VARCHAR | |
| image_path | VARCHAR | featured image filename |
| hashtags | VARCHAR(500) | comma-separated |
| meta_title, meta_description, meta_keywords | VARCHAR | SEO |
| view_count | BIGINT DEFAULT 0 | denormalized counter |
| status | VARCHAR(20) | DRAFT, PENDING_REVIEW, PUBLISHED, REJECTED |
| user_id | FK → users | author |
| category_id | FK → categories | |
| sub_category_id | FK → sub_categories | nullable |
| created_at, updated_at, version | | |

### `categories`

| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK AI | |
| name | VARCHAR UNIQUE | Books, Movies, Tech, … |
| description | TEXT | |
| show_in_header | BOOLEAN | navbar visibility |
| created_at, version | | |

### `sub_categories`

| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK AI | |
| name | VARCHAR | |
| description | TEXT | |
| category_id | FK → categories | |
| created_at, updated_at, version | | |

### `comments`

| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK AI | |
| content | TEXT NOT NULL | |
| post_id | FK → posts | |
| user_id | FK → users | |
| parent_id | FK → comments | NULL = top-level |
| created_at, updated_at | | |

**Tree storage:** Adjacency list (`parent_id`). Loaded recursively in Java for API tree response.

### `post_likes`

| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK AI | |
| post_id | FK → posts | |
| user_id | FK → users | |
| UNIQUE | (post_id, user_id) | one like per user per post |

### `bookmarks`

| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK AI | |
| user_id | FK → users | |
| post_id | FK → posts | |
| UNIQUE | (user_id, post_id) | |

### `post_views`

| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK AI | |
| post_id | FK → posts | |
| user_id | FK → users | nullable (anonymous) |
| ip_address | VARCHAR | |
| country, city, region | VARCHAR | from GeoIP |
| user_agent, referrer | VARCHAR | |
| viewed_at | DATETIME | |

**Why separate from view_count?** `view_count` on post is fast display; `post_views` rows power analytics.

### `user_follows`

| Column | Type | Notes |
|--------|------|-------|
| follower_id | FK → users | who follows |
| following_id | FK → users | who is followed |
| UNIQUE | (follower_id, following_id) | |

### `ad_placements`

| Column | Type | Notes |
|--------|------|-------|
| ad_code | TEXT | HTML/JS snippet |
| placement_name, position | VARCHAR | e.g. sidebar, header |
| display_order | INT | sort order |
| is_active | BOOLEAN | |
| width, height | INT | optional |

### `contact_submissions`

| Column | Type | Notes |
|--------|------|-------|
| name, email, subject, message | VARCHAR/TEXT | |
| submission_type | VARCHAR | |
| is_read | BOOLEAN | admin inbox |
| created_at | DATETIME | |

### `site_settings`

| Column | Type | Notes |
|--------|------|-------|
| key | VARCHAR UNIQUE | e.g. social_facebook |
| value | TEXT | URL or text |
| description | VARCHAR | admin hint |
| version | BIGINT | optimistic lock |

**Pattern:** Key-value store avoids ALTER TABLE for new settings.

---

## 6. Indexes and constraints

| Constraint | Table | Purpose |
|------------|-------|---------|
| UNIQUE username | users | login identity |
| UNIQUE email | users | registration |
| UNIQUE (post_id, user_id) | post_likes | idempotent likes |
| UNIQUE (user_id, post_id) | bookmarks | one bookmark per pair |
| UNIQUE (follower_id, following_id) | user_follows | no duplicate follows |
| UNIQUE key | site_settings | one row per setting |
| FK constraints | all junction tables | referential integrity |

Hibernate creates indexes on FK columns automatically in most cases.

---

## 7. Data structures in the DB

### Post status (enum as VARCHAR)

```
DRAFT → PENDING_REVIEW → PUBLISHED
                      ↘ REJECTED
```

Stored as string, not MySQL ENUM — easier to extend in Java.

### Nested comments (adjacency list)

```
Comment id=1 (parent_id=NULL)
  └── Comment id=2 (parent_id=1)
        └── Comment id=3 (parent_id=2)
```

**Alternative not used:** Nested sets, closure table — adjacency list is simplest for moderate thread depth.

### Denormalized counters

| Field | Table | Updated when |
|-------|-------|--------------|
| view_count | posts | Each POST /posts/{id}/view |
| postCount | DTO only | Computed in service from COUNT query |

Like/comment counts computed in DTO mapping, not stored on post row (except views).

---

## 8. Seed data

`DataInitializer.java` runs on every startup and ensures:

| Data | Details |
|------|---------|
| Site settings | Social URLs, footer text, contact email |
| Categories | Books, Movies, Tech, Dharma, Gaming |
| Users | admin, john_doe, jane_smith, editor |
| Sample posts | 8 posts across categories |

**Default passwords (change in production!):**

| User | Password |
|------|----------|
| admin | `Admin123!@` |
| john_doe | `Password123!@` |
| jane_smith | `Pass123!@` |

Initializer only creates if missing — won't overwrite existing data.

---

## 9. Queries and repositories

Repositories extend `JpaRepository<Entity, Long>`.

### Custom queries (examples)

| Repository | Query purpose |
|------------|---------------|
| `PostRepository` | Search by keyword, filter by status/category, paginated |
| `CommentRepository` | `findByPostIdAndParentIsNull`, `findByParentIdOrderByCreatedAtAsc` |
| `PostViewRepository` | Aggregates by country/city/date for statistics |
| `BookmarkRepository` | `countByPostId`, user bookmark lists |

**JPQL over native SQL:** Portable, type-safe; all custom queries use `@Query` with JPQL.

---

## 10. Backup and operations

### Docker VPS backup

```bash
# MySQL dump
docker compose exec mysql mysqldump -u lladlad -p blogdb > backup.sql

# Uploads volume
docker run --rm -v lladladprod_uploads_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/uploads-backup.tar.gz /data
```

### Restore

```bash
docker compose exec -T mysql mysql -u lladlad -p blogdb < backup.sql
```

### Useful commands

```bash
docker compose exec mysql mysql -u lladlad -p blogdb
SHOW TABLES;
SELECT id, title, status FROM posts;
SELECT username, role FROM users;
```

---

## Making schema changes

1. Add field to JPA **Entity** (`model/*.java`)
2. Restart backend with `ddl-auto=update` — column appears
3. Update **DTO** + **Service** mapper + **frontend** if exposed in API
4. For production at scale → add Flyway migration instead of relying on `update`

See also: [BACKEND.md](./BACKEND.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [VPS_DOCKER_DEPLOYMENT.md](../VPS_DOCKER_DEPLOYMENT.md)
