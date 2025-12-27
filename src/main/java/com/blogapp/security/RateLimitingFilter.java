package com.blogapp.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

/**
 * Simple per-IP token bucket rate limiter to reduce spam traffic.
 *
 * Defaults:
 * - capacity: 5
 * - refillTokens: 5 per 1 second
 *
 * Returns 429 when limit is exceeded.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitingFilter extends OncePerRequestFilter {

    private static class Bucket {
        private long tokens;
        private long lastRefillNanos;

        private Bucket(long capacity) {
            this.tokens = capacity;
            this.lastRefillNanos = System.nanoTime();
        }
    }

    private final Cache<String, Bucket> buckets;

    // GET limits
    private final long getCapacity;
    private final long getRefillTokens;
    private final long getRefillPeriodNanos;

    // Non-GET limits (POST/PUT/DELETE, etc.)
    private final long writeCapacity;
    private final long writeRefillTokens;
    private final long writeRefillPeriodNanos;

    public RateLimitingFilter(
            @Value("${rate.limit.get.capacity:30}") long getCapacity,
            @Value("${rate.limit.get.refill-tokens:30}") long getRefillTokens,
            @Value("${rate.limit.get.refill-period-ms:1000}") long getRefillPeriodMs,
            @Value("${rate.limit.write.capacity:10}") long writeCapacity,
            @Value("${rate.limit.write.refill-tokens:10}") long writeRefillTokens,
            @Value("${rate.limit.write.refill-period-ms:1000}") long writeRefillPeriodMs,
            @Value("${rate.limit.cache-expire-minutes:30}") long cacheExpireMinutes
    ) {
        this.getCapacity = Math.max(1, getCapacity);
        this.getRefillTokens = Math.max(1, getRefillTokens);
        this.getRefillPeriodNanos = TimeUnit.MILLISECONDS.toNanos(Math.max(1, getRefillPeriodMs));

        this.writeCapacity = Math.max(1, writeCapacity);
        this.writeRefillTokens = Math.max(1, writeRefillTokens);
        this.writeRefillPeriodNanos = TimeUnit.MILLISECONDS.toNanos(Math.max(1, writeRefillPeriodMs));

        this.buckets = Caffeine.newBuilder()
                .expireAfterAccess(Duration.ofMinutes(Math.max(1, cacheExpireMinutes)))
                .maximumSize(50_000)
                .build();
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        final String method = Objects.requireNonNull(request.getMethod());
        // Never rate-limit preflight
        if (HttpMethod.OPTIONS.matches(method)) return true;
        // Only rate-limit API calls; do NOT rate-limit static assets like /uploads/**
        String uri = request.getRequestURI();
        return uri == null || !uri.startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String method = Objects.requireNonNull(request.getMethod());
        final String key = String.valueOf(resolveClientKey(request));
        final boolean isGet = HttpMethod.GET.matches(method);
        final String bucketKey = (isGet ? "GET:" : "WRITE:") + key;

        final long capacity = isGet ? getCapacity : writeCapacity;
        final long refillTokens = isGet ? getRefillTokens : writeRefillTokens;
        final long refillPeriodNanos = isGet ? getRefillPeriodNanos : writeRefillPeriodNanos;

        Bucket bucket = buckets.get(bucketKey, k -> new Bucket(capacity));
        boolean allowed;
        long remaining;

        synchronized (bucket) {
            refill(bucket, capacity, refillTokens, refillPeriodNanos);
            if (bucket.tokens > 0) {
                bucket.tokens--;
                allowed = true;
            } else {
                allowed = false;
            }
            remaining = bucket.tokens;
        }

        response.setHeader("X-RateLimit-Limit", String.valueOf(capacity));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, remaining)));

        if (!allowed) {
            response.setStatus(429);
            // Best-effort Retry-After in seconds (based on refill period)
            long retryAfterSeconds = Math.max(1, TimeUnit.NANOSECONDS.toSeconds(refillPeriodNanos));
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Too many requests. Please slow down.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void refill(Bucket bucket, long capacity, long refillTokens, long refillPeriodNanos) {
        long now = System.nanoTime();
        long elapsed = now - bucket.lastRefillNanos;
        if (elapsed < refillPeriodNanos) return;

        long periods = elapsed / refillPeriodNanos;
        long toAdd = periods * refillTokens;
        if (toAdd > 0) {
            bucket.tokens = Math.min(capacity, bucket.tokens + toAdd);
            bucket.lastRefillNanos = bucket.lastRefillNanos + (periods * refillPeriodNanos);
        }
    }

    private String resolveClientKey(HttpServletRequest request) {
        // Basic support for proxies
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            String first = xff.split(",")[0].trim();
            if (!first.isBlank()) return first;
        }
        String ip = request.getRemoteAddr();
        return (ip == null || ip.isBlank()) ? "unknown" : ip;
    }
}


