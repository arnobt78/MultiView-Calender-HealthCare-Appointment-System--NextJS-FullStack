import { describe, expect, it } from "vitest";
import {
  canOfferRefundOnAppointmentCancel,
  defaultRefundCheckedOnCancel,
  paidInvoiceSupportsStripeRefund,
  resolvePaidInvoiceForAppointment,
} from "@/lib/appointment-cancel-refund";

const paidStripe = {
  id: "inv-1",
  status: "paid",
  amount: 6900,
  currency: "eur",
  user_id: "doc-1",
  appointment_id: "appt-1",
  payments: [{ status: "succeeded", stripe_payment_id: "pi_123" }],
};

describe("appointment-cancel-refund", () => {
  it("resolves paid invoice for appointment", () => {
    expect(resolvePaidInvoiceForAppointment([paidStripe], "appt-1")?.id).toBe("inv-1");
    expect(resolvePaidInvoiceForAppointment([paidStripe], "other")).toBeNull();
  });

  it("requires Stripe payment for refund offer", () => {
    expect(paidInvoiceSupportsStripeRefund(paidStripe)).toBe(true);
    expect(
      paidInvoiceSupportsStripeRefund({
        ...paidStripe,
        payments: [{ status: "succeeded" }],
      })
    ).toBe(false);
  });

  it("offers refund for admin and linked doctor issuer", () => {
    expect(
      canOfferRefundOnAppointmentCancel({
        role: "admin",
        userId: "admin-1",
        paidInvoice: paidStripe,
      })
    ).toBe(true);
    expect(
      canOfferRefundOnAppointmentCancel({
        role: "doctor",
        userId: "doc-1",
        paidInvoice: paidStripe,
      })
    ).toBe(true);
    expect(
      canOfferRefundOnAppointmentCancel({
        role: "doctor",
        userId: "doc-other",
        paidInvoice: paidStripe,
      })
    ).toBe(false);
  });

  it("defaults refund checkbox on when offer is available", () => {
    expect(
      defaultRefundCheckedOnCancel({
        role: "doctor",
        userId: "doc-1",
        paidInvoice: paidStripe,
      })
    ).toBe(true);
  });
});
