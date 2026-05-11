/**
 * Integration-style test — Redis rate-limit branch uses PTTL for resetTime.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const { incrMock, expireMock, pttlMock } = vi.hoisted(() => ({
  incrMock: vi.fn(),
  expireMock: vi.fn(),
  pttlMock: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({
  redis: {
    isConfigured: true,
    incr: incrMock,
    expire: expireMock,
    pttl: pttlMock,
  },
}));

describe("checkRateLimit Redis path + PTTL", () => {
  beforeEach(() => {
    incrMock.mockReset();
    expireMock.mockReset();
    pttlMock.mockReset();
  });

  it("uses now + pttl when PTTL is positive", async () => {
    incrMock.mockResolvedValue(2);
    pttlMock.mockResolvedValue(45_000);

    const { checkRateLimit } = await import("@/lib/rate-limit");
    const before = Date.now();
    const result = await checkRateLimit("test:pttl:1", 10, 60_000);

    expect(result.allowed).toBe(true);
    expect(result.resetTime).toBeGreaterThanOrEqual(before + 45_000);
    expect(result.resetTime).toBeLessThanOrEqual(before + 46_000);
    expect(pttlMock).toHaveBeenCalledWith("ratelimit:test:pttl:1");
  });

  it("falls back to window end when PTTL is null", async () => {
    incrMock.mockResolvedValue(1);
    pttlMock.mockResolvedValue(null);

    const { checkRateLimit } = await import("@/lib/rate-limit");
    const before = Date.now();
    const windowMs = 60_000;
    const result = await checkRateLimit("test:pttl:2", 10, windowMs);

    expect(result.resetTime).toBeGreaterThanOrEqual(before + windowMs - 100);
    expect(result.resetTime).toBeLessThanOrEqual(before + windowMs + 100);
  });
});
