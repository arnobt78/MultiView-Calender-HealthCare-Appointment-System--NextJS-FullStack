import { describe, expect, it, vi, beforeEach } from "vitest";
import { resolvePatientAccess } from "@/lib/patient-access";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    patient: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

const PAT_ID = "00000000-0000-4000-8000-000000000001";
const DOCTOR_A = "00000000-0000-4000-8000-000000000002";
const DOCTOR_B = "00000000-0000-4000-8000-000000000003";

const adminSession = {
  userId: "00000000-0000-4000-8000-000000000010",
  email: "a@test.com",
  role: "admin",
};
const doctorSession = { userId: DOCTOR_A, email: "d@test.com", role: "doctor" };
const patientSession = { userId: "00000000-0000-4000-8000-000000000011", email: "p@test.com", role: "patient" };

describe("resolvePatientAccess", () => {
  beforeEach(() => {
    vi.mocked(prisma.patient.findUnique).mockReset();
    vi.mocked(prisma.patient.findFirst).mockReset();
  });

  it("returns mutate for admin on any patient", async () => {
    vi.mocked(prisma.patient.findUnique).mockResolvedValue({
      id: PAT_ID,
      email: "x@test.com",
      primary_doctor_id: DOCTOR_B,
    } as never);

    const level = await resolvePatientAccess(adminSession, PAT_ID);
    expect(level).toBe("mutate");
  });

  it("returns mutate when doctor is primary physician", async () => {
    vi.mocked(prisma.patient.findUnique).mockResolvedValue({
      id: PAT_ID,
      email: "x@test.com",
      primary_doctor_id: DOCTOR_A,
    } as never);
    vi.mocked(prisma.patient.findFirst).mockResolvedValue({ id: PAT_ID } as never);

    const level = await resolvePatientAccess(doctorSession, PAT_ID);
    expect(level).toBe("mutate");
  });

  it("returns view when doctor is related but not primary", async () => {
    vi.mocked(prisma.patient.findUnique).mockResolvedValue({
      id: PAT_ID,
      email: "x@test.com",
      primary_doctor_id: DOCTOR_B,
    } as never);
    vi.mocked(prisma.patient.findFirst).mockResolvedValue({ id: PAT_ID } as never);

    const level = await resolvePatientAccess(doctorSession, PAT_ID);
    expect(level).toBe("view");
  });

  it("returns view for roster browse via fromDoctor param", async () => {
    vi.mocked(prisma.patient.findUnique).mockResolvedValue({
      id: PAT_ID,
      email: "x@test.com",
      primary_doctor_id: DOCTOR_B,
    } as never);
    vi.mocked(prisma.patient.findFirst).mockResolvedValue(null);

    const level = await resolvePatientAccess(doctorSession, PAT_ID, {
      rosterDoctorId: DOCTOR_B,
    });
    expect(level).toBe("view");
  });

  it("returns view for patient own record", async () => {
    vi.mocked(prisma.patient.findUnique).mockResolvedValue({
      id: PAT_ID,
      email: "p@test.com",
      primary_doctor_id: DOCTOR_B,
    } as never);
    vi.mocked(prisma.patient.findFirst).mockResolvedValue({ id: PAT_ID } as never);

    const level = await resolvePatientAccess(patientSession, PAT_ID);
    expect(level).toBe("view");
  });

  it("returns none for patient viewing another record", async () => {
    vi.mocked(prisma.patient.findUnique).mockResolvedValue({
      id: PAT_ID,
      email: "other@test.com",
      primary_doctor_id: DOCTOR_B,
    } as never);
    vi.mocked(prisma.patient.findFirst).mockResolvedValue(null);

    const level = await resolvePatientAccess(patientSession, PAT_ID);
    expect(level).toBe("none");
  });
});
