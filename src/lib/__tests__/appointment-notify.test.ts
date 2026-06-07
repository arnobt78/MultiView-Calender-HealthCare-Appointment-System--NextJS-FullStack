import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: { findUnique: vi.fn() },
    user: { findFirst: vi.fn(), findUnique: vi.fn() },
    notification: { create: vi.fn() },
  },
}));

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { notifyAppointmentCancelled } from "@/lib/appointment-notify";

describe("notifyAppointmentCancelled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("dedupes recipients by user id and email", async () => {
    vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
      id: "appt-1",
      title: "Checkup",
      start: new Date("2026-06-08T10:00:00Z"),
      end: new Date("2026-06-08T10:30:00Z"),
      location: "Room 1",
      status: "cancelled",
      owner_id: "owner-1",
      owner: {
        id: "owner-1",
        email: "owner@test.com",
        display_name: "Dr Owner",
        role: "doctor",
      },
      treating_physician: {
        id: "owner-1",
        email: "owner@test.com",
        display_name: "Dr Owner",
        role: "doctor",
      },
      patient: { email: "patient@test.com", firstname: "Pat", lastname: "Ent" },
      assignees: [],
    } as never);

    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: "patient-user",
      email: "patient@test.com",
      display_name: "Pat Ent",
      role: "patient",
    } as never);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "actor-1",
      email: "actor@test.com",
      display_name: "Actor",
      role: "admin",
    } as never);

    notifyAppointmentCancelled({ appointmentId: "appt-1", actorUserId: "actor-1" });
    await new Promise((r) => setTimeout(r, 0));

    expect(prisma.notification.create).toHaveBeenCalledTimes(3);
    expect(sendEmail).toHaveBeenCalledTimes(3);
    const emails = vi.mocked(sendEmail).mock.calls.map((c) => c[0].to).sort();
    expect(emails).toEqual(["actor@test.com", "owner@test.com", "patient@test.com"]);
  });
});
