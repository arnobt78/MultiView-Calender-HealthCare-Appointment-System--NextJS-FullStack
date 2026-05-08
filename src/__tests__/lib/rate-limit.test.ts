/**
 * Unit tests — rate-limit.ts
 * Tests the in-memory fallback (Redis not configured in CI).
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Force in-memory path by making redis.isConfigured false
vi.mock("@/lib/redis", () => ({
  redis: { isConfigured: false, incr: vi.fn(), expire: vi.fn() },
}));

// Re-import after mock is set up
const { checkRateLimit } = await import("@/lib/rate-limit");

describe("checkRateLimit (in-memory fallback)", () => {
  it("allows first request", async () => {
    const result = await checkRateLimit("test:unit:1", 3, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("allows up to maxRequests", async () => {
    const key = "test:unit:2";
    await checkRateLimit(key, 3, 60_000);
    await checkRateLimit(key, 3, 60_000);
    const third = await checkRateLimit(key, 3, 60_000);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it("blocks after maxRequests exceeded", async () => {
    const key = "test:unit:3";
    await checkRateLimit(key, 2, 60_000);
    await checkRateLimit(key, 2, 60_000);
    const over = await checkRateLimit(key, 2, 60_000);
    expect(over.allowed).toBe(false);
    expect(over.remaining).toBe(0);
  });

  it("resets after window expires", async () => {
    const key = "test:unit:4";
    // Use tiny window so we can expire it
    await checkRateLimit(key, 1, 1);
    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 5));
    const after = await checkRateLimit(key, 1, 60_000);
    expect(after.allowed).toBe(true);
  });
});
