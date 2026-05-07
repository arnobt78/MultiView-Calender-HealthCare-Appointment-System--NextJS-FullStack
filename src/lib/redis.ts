/**
 * Redis Client (Upstash)
 * 
 * Uses Upstash REST API for serverless-compatible Redis.
 * Falls back gracefully if Redis is not configured.
 * 
 * Env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || "";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";

const isConfigured = Boolean(REDIS_URL && REDIS_TOKEN);

async function redisCommand(command: string[]): Promise<unknown> {
  if (!isConfigured) return null;

  const response = await fetch(`${REDIS_URL}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    console.error("Redis error:", await response.text());
    return null;
  }

  const data = await response.json();
  return data.result;
}

export const redis = {
  isConfigured,

  async get(key: string): Promise<string | null> {
    const result = await redisCommand(["GET", key]);
    return typeof result === "string" ? result : null;
  },

  async set(key: string, value: string, exSeconds?: number): Promise<void> {
    if (exSeconds) {
      await redisCommand(["SET", key, value, "EX", String(exSeconds)]);
    } else {
      await redisCommand(["SET", key, value]);
    }
  },

  async del(key: string): Promise<void> {
    await redisCommand(["DEL", key]);
  },

  async incr(key: string): Promise<number | null> {
    const result = await redisCommand(["INCR", key]);
    return typeof result === "number" ? result : null;
  },

  async expire(key: string, seconds: number): Promise<void> {
    await redisCommand(["EXPIRE", key, String(seconds)]);
  },

  async sadd(key: string, ...members: string[]): Promise<number | null> {
    const result = await redisCommand(["SADD", key, ...members]);
    return typeof result === "number" ? result : null;
  },

  async srem(key: string, ...members: string[]): Promise<number | null> {
    const result = await redisCommand(["SREM", key, ...members]);
    return typeof result === "number" ? result : null;
  },

  async smembers(key: string): Promise<string[]> {
    const result = await redisCommand(["SMEMBERS", key]);
    return Array.isArray(result) ? (result as string[]) : [];
  },

  async publish(channel: string, message: string): Promise<void> {
    await redisCommand(["PUBLISH", channel, message]);
  },

  /**
   * Bust the dashboard overview cache for a specific user.
   *
   * Call this on the server after any mutation that changes data surfaced
   * by GET /api/dashboard/overview (appointments, invoices, patients, etc.)
   * so the next request re-runs the Prisma aggregation instead of returning
   * stale cached values. If Redis is not configured this is a no-op.
   *
   * Cache key pattern: `dashboard:overview:<userId>`
   */
  async invalidateDashboardOverview(userId: string): Promise<void> {
    await redisCommand(["DEL", `dashboard:overview:${userId}`]);
  },
};
