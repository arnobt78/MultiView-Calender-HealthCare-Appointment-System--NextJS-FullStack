import { describe, it, expect } from "vitest";
import {
  BILLING_NOTIFICATION_TYPES,
  isBillingNotificationType,
} from "@/lib/billing-notify";

describe("isBillingNotificationType", () => {
  it("includes invoice_draft for SSE invoice cache bust", () => {
    expect(BILLING_NOTIFICATION_TYPES).toContain("invoice_draft");
    expect(isBillingNotificationType("invoice_draft")).toBe(true);
  });

  it("rejects non-billing notification types", () => {
    expect(isBillingNotificationType("status_update")).toBe(false);
  });
});
