import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    googleCalendarToken: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    appointment: {
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/google-calendar", () => ({
  appointmentToGoogleEvent: vi.fn(() => ({ summary: "Test" })),
  getValidAccessToken: vi.fn(async (token: string) => token),
  insertGoogleEvent: vi.fn(),
  updateGoogleEvent: vi.fn(),
  deleteGoogleEvent: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import {
  deleteGoogleEvent,
  insertGoogleEvent,
  updateGoogleEvent,
} from "@/lib/google-calendar";
import {
  deleteGoogleCalendarEventForAppointment,
  isAppointmentNewlyCancelled,
  runAppointmentGoogleCalendarSideEffects,
  shouldSyncAppointmentPatchToGoogle,
  syncAppointmentToGoogleCalendar,
  unlinkAppointmentFromGoogleCalendar,
} from "@/lib/google-calendar-sync-appointment";

const USER = "user-1";
const APPT_ID = "appt-1";
const GCAL_ID = "gcal-event-1";

const baseAppointment = {
  id: APPT_ID,
  title: "Visit",
  notes: "Notes",
  start: new Date("2026-06-15T10:00:00Z"),
  end: new Date("2026-06-15T11:00:00Z"),
  location: "Room 1",
  status: "pending",
  google_calendar_event_id: null as string | null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.googleCalendarToken.findUnique).mockResolvedValue({
    access_token: "access",
    refresh_token: "refresh",
    expiry_date: Date.now() + 60_000,
    calendar_id: "primary",
  } as never);
});

describe("shouldSyncAppointmentPatchToGoogle", () => {
  it("returns true when sync-relevant fields are present", () => {
    expect(shouldSyncAppointmentPatchToGoogle({ title: "New" })).toBe(true);
    expect(shouldSyncAppointmentPatchToGoogle({ start: "2026-06-15T10:00:00Z" })).toBe(true);
  });

  it("returns false when only unrelated fields change", () => {
    expect(shouldSyncAppointmentPatchToGoogle({ patient: "pat-1" })).toBe(false);
  });
});

describe("syncAppointmentToGoogleCalendar", () => {
  it("returns null when no Google token", async () => {
    vi.mocked(prisma.googleCalendarToken.findUnique).mockResolvedValue(null);

    const result = await syncAppointmentToGoogleCalendar(USER, baseAppointment);

    expect(result).toBeNull();
    expect(insertGoogleEvent).not.toHaveBeenCalled();
  });

  it("skips cancelled appointments", async () => {
    const result = await syncAppointmentToGoogleCalendar(USER, {
      ...baseAppointment,
      status: "cancelled",
    });

    expect(result).toBeNull();
    expect(insertGoogleEvent).not.toHaveBeenCalled();
  });

  it("inserts and persists google event id on first sync", async () => {
    vi.mocked(insertGoogleEvent).mockResolvedValue({ id: GCAL_ID } as never);
    vi.mocked(prisma.appointment.update).mockResolvedValue({} as never);

    const result = await syncAppointmentToGoogleCalendar(USER, baseAppointment);

    expect(result).toBe(GCAL_ID);
    expect(insertGoogleEvent).toHaveBeenCalled();
    expect(prisma.appointment.update).toHaveBeenCalledWith({
      where: { id: APPT_ID },
      data: { google_calendar_event_id: GCAL_ID },
    });
  });

  it("updates existing google event when id is stored", async () => {
    vi.mocked(updateGoogleEvent).mockResolvedValue({ id: GCAL_ID } as never);

    const result = await syncAppointmentToGoogleCalendar(USER, {
      ...baseAppointment,
      google_calendar_event_id: GCAL_ID,
    });

    expect(result).toBe(GCAL_ID);
    expect(updateGoogleEvent).toHaveBeenCalled();
    expect(insertGoogleEvent).not.toHaveBeenCalled();
  });
});

describe("deleteGoogleCalendarEventForAppointment", () => {
  it("no-ops when event id is missing", async () => {
    await deleteGoogleCalendarEventForAppointment(USER, null);
    expect(deleteGoogleEvent).not.toHaveBeenCalled();
  });

  it("deletes remote event when id present", async () => {
    await deleteGoogleCalendarEventForAppointment(USER, GCAL_ID);
    expect(deleteGoogleEvent).toHaveBeenCalledWith("access", "primary", GCAL_ID);
  });
});

describe("isAppointmentNewlyCancelled", () => {
  it("detects transition into cancelled", () => {
    expect(isAppointmentNewlyCancelled("pending", "cancelled")).toBe(true);
    expect(isAppointmentNewlyCancelled("cancelled", "cancelled")).toBe(false);
    expect(isAppointmentNewlyCancelled("pending", "done")).toBe(false);
  });
});

describe("unlinkAppointmentFromGoogleCalendar", () => {
  it("deletes remote event and clears local link", async () => {
    vi.mocked(prisma.appointment.update).mockResolvedValue({} as never);

    await unlinkAppointmentFromGoogleCalendar(USER, APPT_ID, GCAL_ID);

    expect(deleteGoogleEvent).toHaveBeenCalledWith("access", "primary", GCAL_ID);
    expect(prisma.appointment.update).toHaveBeenCalledWith({
      where: { id: APPT_ID },
      data: { google_calendar_event_id: null },
    });
  });
});

describe("runAppointmentGoogleCalendarSideEffects", () => {
  it("unlinks when newly cancelled with stored event id", async () => {
    vi.mocked(prisma.appointment.update).mockResolvedValue({} as never);

    await runAppointmentGoogleCalendarSideEffects(
      USER,
      { status: "cancelled" },
      "pending",
      { ...baseAppointment, status: "cancelled", google_calendar_event_id: GCAL_ID }
    );

    expect(deleteGoogleEvent).toHaveBeenCalled();
    expect(insertGoogleEvent).not.toHaveBeenCalled();
  });

  it("upserts when sync-relevant fields change on active visit", async () => {
    vi.mocked(insertGoogleEvent).mockResolvedValue({ id: GCAL_ID } as never);
    vi.mocked(prisma.appointment.update).mockResolvedValue({} as never);

    await runAppointmentGoogleCalendarSideEffects(
      USER,
      { title: "Updated" },
      "pending",
      { ...baseAppointment, title: "Updated" }
    );

    expect(insertGoogleEvent).toHaveBeenCalled();
  });

  it("skips upsert when only unrelated fields change", async () => {
    await runAppointmentGoogleCalendarSideEffects(
      USER,
      { patient: "pat-1" },
      "pending",
      baseAppointment
    );

    expect(insertGoogleEvent).not.toHaveBeenCalled();
    expect(deleteGoogleEvent).not.toHaveBeenCalled();
  });
});
