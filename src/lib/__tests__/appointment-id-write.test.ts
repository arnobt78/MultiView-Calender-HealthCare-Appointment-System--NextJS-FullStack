import { describe, it, expect } from "vitest";
import {
  isCancelStatusRequest,
  applyAppointmentStatusFields,
  applyReminderSentAtClearOnStart,
  fireAppointmentStatusNotifications,
} from "@/lib/appointment-id-write";
import { canCancelAppointment } from "@/lib/appointment-cancel-access";

describe("appointment-id-write", () => {
  it("isCancelStatusRequest detects cancelled", () => {
    expect(isCancelStatusRequest({ status: "cancelled" })).toBe(true);
    expect(isCancelStatusRequest({ status: "done" })).toBe(false);
  });

  it("applyAppointmentStatusFields sets cancel audit columns", () => {
    const data: Record<string, unknown> = {};
    applyAppointmentStatusFields(data, { status: "cancelled" }, "actor-1");
    expect(data.status).toBe("cancelled");
    expect(data.cancelled_by_id).toBe("actor-1");
    expect(data.cancelled_at).toBeInstanceOf(Date);
  });

  it("applyReminderSentAtClearOnStart clears dedupe on reschedule", () => {
    const data: Record<string, unknown> = { reminder_sent_at: new Date() };
    applyReminderSentAtClearOnStart(data, { start: "2026-06-10T10:00:00Z" });
    expect(data.reminder_sent_at).toBeNull();
  });

  it("admin can cancel without mutate assignee", () => {
    expect(
      canCancelAppointment(
        { userId: "admin-1", email: "a@test.com", role: "admin" },
        { owner_id: "owner-1", treating_physician_id: null, assignees: [] }
      )
    ).toBe(true);
  });

  it("fireAppointmentStatusNotifications is no-op when status unchanged", () => {
    expect(() =>
      fireAppointmentStatusNotifications({
        appointmentId: "a1",
        actorUserId: "u1",
        previousStatus: "pending",
        newStatus: "pending",
        requestedStatus: "pending",
      })
    ).not.toThrow();
  });
});
