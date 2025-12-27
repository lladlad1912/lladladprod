# Rate Limiting

## Goal

Reduce spam/abuse by applying a simple **per-IP token bucket** limiter.

## Where it lives

- Filter: `src/main/java/com/blogapp/security/RateLimitingFilter.java`
- Wired into Spring Security chain in:
  - `src/main/java/com/blogapp/security/SecurityConfig.java`

## Behavior

- Only applies to requests under `/api/**`
- Does **not** rate-limit:
  - `OPTIONS` preflight
  - static assets like `/uploads/**`
- Uses separate buckets for:
  - **GET** requests
  - **WRITE** requests (POST/PUT/DELETE/etc)

## Config

Configured in `src/main/resources/application.properties`:

- `rate.limit.get.capacity`
- `rate.limit.get.refill-tokens`
- `rate.limit.get.refill-period-ms`
- `rate.limit.write.capacity`
- `rate.limit.write.refill-tokens`
- `rate.limit.write.refill-period-ms`
- `rate.limit.cache-expire-minutes`

## Response

When exceeded:

- HTTP `429`
- JSON body: `{"message":"Too many requests. Please slow down."}`
- Headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`

## Notes

This is intentionally minimal. For production you might:

- add per-user limits (in addition to per-IP)
- add route-specific limits (e.g., tighter on `/comments`, `/auth`)
- integrate a distributed store (Redis) if you run multiple backend instances











