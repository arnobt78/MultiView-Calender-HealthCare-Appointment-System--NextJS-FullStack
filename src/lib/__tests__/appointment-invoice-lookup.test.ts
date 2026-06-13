import { describe, expect, it } from "vitest";
import {
  buildAppointmentInvoiceDisplayMap,
  getInvoiceForAppointment,
  resolveAppointmentListBillingBadges,
  resolveLatestInvoicePayment,
} from "@/lib/appointment-invoice-lookup";
import type { InvoiceRow } from "@/lib/billing-types";

const invoices: InvoiceRow[] = [
  {
    id: "inv-1",
    appointment_id: "appt-1",
    user_id: "u1",
    amount: 10000,
    currency: "eur",
    status: "paid",
    created_at: "2026-06-01T00:00:00.000Z",
    payments: [
      {
        id: "p1",
        amount: 10000,
        status: "succeeded",
        created_at: "2026-06-02T00:00:00.000Z",
      },
      {
        id: "p2",
        amount: 10000,
        status: "refunded",
        created_at: "2026-06-03T00:00:00.000Z",
      },
    ],
  },
];

describe("appointment-invoice-lookup", () => {
  it("getInvoiceForAppointment finds linked row", () => {
    expect(getInvoiceForAppointment(invoices, "appt-1")?.id).toBe("inv-1");
    expect(getInvoiceForAppointment(invoices, "missing")).toBeUndefined();
  });

  it("buildAppointmentInvoiceDisplayMap maps display status", () => {
    const map = buildAppointmentInvoiceDisplayMap(invoices, ["appt-1", "appt-2"]);
    expect(map.get("appt-1")).toBe("paid");
    expect(map.has("appt-2")).toBe(false);
  });

  it("resolveLatestInvoicePayment picks newest created_at", () => {
    const latest = resolveLatestInvoicePayment(invoices[0].payments);
    expect(latest?.status).toBe("refunded");
  });

  describe("resolveAppointmentListBillingBadges", () => {
    it("paid + succeeded shows payment tick only", () => {
      expect(
        resolveAppointmentListBillingBadges({
          invoiceDisplayStatus: "paid",
          latestPaymentStatus: "succeeded",
        })
      ).toEqual({ showInvoice: false, showPayment: true });
    });

    it("refunded + refunded shows payment only", () => {
      expect(
        resolveAppointmentListBillingBadges({
          invoiceDisplayStatus: "refunded",
          latestPaymentStatus: "refunded",
        })
      ).toEqual({ showInvoice: false, showPayment: true });
    });

    it("sent + pending shows both", () => {
      expect(
        resolveAppointmentListBillingBadges({
          invoiceDisplayStatus: "sent",
          latestPaymentStatus: "pending",
        })
      ).toEqual({ showInvoice: true, showPayment: true });
    });

    it("invoice only when no payment row", () => {
      expect(
        resolveAppointmentListBillingBadges({
          invoiceDisplayStatus: "cancelled",
          latestPaymentStatus: null,
        })
      ).toEqual({ showInvoice: true, showPayment: false });
    });

    it("payment only when no invoice display status", () => {
      expect(
        resolveAppointmentListBillingBadges({
          invoiceDisplayStatus: null,
          latestPaymentStatus: "succeeded",
        })
      ).toEqual({ showInvoice: false, showPayment: true });
    });
  });
});
