import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/redis", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

import { redis } from "@/lib/redis";
import { expireStoredCheckoutSessionForInvoice } from "@/lib/stripe-checkout-session-track";

describe("expireStoredCheckoutSessionForInvoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_mock";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("ok", { status: 200 }))
    );
  });

  it("expires prior session id from redis before new checkout", async () => {
    vi.mocked(redis.get).mockResolvedValue("cs_old_123");
    await expireStoredCheckoutSessionForInvoice("inv-1");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("cs_old_123/expire"),
      expect.objectContaining({ method: "POST" })
    );
    expect(redis.del).toHaveBeenCalled();
  });

  it("no-op when redis has no prior session", async () => {
    vi.mocked(redis.get).mockResolvedValue(null);
    await expireStoredCheckoutSessionForInvoice("inv-2");
    expect(fetch).not.toHaveBeenCalled();
  });
});
