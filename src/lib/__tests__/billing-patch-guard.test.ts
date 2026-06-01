import { describe, expect, it } from "vitest";
import { rejectPatchStatusPaid } from "@/lib/billing-patch-guard";

describe("billing-patch-guard", () => {
  it("rejects PATCH to paid", () => {
    const result = rejectPatchStatusPaid("paid");
    expect(result.ok).toBe(false);
  });

  it("allows other statuses", () => {
    expect(rejectPatchStatusPaid("sent").ok).toBe(true);
    expect(rejectPatchStatusPaid(undefined).ok).toBe(true);
  });
});
