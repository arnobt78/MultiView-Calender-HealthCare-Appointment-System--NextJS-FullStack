import { describe, expect, it, vi, beforeEach } from "vitest";

const { findFirst } = vi.hoisted(() => ({
  findFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    payment: { findFirst },
  },
}));

import { isStripePaymentAlreadyRecorded } from "@/lib/payments-webhook-idempotency";

describe("isStripePaymentAlreadyRecorded", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when payment row exists", async () => {
    findFirst.mockResolvedValue({ id: "p1" });
    await expect(isStripePaymentAlreadyRecorded("pi_123")).resolves.toBe(true);
  });

  it("returns false when no row", async () => {
    findFirst.mockResolvedValue(null);
    await expect(isStripePaymentAlreadyRecorded("pi_456")).resolves.toBe(false);
  });
});
