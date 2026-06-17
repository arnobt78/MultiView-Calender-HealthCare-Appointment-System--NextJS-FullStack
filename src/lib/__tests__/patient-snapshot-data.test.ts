import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    patient: { findUnique: vi.fn() },
    appointment: { findMany: vi.fn(), count: vi.fn() },
    invoice: { count: vi.fn(), findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { loadPatientSnapshotData } from "@/lib/patient-snapshot-data";

const PATIENT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const patientRaw = {
  id: PATIENT_ID,
  created_at: new Date("2024-01-01"),
  updated_at: new Date("2024-01-02"),
  firstname: "Jane",
  lastname: "Doe",
  birth_date: new Date("1990-05-15"),
  care_level: 1,
  pronoun: "she/her",
  email: "jane@example.com",
  phone: null,
  active: true,
  active_since: new Date("2024-01-01"),
  clinical_profile: null,
  created_by_id: null,
  updated_by_id: null,
  primary_doctor_id: null,
  created_by: null,
  updated_by: null,
  primary_doctor: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("loadPatientSnapshotData", () => {
  it("returns empty invoices and patient-scoped invoice count without findMany", async () => {
    vi.mocked(prisma.patient.findUnique).mockResolvedValue(patientRaw as never);
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([]);
    vi.mocked(prisma.appointment.count).mockResolvedValue(3);
    vi.mocked(prisma.invoice.count).mockResolvedValue(7);

    const snapshot = await loadPatientSnapshotData(PATIENT_ID);

    expect(snapshot).not.toBeNull();
    expect(snapshot?.invoices).toEqual([]);
    expect(snapshot?.invoiceTotalCount).toBe(7);
    expect(snapshot?.appointmentTotalCount).toBe(3);
    expect(prisma.invoice.findMany).not.toHaveBeenCalled();
    expect(prisma.invoice.count).toHaveBeenCalledWith({
      where: { appointment: { patient_id: PATIENT_ID } },
    });
  });

  it("returns null when patient is missing", async () => {
    vi.mocked(prisma.patient.findUnique).mockResolvedValue(null);

    const snapshot = await loadPatientSnapshotData(PATIENT_ID);

    expect(snapshot).toBeNull();
    expect(prisma.invoice.count).not.toHaveBeenCalled();
  });
});
