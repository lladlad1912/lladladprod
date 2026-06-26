# Backend — Technical Reference

Spring Boot 3.2 · Java 17 · MySQL · JWT security

Package root: `src/main/java/com/blogapp/`

---

## Table of contents

1. [Layered architecture](#1-layered-architecture)
2. [Design patterns and why](#2-design-patterns-and-why)
3. [Security (JWT + roles)](#3-security-jwt--roles)
4. [Entities and relationships](#4-entities-and-relationships)
5. [DTOs and data structures](#5-dtos-and-data-structures)
6. [Services (business logic)](#6-services-business-logic)
7. [REST API reference](#7-rest-api-reference)
8. [Configuration](#8-configuration)
9. [Cross-cutting concerns](#9-cross-cutting-concerns)
10. [Profiles and properties](#10-profiles-and-properties)

---

## 1. Layered architecture

```
Controller  →  Service  →  Repository  →  Database
   ↑              ↑
  DTO          Entity
```

| Layer | Responsibility | Example |
|-------|----------------|---------|
| **Controller** | HTTP mapping, validation, auth annotations | `PostController` |
| **Service** | Business rules, DTO conversion, caching | `PostService` |
| **Repository** | CRUD queries (Spring Data JPA) | `PostRepository` |
| **Model** | JPA entities (DB tables) | `Post.java` |
| **DTO** | JSON request/response shapes | `PostDTO.java` |
| **Security** | JWT, filters, password encoding | `SecurityConfig.java` |
| **Config** | CORS, cache, uploads, seed data | `CacheConfig.java` |

**Why separate layers?**

- Controllers stay thin — easy to read HTTP contract
- Services hold testable business logic
- Entities are not leaked to the API (passwords, lazy collections hidden)
- Repositories auto-implement CRUD via interfaces

---

## 2. Design patterns and why

### Repository pattern
**Where:** `repository/*Repository.java`  
**What:** Spring Data JPA interfaces extending `JpaRepository<Entity, Long>`  
**Why:** No boilerplate SQL for standard CRUD; custom queries via `@Query` when needed

### Service layer pattern
**Where:** `service/*Service.java`  
**What:** `@Service` classes injected into controllers  
**Why:** Single place for business rules (e.g. "USER posts go to PENDING_REVIEW")

### DTO (Data Transfer Object) pattern
**Where:** `dto/*.java`  
**What:** Plain objects for API input/output  
**Why:** Decouple JSON from JPA entities; add computed fields (`commentCount`, `likeCount`) without DB columns

### Mapper pattern (manual)
**Where:** Private methods like `PostService.convertToDTO()`  
**Why:** Explicit control over what goes to the client; no MapStruct dependency

### Filter chain pattern
**Where:** `RateLimitingFilter`, `JwtAuthenticationFilter`  
**Why:** Cross-cutting concerns (rate limit, auth) without duplicating code in every controller

### Strategy (role-based visibility)
**Where:** `PostService.getAllPosts(String userRole)`  
**Why:** ADMIN/EDITOR see all statuses; public users see `PUBLISHED` only

### Optimistic locking
**Where:** `@Version` on `User`, `Post`, `Category`, `SubCategory`, `AdPlacement`, `SiteSettings`  
**Why:** Prevents lost updates when two admins edit the same row concurrently

### Cache-aside
**Where:** `@Cacheable` / `@CacheEvict` on services + `CacheConfig` (Caffeine)  
**Why:** Categories, posts, users read often — cache reduces DB load

### Self-referential tree (adjacency list)
**Where:** `Comment.parent` / `Comment.replies`  
**Why:** Nested comment threads; loaded recursively in `CommentService.convertToDTOWithReplies()`

### Key-value settings
**Where:** `SiteSettings` entity (`key`, `value`)  
**Why:** Flexible footer/social config without schema changes

### Token bucket rate limiting
**Where:** `RateLimitingFilter`  
**Why:** Protect `/api/**` from abuse; separate limits for GET vs write

### CommandLineRunner (bootstrap)
**Where:** `DataInitializer.java`  
**Why:** Seed categories, users, sample posts on first startup

---

## 3. Security (JWT + roles)

### Flow

```
POST /api/auth/login { username, password }
    → AuthenticationManager validates credentials
    → JwtTokenProvider.generateToken(username)
    → Returns AuthResponse { token, type: "Bearer", ... }

Subsequent requests:
    Header: Authorization: Bearer <token>
    → JwtAuthenticationFilter validates signature + expiry
    → Loads UserDetails via CustomUserDetailsService
    → Sets SecurityContextHolder
    → @PreAuthorize / URL rules apply
```

### Roles

| DB value | Spring authorities | Capabilities |
|----------|-------------------|--------------|
| `USER` | `ROLE_USER` | Create posts (→ review), comment, like, bookmark |
| `EDITOR` | `ROLE_USER`, `ROLE_EDITOR` | Publish directly, review posts, edit settings |
| `ADMIN` | all three | Full CRUD, users, ads, categories |

### Key classes

| Class | Purpose |
|-------|---------|
| `SecurityConfig` | Filter chain, URL rules, BCrypt, CORS |
| `JwtTokenProvider` | Create/validate JWT (HMAC-SHA256) |
| `JwtAuthenticationFilter` | Extract Bearer token per request |
| `CustomUserDetailsService` | Load user + map role → authorities |
| `RateLimitingFilter` | Per-IP rate limits before auth |

### Public vs protected endpoints

Public examples: `GET /api/posts`, `GET /api/categories`, `POST /api/auth/login`, `/uploads/**`  
Protected: `POST /api/posts`, admin routes, bookmarks (require `ROLE_USER`)

Stateless — no server sessions (`SessionCreationPolicy.STATELESS`).

---

## 4. Entities and relationships

### ER diagram (core)

```
User ──< Post >── Category
  │       │            │
  │       │            └──< SubCategory
  │       │
  ├──< Comment (self-ref parent/replies)
  ├──< PostLike
  ├──< Bookmark
  └──< UserFollow (follower/following)

Post ──< PostView (analytics)
Post ──< Comment, PostLike, Bookmark

Standalone: AdPlacement, ContactSubmission, SiteSettings
```

### Entity summary

| Entity | Table | Key fields |
|--------|-------|------------|
| `User` | `users` | username, email, password (BCrypt), role, profile |
| `Post` | `posts` | title, content, status, SEO, youtubeUrl, imagePath, viewCount |
| `Category` | `categories` | name, showInHeader |
| `SubCategory` | `sub_categories` | name, → category |
| `Comment` | `comments` | content, parent_id (nested) |
| `PostLike` | `post_likes` | unique (post_id, user_id) |
| `Bookmark` | `bookmarks` | unique (user_id, post_id) |
| `PostView` | `post_views` | ip, geo, userAgent, viewedAt |
| `UserFollow` | `user_follows` | follower_id, following_id |
| `AdPlacement` | `ad_placements` | position, adCode, displayOrder |
| `ContactSubmission` | `contact_submissions` | contact form entries |
| `SiteSettings` | `site_settings` | key-value config |

### Post status workflow

```
USER creates post     → PENDING_REVIEW
EDITOR/ADMIN creates  → PUBLISHED
EDITOR approves       → PUBLISHED
EDITOR rejects        → REJECTED
```

### Fetch types (important for performance)

- `Post.author`, `Post.category` — **EAGER** (always loaded with post)
- `Comment.post`, `Comment.parent` — **LAZY** (load when accessed)
- Avoid returning raw entities in controllers — use DTOs

---

## 5. DTOs and data structures

### Core DTOs

| DTO | Used for |
|-----|----------|
| `AuthRequest` / `AuthResponse` | Login |
| `PostDTO` | Post list/detail (includes author name, counts, YouTube helpers) |
| `CommentDTO` | Comments with nested `List<CommentDTO> replies` |
| `UserDTO` | Profile (no password) |
| `CategoryDTO` / `SubCategoryDTO` | Categories with post counts |
| `BookmarkDTO` | Bookmark list with post summary |
| `PageResponse<T>` | Pagination wrapper |
| `PostStatisticsDTO` | View analytics aggregates |

### PageResponse&lt;T&gt; (generic pagination)

```java
{
  content: T[],
  page: number,
  size: number,
  totalElements: number,
  totalPages: number,
  first: boolean,
  last: boolean
}
```

Built from Spring `Page<T>` in `PostService` and `CommentService`.

**Why not return Spring Page directly?** Stable JSON contract; hide Spring-specific fields.

### Nested comments (tree structure)

- **Flat API:** `GET /api/comments/post/{id}?page=0&size=10`
- **Tree API:** `GET /api/comments/post/{id}/all` — recursive `replies` in each `CommentDTO`
- **Create reply:** `POST /api/comments` with optional `parentId`

Max depth enforced in **frontend** UI (3 levels); backend allows any depth.

---

## 6. Services (business logic)

| Service | Key responsibilities |
|---------|---------------------|
| `PostService` | CRUD, search, pagination, review workflow, role filtering, cache |
| `CommentService` | Nested tree building, CRUD |
| `UserService` | User CRUD, profile DTOs |
| `CategoryService` / `SubCategoryService` | Category CRUD, cached |
| `PostLikeService` | Toggle like, counts |
| `BookmarkService` | Toggle bookmark, user list |
| `PostViewService` | Track views + geo analytics |
| `UserFollowService` | Follow/unfollow, counts |
| `FileStorageService` | Save files to `file.upload-dir` with UUID names |
| `EmailService` | SMTP notifications (graceful no-op if unconfigured) |
| `GeolocationService` | IP → country/city via ip-api.com |
| `RazorpayPaymentService` | Payment orders + HMAC verification |
| `AdPlacementService` | Ad CRUD + reorder |
| `SiteSettingsService` | Key-value get/set |
| `ContactSubmissionService` | Contact form storage |

---

## 7. REST API reference

Base path: `/api` (except sitemap at root)

### Auth
| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/login` | Public |
| POST | `/auth/register` | Public |
| POST | `/oauth2/google/callback` | Public |

### Posts
| Method | Path | Notes |
|--------|------|-------|
| GET | `/posts` | Role-filtered list |
| GET | `/posts/{id}` | Single post |
| GET | `/posts/search` | Keyword search |
| POST | `/posts` | EDITOR, ADMIN |
| PUT | `/posts/{id}` | Owner or admin |
| DELETE | `/posts/{id}` | ADMIN |
| POST | `/posts/{id}/view` | Increment view |
| PUT | `/posts/{id}/approve` | EDITOR, ADMIN |
| PUT | `/posts/{id}/reject` | EDITOR, ADMIN |

### Comments, categories, users, likes, bookmarks, follows, search, upload, payments, newsletter — see controllers in `controller/` package.

### Sitemap (SEO)
- `GET /sitemap.xml`
- `GET /sitemap.txt`

---

## 8. Configuration

| Class | Purpose |
|-------|---------|
| `SecurityConfig` | Security filter chain, JWT, CORS, URL authorization |
| `CacheConfig` | Caffeine caches (30min write / 10min access TTL) |
| `WebConfig` | Maps `/uploads/**` to filesystem |
| `CorsConfig` | CORS filter bean (`app.cors.allowed-origins`) |
| `ConcurrencyConfig` | Async thread pool |
| `DataInitializer` | Seed data on startup |

---

## 9. Cross-cutting concerns

### Caching (Caffeine)
Cache names: `categories`, `subcategories`, `users`, `posts`, `userProfiles`  
Evicted on write operations in respective services.

### Rate limiting
Config in `application.properties`:
- GET: 30 req/sec per IP (dev defaults)
- WRITE: 10 req/sec per IP

Returns **429** with `X-RateLimit-*` headers.

### File uploads
- Max 10MB (`spring.servlet.multipart.max-file-size`)
- Stored in `file.upload-dir` (local: `uploads/`, Docker: `/app/uploads/`)
- Served at `/uploads/{filename}`

---

## 10. Profiles and properties

| Profile | Database | When |
|---------|----------|------|
| default | MySQL localhost | Local with MySQL |
| `dev` | H2 in-memory | Local quick start |
| `prod` | MySQL via env vars | Docker / VPS |

Key production env vars:

```env
DB_URL=jdbc:mysql://mysql:3306/blogdb?...
DB_USER=lladlad
DB_PASSWORD=...
JWT_SECRET=...
CORS_ALLOWED_ORIGINS=https://www.yourdomain.com
SITE_URL=https://www.yourdomain.com
FILE_UPLOAD_DIR=/app/uploads
```

Entry point: `BlogApplication.java` — standard `@SpringBootApplication`.

---

## Making changes safely

| Change type | Touch these |
|-------------|-------------|
| New API endpoint | Controller → Service → Repository (+ DTO) |
| New DB table | Entity → Repository → Service → DTO → Controller |
| New role permission | `SecurityConfig` URL rules + `@PreAuthorize` + frontend `ProtectedRoute` |
| New public URL for frontend | `App.js` route + component |
| Cache invalidation | `@CacheEvict` on write methods in service |

See also: [ARCHITECTURE.md](./ARCHITECTURE.md) · [DATABASE.md](./DATABASE.md) · [FRONTEND.md](./FRONTEND.md)
