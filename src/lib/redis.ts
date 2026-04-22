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

async function redisCommand(command: string[]): Promise<any> {
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
    return redisCommand(["GET", key]);
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
    return redisCommand(["INCR", key]);
  },

  async expire(key: string, seconds: number): Promise<void> {
    await redisCommand(["EXPIRE", key, String(seconds)]);
  },

  async sadd(key: string, ...members: string[]): Promise<number | null> {
    return redisCommand(["SADD", key, ...members]);
  },

  async srem(key: string, ...members: string[]): Promise<number | null> {
    return redisCommand(["SREM", key, ...members]);
  },

  async smembers(key: string): Promise<string[]> {
    return (await redisCommand(["SMEMBERS", key])) || [];
  },

  async publish(channel: string, message: string): Promise<void> {
    await redisCommand(["PUBLISH", channel, message]);
  },
};
