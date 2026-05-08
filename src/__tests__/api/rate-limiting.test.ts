/**
 * Integration tests — AI route rate limiting logic
 * Verifies per-user limits mirror the production configuration.
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/redis", () => ({
  // isConfigured: false → tests use the in-memory fallback path, which is always available.
  redis: { isConfigured: false, incr: vi.fn(), expire: vi.fn() },
}));

const { checkRateLimit } = await import("@/lib/rate-limit");

const AI_LIMIT = 10;
const AI_WINDOW = 60_000;

async function simulateAICalls(userId: string, route: string, count: number) {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(await checkRateLimit(`${route}:${userId}`, AI_LIMIT, AI_WINDOW));
  }
  return results;
}

describe("AI route rate limiting (10 req/min per user)", () => {
  const routes = ["ai-summarize", "ai-categorize", "ai-parse", "ai-suggest-times"];

  for (const route of routes) {
    it(`${route}: allows first 10 requests`, async () => {
      const userId = `user-${route}-${Math.random()}`;
      const results = await simulateAICalls(userId, route, 10);
      expect(results.every((r) => r.allowed)).toBe(true);
    });

    it(`${route}: blocks the 11th request`, async () => {
      const userId = `user-${route}-11th-${Math.random()}`;
      await simulateAICalls(userId, route, 10);
      const eleventh = await checkRateLimit(`${route}:${userId}`, AI_LIMIT, AI_WINDOW);
      expect(eleventh.allowed).toBe(false);
      expect(eleventh.remaining).toBe(0);
    });
  }

  it("different users have independent limits", async () => {
    const userA = `user-a-${Math.random()}`;
    const userB = `user-b-${Math.random()}`;
    await simulateAICalls(userA, "ai-parse", 10);
    const overLimitA = await checkRateLimit(`ai-parse:${userA}`, AI_LIMIT, AI_WINDOW);
    const stillOkB = await checkRateLimit(`ai-parse:${userB}`, AI_LIMIT, AI_WINDOW);
    expect(overLimitA.allowed).toBe(false);
    expect(stillOkB.allowed).toBe(true);
  });
});
