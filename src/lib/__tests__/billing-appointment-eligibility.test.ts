import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: { findUnique: vi.fn() },
    invoice: { findFirst: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  resolveAppointmentBillingSummary,
  resolveInvoiceDisplayStatus,
  isBlockingInvoiceStatus,
  assertAppointmentEligibleForNewInvoice,
} from "@/lib/billing-appointment-eligibility";

describe("billing-appointment-eligibility", () => {
  it("blocks visits with paid or open invoices", () => {
    expect(isBlockingInvoiceStatus("paid")).toBe(true);
    expect(isBlockingInvoiceStatus("draft")).toBe(true);
    expect(resolveAppointmentBillingSummary({
      id: "inv-1",
      status: "paid",
      amount: 6900,
      currency: "eur",
      payments: [{ status: "succeeded" }],
    }).eligible).toBe(false);
  });

  it("allows rebill after cancelled", () => {
    const summary = resolveAppointmentBillingSummary({
      id: "inv-2",
      status: "cancelled",
      amount: 6900,
      currency: "eur",
      payments: [{ status: "refunded" }],
    });
    expect(summary.eligible).toBe(true);
    expect(summary.displayStatus).toBe("refunded");
  });

  it("shows refunded display when payment refunded", () => {
    expect(
      resolveInvoiceDisplayStatus({
        status: "cancelled",
        payments: [{ status: "refunded" }],
      })
    ).toBe("refunded");
  });

  it("no invoice means eligible", () => {
    expect(resolveAppointmentBillingSummary(null).eligible).toBe(true);
  });

  describe("assertAppointmentEligibleForNewInvoice", () => {
    beforeEach(() => {
      vi.mocked(prisma.appointment.findUnique).mockReset();
      vi.mocked(prisma.invoice.findFirst).mockReset();
    });

    it("rejects cancelled visit before blocking invoice check", async () => {
      vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
        status: "cancelled",
      } as never);

      const result = await assertAppointmentEligibleForNewInvoice("appt-1");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(409);
        expect(result.message).toContain("cancelled");
      }
      expect(prisma.invoice.findFirst).not.toHaveBeenCalled();
    });

    it("allows open visit with no blocking invoice", async () => {
      vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
        status: "pending",
      } as never);
      vi.mocked(prisma.invoice.findFirst).mockResolvedValue(null);

      const result = await assertAppointmentEligibleForNewInvoice("appt-1");
      expect(result).toEqual({ ok: true });
    });
  });
});
