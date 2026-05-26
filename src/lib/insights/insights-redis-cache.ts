/**
 * Server-side Redis cache for GET /api/insights — same TTL/invalidation pattern as dashboard overview.
 * Client freshness still driven by TanStack `insights.root` invalidation on CRUD.
 */

import { redis } from "@/lib/redis";
import type { InsightsPayload } from "@/lib/insights-data";
import type { InsightsQueryKey } from "@/lib/insights-scope";

/** Seconds — matches dashboard overview; insights aggregates are similarly expensive. */
export const INSIGHTS_REDIS_CACHE_TTL_SECONDS = 90;

const VERSION_KEY_PREFIX = "insights:ver:";

export function insightsCacheVersionKey(viewerUserId: string): string {
  return `${VERSION_KEY_PREFIX}${viewerUserId}`;
}

/** Per viewer + filter variant — scope/period/doctorId must match queryKeys.insights.filter(query). */
export function buildInsightsRedisCacheKey(
  viewerUserId: string,
  version: string,
  query: InsightsQueryKey
): string {
  const doctorSegment = query.doctorId?.trim() || "none";
  return `insights:v1:${viewerUserId}:${version}:${query.scope}:${query.period}:${doctorSegment}`;
}

export async function readInsightsCacheVersion(viewerUserId: string): Promise<string> {
  if (!redis.isConfigured) return "0";
  const version = await redis.get(insightsCacheVersionKey(viewerUserId));
  return version ?? "0";
}

export async function readInsightsFromRedis(cacheKey: string): Promise<InsightsPayload | null> {
  if (!redis.isConfigured) return null;
  const raw = await redis.get(cacheKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as InsightsPayload;
  } catch {
    return null;
  }
}

export async function writeInsightsToRedis(
  cacheKey: string,
  payload: InsightsPayload
): Promise<void> {
  if (!redis.isConfigured) return;
  await redis.set(cacheKey, JSON.stringify(payload), INSIGHTS_REDIS_CACHE_TTL_SECONDS);
}

/**
 * Read-through cache — `loader` runs Prisma aggregates on miss.
 * Used by GET /api/insights and SSR prefetchInsights.
 */
export async function fetchInsightsWithRedisCache(
  viewerUserId: string,
  query: InsightsQueryKey,
  loader: () => Promise<InsightsPayload>
): Promise<{ data: InsightsPayload; cacheHit: boolean }> {
  const version = await readInsightsCacheVersion(viewerUserId);
  const cacheKey = buildInsightsRedisCacheKey(viewerUserId, version, query);
  const cached = await readInsightsFromRedis(cacheKey);
  if (cached) {
    return { data: cached, cacheHit: true };
  }
  const data = await loader();
  await writeInsightsToRedis(cacheKey, data);
  return { data, cacheHit: false };
}
