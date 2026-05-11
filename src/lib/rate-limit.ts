/**
 * Rate Limiter — single source of truth for all API routes.
 *
 * Strategy:
 *  - Redis (Upstash) when configured: atomic, survives deploys, works across
 *    multiple serverless instances.
 *  - In-memory Map fallback: works in local dev without Redis credentials.
 *
 * windowMs uses milliseconds throughout to match constants.ts RATE_LIMITS
 * and be consistent with standard Node/browser timing APIs.
 */

import { redis } from "./redis";

interface RateLimitResult {
  /** Whether the request is within the rate limit window. */
  allowed: boolean;
  /** How many more requests are allowed before the window resets. */
  remaining: number;
  /** Epoch ms timestamp when the current window expires. */
  resetTime: number;
}

// In-memory fallback — cleared on server restart, not shared across instances.
const memoryStore = new Map<string, { count: number; resetTime: number }>();

// Purge stale in-memory entries every 5 minutes to avoid unbounded growth.
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of memoryStore.entries()) {
    if (now > val.resetTime) memoryStore.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Check whether `identifier` (e.g. `"login:<IP>"`) is within its rate limit.
 *
 * @param identifier  - Unique key, usually action + IP.
 * @param maxRequests - Maximum requests allowed in the window. Default 60.
 * @param windowMs    - Window length in **milliseconds**. Default 60 000 (1 min).
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 60,
  windowMs: number = 60_000
): Promise<RateLimitResult> {
  const now = Date.now();
  const resetTime = now + windowMs;

  // Redis path — preferred in production.
  if (redis.isConfigured) {
    const key = `ratelimit:${identifier}`;
    const windowSeconds = Math.ceil(windowMs / 1000);
    const count = await redis.incr(key);

    // Set TTL only on the first increment so the window is anchored correctly.
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    // Fail-closed: if Redis returned null (connection error / network issue),
    // treat as over-limit rather than letting every request through.
    if (count === null) {
      return { allowed: false, remaining: 0, resetTime };
    }

    // Align resetTime with the key's real TTL (window anchored on first INCR).
    let effectiveReset = resetTime;
    const pttlMs = await redis.pttl(key);
    if (typeof pttlMs === "number" && pttlMs > 0) {
      effectiveReset = now + pttlMs;
    }

    return {
      allowed: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetTime: effectiveReset,
    };
  }

  // In-memory fallback path.
  const entry = memoryStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    memoryStore.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  entry.count++;
  return {
    allowed: entry.count <= maxRequests,
    remaining: Math.max(0, maxRequests - entry.count),
    resetTime: entry.resetTime,
  };
}

/**
 * Extract the real client IP from a Next.js Request.
 *
 * Checks `x-forwarded-for` (Vercel/CDN) and `x-real-ip` (nginx) before
 * falling back to `"unknown"` for local dev or serverless environments
 * that don't expose a remote address.
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();

  const realIP = req.headers.get("x-real-ip");
  if (realIP) return realIP;

  return "unknown";
}
