import { describe, expect, it } from "vitest";
import {
  assertInvoiceStatusTransition,
  canPatientPayInvoiceStatus,
  canTransitionInvoiceStatus,
} from "@/lib/billing-status";

describe("billing-status", () => {
  it("allows draft to sent", () => {
    expect(canTransitionInvoiceStatus("draft", "sent")).toBe(true);
  });

  it("blocks paid to draft", () => {
    expect(canTransitionInvoiceStatus("paid", "draft")).toBe(false);
  });

  it("patient payable statuses", () => {
    expect(canPatientPayInvoiceStatus("sent")).toBe(true);
    expect(canPatientPayInvoiceStatus("paid")).toBe(false);
  });

  it("assertInvoiceStatusTransition returns message on invalid", () => {
    const result = assertInvoiceStatusTransition("paid", "draft");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("paid");
    }
  });
});
