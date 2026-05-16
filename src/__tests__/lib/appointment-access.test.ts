/**
 * Unit tests — appointment-access.ts (view vs mutate boundaries, no DB).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { computeAppointmentAccessLevel } from "@/lib/appointment-access";
import { doctorIsRelatedToPatient } from "@/lib/patient-access";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/patient-access", () => ({
  doctorIsRelatedToPatient: vi.fn(),
  patientOwnsPatientRecord: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    dashboardAccess: { findFirst: vi.fn() },
  },
}));

const baseRow = {
  id: "appt-1",
  owner_id: "doctor-owner",
  treating_physician_id: null as string | null,
  patient_id: "patient-1",
  assignees: [] as {
    user_id: string | null;
    invited_email: string | null;
    status: string | null;
    permission: string | null;
  }[],
};

describe("computeAppointmentAccessLevel", () => {
  beforeEach(() => {
    vi.mocked(doctorIsRelatedToPatient).mockReset();
    vi.mocked(prisma.dashboardAccess.findFirst).mockReset();
    vi.mocked(prisma.dashboardAccess.findFirst).mockResolvedValue(null);
  });

  it("admin viewing doctor-owned appointment gets view (not mutate)", async () => {
    const level = await computeAppointmentAccessLevel(
      { userId: "admin-1", email: "admin@test.com", role: "admin" },
      { ...baseRow, owner_id: "doctor-owner" }
    );
    expect(level).toBe("view");
  });

  it("admin who owns the appointment gets mutate", async () => {
    const level = await computeAppointmentAccessLevel(
      { userId: "admin-1", email: "admin@test.com", role: "admin" },
      { ...baseRow, owner_id: "admin-1" }
    );
    expect(level).toBe("mutate");
  });

  it("doctor owner gets mutate", async () => {
    const level = await computeAppointmentAccessLevel(
      { userId: "doctor-owner", email: "doc@test.com", role: "doctor" },
      baseRow
    );
    expect(level).toBe("mutate");
  });

  it("doctor with read-only assignee gets view", async () => {
    const level = await computeAppointmentAccessLevel(
      { userId: "other-doc", email: "other@test.com", role: "doctor" },
      {
        ...baseRow,
        assignees: [
          {
            user_id: "other-doc",
            invited_email: null,
            status: "accepted",
            permission: "read",
          },
        ],
      }
    );
    expect(level).toBe("view");
  });

  it("doctor unrelated to patient and not assignee gets none", async () => {
    vi.mocked(doctorIsRelatedToPatient).mockResolvedValue(false);
    const level = await computeAppointmentAccessLevel(
      { userId: "stranger", email: "stranger@test.com", role: "doctor" },
      baseRow
    );
    expect(level).toBe("none");
  });

  it("patient never gets mutate", async () => {
    const { patientOwnsPatientRecord } = await import("@/lib/patient-access");
    vi.mocked(patientOwnsPatientRecord).mockResolvedValue(true);
    const level = await computeAppointmentAccessLevel(
      { userId: "patient-user", email: "patient@test.com", role: "patient" },
      { ...baseRow, owner_id: "patient-user" }
    );
    expect(level).toBe("view");
  });
});
