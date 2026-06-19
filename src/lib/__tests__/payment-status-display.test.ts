import { describe, expect, it } from "vitest";
import {
  formatPaymentReferenceLabel,
  isDemoCuratedStripePaymentId,
  paymentAmountTextClassForStatus,
  resolvePaymentDisplayLabel,
} from "@/lib/payment-status-display";

describe("payment-status-display", () => {
  it("maps succeeded to Paid label", () => {
    expect(resolvePaymentDisplayLabel("succeeded")).toBe("Paid");
  });

  it("tints succeeded amount emerald", () => {
    expect(paymentAmountTextClassForStatus("succeeded")).toContain("emerald");
  });

  it("detects demo curated payment intent ids", () => {
    expect(isDemoCuratedStripePaymentId("pi_demo_curated_v3_paid_04")).toBe(true);
    expect(isDemoCuratedStripePaymentId("pi_3abc1234567890xyz")).toBe(false);
  });

  it("formats demo curated paid stripe id", () => {
    expect(formatPaymentReferenceLabel("pi_demo_curated_paid_01")).toEqual({
      label: "Demo card payment · Paid",
      title: "pi_demo_curated_paid_01",
    });
  });

  it("formats demo curated refund stripe id", () => {
    expect(formatPaymentReferenceLabel("pi_demo_curated_ref_07")).toEqual({
      label: "Demo card payment · Refunded",
      title: "pi_demo_curated_ref_07",
    });
  });

  it("masks live stripe pi id", () => {
    const ref = formatPaymentReferenceLabel("pi_3abc1234567890xyz");
    expect(ref.label).toMatch(/^Stripe ····/);
    expect(ref.title).toBe("pi_3abc1234567890xyz");
  });
});
