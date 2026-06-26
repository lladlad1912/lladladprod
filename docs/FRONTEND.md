# Frontend — Technical Reference

React 18 · React Router 6 · Axios · Context API

Source root: `frontend/src/`

---

## Table of contents

1. [Architecture overview](#1-architecture-overview)
2. [Design patterns and why](#2-design-patterns-and-why)
3. [Routing](#3-routing)
4. [State management](#4-state-management)
5. [API layer](#5-api-layer)
6. [Configuration and environment](#6-configuration-and-environment)
7. [Components reference](#7-components-reference)
8. [Key user flows](#8-key-user-flows)
9. [Styling and layout](#9-styling-and-layout)
10. [Making changes safely](#10-making-changes-safely)

---

## 1. Architecture overview

```
index.js
  └── App.js
        ├── AuthProvider          ← global auth state
        ├── SidebarProvider       ← drawer open/close
        └── Router
              ├── Navbar          ← search, categories, login
              ├── <Routes>        ← page components
              └── Footer          ← settings + latest posts
```

**Data flow:**

```
User action → Component → api.js function → Axios → Backend /api/*
                ↑                              ↓
           AuthContext ←────────────── JSON response (DTOs)
```

Components **never** import MySQL or Java — only HTTP via `services/api.js`.

---

## 2. Design patterns and why

### Container / presentation (informal)
Page components (`PostDetail`, `MagazinePostList`) fetch data and render UI in one file. No strict split — keeps the codebase simple for a medium-sized app.

### Context pattern
**Where:** `AuthContext.js`, `SidebarContext.js`  
**Why:** Avoid prop-drilling user/token and sidebar state through 20+ components

### Protected route pattern
**Where:** `ProtectedRoute.js`  
**Why:** Declarative auth gates — wrap routes with `requireAdmin` / `requireEditorOrAdmin` flags

### Service layer (API module)
**Where:** `services/api.js`  
**Why:** Single Axios instance, interceptors, grouped API functions — components stay readable

### Composition
**Where:** Pages compose `Sidebar`, `SEO`, `CommentSection`, `RichTextEditor`  
**Why:** Reuse layout shell without inheritance

### Headless SEO components
**Where:** `SEO.js`, `StructuredData.js`  
**Why:** Side effects on `document.head` without rendering visible UI

### Extracted sub-component for stable identity
**Where:** `CommentItem` inside `CommentSection.js` (defined **outside** parent)  
**Why:** Prevents React remounting on every keystroke (typing bug fix)

### Optimistic / local state updates
**Where:** Like counts, bookmark toggles update UI after API success  
**Why:** Responsive feel without full page reload

---

## 3. Routing

Defined in `App.js` inside `<Routes>`:

| Path | Component | Access |
|------|-----------|--------|
| `/` | `MagazinePostList` | Public — home |
| `/login` | `Login` | Public |
| `/register` | `Register` | Public |
| `/posts/new` | `PostForm` | Authenticated |
| `/posts/:id` | `PostDetail` | Public |
| `/posts/:id/edit` | `PostForm` | Authenticated |
| `/categories` | `CategoryList` | Public (admin actions inside) |
| `/subcategories` | `SubCategoryList` | Admin |
| `/users` | `UserList` | Admin |
| `/profile` | `UserProfile` | Authenticated |
| `/profile/setup` | `ProfileSetup` | Authenticated (OAuth onboarding) |
| `/admin/settings` | `AdminSettings` | Admin |
| `/admin/ads` | `AdminAds` | Admin |
| `/postmarks` | `PostmarksPage` | Authenticated |
| `/review-posts` | `PostReviewPage` | Editor or Admin |
| `/statistics` | `PostStatistics` | Authenticated |
| `/statistics/:id` | `PostStatistics` | Authenticated (single post) |
| `/write-for-lladlad` | `WriteForLladlad` | Public contact |
| `/products` | `ProductsPage` | Authenticated (Razorpay demo) |

**URL query params on home:** `/?category=Movies&subcategory=...` — read by `MagazinePostList` via `useSearchParams()`.

**SPA routing in production:** Nginx/Netlify rewrite all paths to `index.html` so refresh on `/posts/1` works.

---

## 4. State management

### AuthContext (`context/AuthContext.js`)

| State / method | Purpose |
|----------------|---------|
| `user` | Current user object from backend |
| `token` | JWT string (mirrored in `localStorage`) |
| `loading` | True while validating token on app load |
| `login(username, password)` | POST `/auth/login` |
| `register(userData)` | POST `/auth/register` |
| `googleLogin(data)` | POST `/oauth2/google/callback` |
| `logout()` | Clear token + user |
| `loadCurrentUser()` | GET `/users/me` |
| `isAdmin()` / `isEditor()` / `isUser()` | Role helpers |

**On mount:** If `localStorage.token` exists → validate via `/users/me` or logout on failure.

### SidebarContext (`context/SidebarContext.js`)

| State / method | Purpose |
|----------------|---------|
| `sidebarOpen` | Drawer visible |
| `toggleSidebar()` | Hamburger toggle |
| `closeSidebar()` | Close on navigation |

### Local component state
Most pages use `useState` + `useEffect` for data fetching — no Redux. Appropriate for this app size.

### localStorage keys

| Key | Purpose |
|-----|---------|
| `token` | JWT persistence |
| `pendingBookmark` | Redirect to post after login |
| `pendingProfileSetup` | Google OAuth new user flag |

---

## 5. API layer

File: `services/api.js`

### Axios setup

```javascript
import { API_BASE_URL } from '../config';

const api = axios.create({ baseURL: API_BASE_URL });

// Request: attach Bearer token
// Response: 401 → clear token, redirect /login
```

### Functions by domain

| Group | Functions |
|-------|-----------|
| **Posts** | `getPosts`, `getPost`, `createPost`, `updatePost`, `deletePost`, `searchPosts`, `approvePost`, `rejectPost`, … |
| **Auth** | `login`, `register`, `googleOAuthCallback` |
| **Users** | `getCurrentUser`, `updateMyProfile`, `getUsers`, … |
| **Comments** | `getComments`, `getAllComments`, `createComment`, `updateComment`, `deleteComment` |
| **Categories** | `getCategories`, `createCategory`, … |
| **Likes** | `toggleLike`, `getLikeCount`, `checkLiked` |
| **Bookmarks** | `toggleBookmark`, `getUserBookmarks`, `checkBookmark` |
| **Upload** | `uploadImage` (multipart FormData) |
| **Search** | `searchAll`, `searchPosts` |
| **Settings / Ads / Contact / Newsletter / Payments** | See file for full list |

**Rule:** Add new backend endpoints here first, then call from components.

---

## 6. Configuration and environment

File: `config.js`

```javascript
export const API_BASE_URL = `${API_ROOT}/api`;
export const UPLOADS_BASE_URL = `${API_ROOT}/uploads`;
export const SITE_URL = process.env.REACT_APP_SITE_URL || 'http://localhost:3000';

export function uploadUrl(path) { ... }
export function resolveUploadUrl(urlOrPath) { ... }
```

| Variable | Set in | Purpose |
|----------|--------|---------|
| `REACT_APP_API_URL` | `.env.production` / Docker build | Backend origin (no `/api` suffix) |
| `REACT_APP_SITE_URL` | Same | Canonical URL for SEO |
| `REACT_APP_GOOGLE_CLIENT_ID` | Same | Google Sign-In |

**Important:** React env vars are **baked in at build time**. Changing them requires rebuild (`npm run build` or Docker nginx rebuild).

---

## 7. Components reference

### Pages

| Component | Purpose |
|-----------|---------|
| `MagazinePostList` | Home — card grid, filters, search, ads |
| `PostDetail` | Single post, comments, likes, bookmarks, reading progress |
| `PostForm` | Create/edit post — rich text, image, SEO, YouTube |
| `Login` / `Register` | Authentication |
| `ProfileSetup` | First-time profile after Google OAuth |
| `UserProfile` | Edit profile, avatar, password |
| `CategoryList` / `SubCategoryList` | Category admin |
| `UserList` | Admin user management |
| `PostReviewPage` | Editor approval queue |
| `PostmarksPage` | Saved bookmarks |
| `PostStatistics` | View analytics |
| `AdminSettings` / `AdminAds` | Site config |
| `WriteForLladlad` | Public contact form |
| `ProductsPage` | Razorpay payment demo |

### Shared UI

| Component | Purpose |
|-----------|---------|
| `Navbar` | In `App.js` — logo, categories, search, login |
| `Sidebar` | Slide-out nav, postmarks, social, newsletter |
| `Footer` | Dynamic footer from site settings |
| `ProtectedRoute` | Auth/role wrapper |
| `RichTextEditor` | contentEditable HTML editor |
| `CommentSection` | Nested comments (max depth 3 in UI) |
| `YouTubeEmbed` | Responsive iframe |
| `SEO` / `StructuredData` | Meta tags + JSON-LD |
| `AdPlacement` | Renders ad slots by position |
| `Logo` | Brand image with fallback |

### Legacy / unused in routes
`PostList.js` — older list view; home uses `MagazinePostList` instead.

---

## 8. Key user flows

### Login (password)

```
/login → submit → AuthContext.login()
  → POST /api/auth/login
  → store token → redirect / or pending bookmark
```

### Login (Google)

```
Google GIS popup → JWT credential
  → AuthContext.googleLogin()
  → POST /api/oauth2/google/callback
  → if new user → /profile/setup
  → else → home
```

### Create post

```
/posts/new (ProtectedRoute)
  → load categories
  → RichTextEditor + optional uploadImage
  → POST /api/posts
  → USER role → PENDING_REVIEW on server
  → redirect home
```

### Comment thread

```
PostDetail → CommentSection
  → GET /api/comments/post/{id}/all (tree)
  → POST with content (+ parentId for reply)
  → max 3 levels in UI
```

### Bookmark flow

```
Guest clicks bookmark → login prompt
  → pendingBookmark in localStorage
  → after login → redirect to post + toggle bookmark
```

---

## 9. Styling and layout

- **Global CSS:** `App.css` — navbar, magazine grid, cards, forms
- **Layout class:** `magazine-layout` — sidebar overlay + main content
- **Color palette:** Navy blue header (`#1e3a5f`), white cards, light gray background
- **Responsive:** CSS grid/flex; sidebar drawer on mobile

No CSS framework (Bootstrap/Tailwind) — custom CSS for full control.

---

## 10. Making changes safely

| Task | Files to touch |
|------|----------------|
| New page | `components/NewPage.js` + route in `App.js` + optional `ProtectedRoute` |
| New API call | Function in `services/api.js` + use in component |
| New admin feature | Component + `ProtectedRoute requireAdmin` + backend endpoint |
| Image from backend | Use `uploadUrl()` from `config.js` — never hardcode localhost |
| SEO for new page | Add `<SEO title=... description=... />` component |
| Public vs auth | Wrap route or check `useAuth().user` inside component |

See also: [ARCHITECTURE.md](./ARCHITECTURE.md) · [BACKEND.md](./BACKEND.md) · [DATABASE.md](./DATABASE.md)
