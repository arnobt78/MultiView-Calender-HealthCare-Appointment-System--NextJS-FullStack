import { describe, expect, it, vi } from "vitest";
import { computeAppointmentAccessLevel } from "@/lib/appointment-access";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    dashboardAccess: {
      findFirst: vi.fn(async () => null),
    },
    patient: {
      findFirst: vi.fn(async () => null),
    },
  },
}));

describe("computeAppointmentAccessLevel — treating physician mutate", () => {
  const baseRow = {
    id: "appt-1",
    owner_id: "owner-doc",
    treating_physician_id: "treating-doc",
    patient_id: null,
    assignees: [] as {
      user_id: string | null;
      invited_email: string | null;
      status: string | null;
      permission: string | null;
    }[],
  };

  it("treating physician gets mutate on linked visit", async () => {
    const level = await computeAppointmentAccessLevel(
      { userId: "treating-doc", email: "t@clinic.com", role: "doctor" },
      baseRow
    );
    expect(level).toBe("mutate");
  });

  it("unrelated doctor gets none", async () => {
    const level = await computeAppointmentAccessLevel(
      { userId: "other-doc", email: "o@clinic.com", role: "doctor" },
      baseRow
    );
    expect(level).toBe("none");
  });
});
