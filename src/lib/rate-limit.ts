/**
 * Rate Limiter Middleware
 * 
 * Uses in-memory store (for single-instance) or Redis (for multi-instance).
 * Configurable limits per route group.
 */

import { redis } from "./redis";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

const memoryStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check rate limit for an identifier (e.g. IP + route)
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 60,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const resetAt = new Date(Date.now() + windowSeconds * 1000);

  // Use Redis if available
  if (redis.isConfigured) {
    const key = `ratelimit:${identifier}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    return {
      allowed: (count || 0) <= maxRequests,
      remaining: Math.max(0, maxRequests - (count || 0)),
      resetAt,
    };
  }

  // Fallback: in-memory store
  const now = Date.now();
  const entry = memoryStore.get(identifier);

  if (!entry || entry.resetAt <= now) {
    memoryStore.set(identifier, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  entry.count++;
  return {
    allowed: entry.count <= maxRequests,
    remaining: Math.max(0, maxRequests - entry.count),
    resetAt: new Date(entry.resetAt),
  };
}

/**
 * Rate limit configurations by route group
 */
export const RATE_LIMITS = {
  api: { maxRequests: 100, windowSeconds: 60 },
  auth: { maxRequests: 10, windowSeconds: 60 },
  ai: { maxRequests: 20, windowSeconds: 60 },
  webhook: { maxRequests: 200, windowSeconds: 60 },
} as const;
