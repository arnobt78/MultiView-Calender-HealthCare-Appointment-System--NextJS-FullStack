import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    patient: { findFirst: vi.fn() },
    appointment: { count: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { countTodayAppointmentsForLoginUser } from "@/lib/login-today-appointments";

describe("countTodayAppointmentsForLoginUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("counts by patient_id for patient role", async () => {
    vi.mocked(prisma.patient.findFirst).mockResolvedValue({ id: "pat-1" } as never);
    vi.mocked(prisma.appointment.count).mockResolvedValue(2);

    const n = await countTodayAppointmentsForLoginUser(
      "user-1",
      "patient",
      "test@patient.com"
    );

    expect(n).toBe(2);
    expect(prisma.patient.findFirst).toHaveBeenCalledWith({
      where: { email: "test@patient.com" },
      select: { id: true },
    });
    expect(prisma.appointment.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ patient_id: "pat-1" }),
      })
    );
  });

  it("counts owner, treating, or accepted assignee visits for doctor role", async () => {
    vi.mocked(prisma.appointment.count).mockResolvedValue(5);

    const n = await countTodayAppointmentsForLoginUser(
      "doc-1",
      "doctor",
      "test@doctor.com"
    );

    expect(n).toBe(5);
    expect(prisma.patient.findFirst).not.toHaveBeenCalled();
    expect(prisma.appointment.count).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            OR: [
              { owner_id: "doc-1" },
              { treating_physician_id: "doc-1" },
              {
                assignees: {
                  some: {
                    status: "accepted",
                    OR: [
                      { user_id: "doc-1" },
                      { invited_email: "test@doctor.com" },
                    ],
                  },
                },
              },
            ],
          },
          { start: { gte: expect.any(Date), lte: expect.any(Date) } },
        ],
      },
    });
  });
});
