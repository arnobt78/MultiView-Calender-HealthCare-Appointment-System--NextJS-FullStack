import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    patient: { findUnique: vi.fn() },
    user: { findFirst: vi.fn() },
    notification: { create: vi.fn() },
  },
}));

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { notifyPatientDraftInvoiceCreated } from "@/lib/billing-notify-patient";

const PATIENT_ID = "pat-1";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("notifyPatientDraftInvoiceCreated", () => {
  it("creates in-app notification and sends email when patient user exists", async () => {
    vi.mocked(prisma.patient.findUnique).mockResolvedValue({
      email: "patient@test.com",
    } as never);
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: "user-pat" } as never);
    vi.mocked(prisma.notification.create).mockResolvedValue({} as never);
    vi.mocked(sendEmail).mockResolvedValue(undefined as never);

    notifyPatientDraftInvoiceCreated({
      invoiceId: "inv-abc",
      patientId: PATIENT_ID,
      patientEmail: "patient@test.com",
      amountCents: 9250,
      appointmentTitle: "Follow-up",
      visitDate: new Date("2026-06-01"),
    });

    await vi.waitFor(() => {
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    expect(sendEmail).toHaveBeenCalled();
  });

  it("skips email when patient has no email", async () => {
    vi.mocked(prisma.patient.findUnique).mockResolvedValue({ email: null } as never);
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    notifyPatientDraftInvoiceCreated({
      invoiceId: "inv-abc",
      patientId: PATIENT_ID,
      patientEmail: null,
      amountCents: 5000,
      appointmentTitle: "Visit",
      visitDate: new Date(),
    });

    await new Promise((r) => setTimeout(r, 20));
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
