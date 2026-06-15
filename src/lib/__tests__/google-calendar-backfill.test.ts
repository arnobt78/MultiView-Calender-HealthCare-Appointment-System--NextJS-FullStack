import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    googleCalendarToken: { findUnique: vi.fn() },
    appointment: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/google-calendar-sync-appointment", () => ({
  syncAppointmentToGoogleCalendar: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { syncAppointmentToGoogleCalendar } from "@/lib/google-calendar-sync-appointment";
import {
  appointmentsPendingGoogleBackfillWhere,
  backfillAppointmentsToGoogleCalendar,
} from "@/lib/google-calendar-backfill";

const USER = "user-1";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("appointmentsPendingGoogleBackfillWhere", () => {
  it("scopes to staff visibility and missing google id", () => {
    const where = appointmentsPendingGoogleBackfillWhere(USER, "staff@example.com");

    expect(where.AND).toHaveLength(3);
    expect(JSON.stringify(where)).toContain("google_calendar_event_id");
    expect(JSON.stringify(where)).toContain("cancelled");
  });
});

describe("backfillAppointmentsToGoogleCalendar", () => {
  it("returns empty summary when not connected", async () => {
    vi.mocked(prisma.googleCalendarToken.findUnique).mockResolvedValue(null);

    const summary = await backfillAppointmentsToGoogleCalendar(USER);

    expect(summary).toEqual({ attempted: 0, synced: 0, skipped: 0, failed: 0 });
    expect(prisma.appointment.findMany).not.toHaveBeenCalled();
  });

  it("syncs unsynced rows and counts outcomes", async () => {
    vi.mocked(prisma.googleCalendarToken.findUnique).mockResolvedValue({ user_id: USER } as never);
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([
      {
        id: "a1",
        title: "One",
        notes: null,
        start: new Date(),
        end: new Date(),
        location: null,
        status: "pending",
        google_calendar_event_id: null,
      },
      {
        id: "a2",
        title: "Two",
        notes: null,
        start: new Date(),
        end: new Date(),
        location: null,
        status: "pending",
        google_calendar_event_id: null,
      },
    ] as never);
    vi.mocked(syncAppointmentToGoogleCalendar)
      .mockResolvedValueOnce("gcal-1")
      .mockResolvedValueOnce(null);

    const summary = await backfillAppointmentsToGoogleCalendar(USER, "staff@example.com");

    expect(summary).toEqual({ attempted: 2, synced: 1, skipped: 0, failed: 1 });
    expect(syncAppointmentToGoogleCalendar).toHaveBeenCalledTimes(2);
  });
});
