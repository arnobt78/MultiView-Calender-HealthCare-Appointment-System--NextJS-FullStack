import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: { findUnique: vi.fn() },
    invoice: { create: vi.fn() },
  },
}));

vi.mock("@/lib/invoice-access", () => ({
  canCreateInvoiceForAppointment: vi.fn(),
  resolveInvoiceBillingUserId: vi.fn(),
}));

vi.mock("@/lib/billing-appointment-eligibility", () => ({
  assertAppointmentEligibleForNewInvoice: vi.fn(),
}));

vi.mock("@/lib/invoice-organization-resolve", () => ({
  resolveInvoiceOrganizationId: vi.fn(),
}));

vi.mock("@/lib/billing-cache", () => ({
  invalidateBillingRedisCaches: vi.fn(),
  resolvePatientPortalUserIdForAppointment: vi.fn(),
}));

vi.mock("@/lib/billing-notify-patient", () => ({
  notifyPatientDraftInvoiceCreated: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import {
  canCreateInvoiceForAppointment,
  resolveInvoiceBillingUserId,
} from "@/lib/invoice-access";
import { assertAppointmentEligibleForNewInvoice } from "@/lib/billing-appointment-eligibility";
import { resolveInvoiceOrganizationId } from "@/lib/invoice-organization-resolve";
import { maybeCreateDraftInvoiceForCompletedVisit } from "@/lib/billing-auto-draft";
import { notifyPatientDraftInvoiceCreated } from "@/lib/billing-notify-patient";

const APPT = "appt-1";
const DOC = "doc-1";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("maybeCreateDraftInvoiceForCompletedVisit", () => {
  it("skips when blocking invoice exists", async () => {
    vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
      id: APPT,
      title: "Visit",
      start: new Date(),
      status: "done",
      owner_id: DOC,
      treating_physician_id: DOC,
      patient: { firstname: "A", lastname: "B", email: "p@test.com" },
      appointment_type: null,
      owner: { consultation_fee: 5000 },
      treating_physician: { consultation_fee: 5000 },
    } as never);
    vi.mocked(canCreateInvoiceForAppointment).mockResolvedValue(true);
    vi.mocked(assertAppointmentEligibleForNewInvoice).mockResolvedValue({
      ok: false,
      status: 409,
      message: "dup",
      invoiceId: "inv-1",
    });

    const result = await maybeCreateDraftInvoiceForCompletedVisit(APPT, {
      userId: DOC,
      email: "d@test.com",
      role: "doctor",
    });

    expect(result.created).toBe(false);
    expect(prisma.invoice.create).not.toHaveBeenCalled();
  });

  it("creates draft when eligible and fee set", async () => {
    vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
      id: APPT,
      title: "Visit",
      start: new Date("2026-06-01"),
      status: "done",
      owner_id: DOC,
      treating_physician_id: DOC,
      patient: { firstname: "Demo", lastname: "Patient", email: "p@test.com" },
      appointment_type: { name: "Follow-up", price_cents: 9250 },
      patient_id: "pat-1",
      owner: { consultation_fee: 5900 },
      treating_physician: { consultation_fee: 5900 },
    } as never);
    vi.mocked(canCreateInvoiceForAppointment).mockResolvedValue(true);
    vi.mocked(assertAppointmentEligibleForNewInvoice).mockResolvedValue({ ok: true });
    vi.mocked(resolveInvoiceBillingUserId).mockResolvedValue(DOC);
    vi.mocked(resolveInvoiceOrganizationId).mockResolvedValue({ organizationId: "org-1" });
    vi.mocked(prisma.invoice.create).mockResolvedValue({ id: "new-inv" } as never);

    const result = await maybeCreateDraftInvoiceForCompletedVisit(APPT, {
      userId: DOC,
      email: "d@test.com",
      role: "doctor",
    });

    expect(result).toEqual({ created: true, invoiceId: "new-inv" });
    expect(prisma.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ amount: 9250 }),
      })
    );
    expect(notifyPatientDraftInvoiceCreated).toHaveBeenCalled();
  });
});
