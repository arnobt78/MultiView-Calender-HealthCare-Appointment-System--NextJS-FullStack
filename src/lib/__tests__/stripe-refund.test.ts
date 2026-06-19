import { describe, expect, it } from "vitest";
import { createRefund } from "@/lib/stripe";

describe("createRefund", () => {
  it("skips Stripe API for demo curated payment intent ids", async () => {
    const result = await createRefund("pi_demo_curated_v3_paid_04");
    expect(result.id).toBe("re_demo_pi_demo_curated_v3_paid_04");
  });
});
