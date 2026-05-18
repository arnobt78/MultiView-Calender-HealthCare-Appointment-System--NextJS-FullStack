import { describe, it, expect } from "vitest";
import { getAppointmentMenuCapabilities } from "@/lib/appointment-menu-permissions";

describe("getAppointmentMenuCapabilities", () => {
  const appt = { id: "a1", user_id: "owner-1" };

  it("patient: view only", () => {
    const caps = getAppointmentMenuCapabilities({
      appointment: appt,
      userId: "patient-1",
      userEmail: "p@test.com",
      userRole: "patient",
    });
    expect(caps).toEqual({
      canView: true,
      canToggleStatus: false,
      canEdit: false,
      canDelete: false,
    });
  });

  it("owner doctor: all actions", () => {
    const caps = getAppointmentMenuCapabilities({
      appointment: appt,
      userId: "owner-1",
      userEmail: "d@test.com",
      userRole: "doctor",
    });
    expect(caps.canView).toBe(true);
    expect(caps.canToggleStatus).toBe(true);
    expect(caps.canEdit).toBe(true);
    expect(caps.canDelete).toBe(true);
  });

  it("read assignee: view only", () => {
    const caps = getAppointmentMenuCapabilities({
      appointment: appt,
      assignees: [
        {
          appointment: "a1",
          user: "viewer-1",
          invited_email: null,
          status: "accepted",
          permission: "read",
        } as never,
      ],
      userId: "viewer-1",
      userEmail: "v@test.com",
      userRole: "doctor",
    });
    expect(caps.canView).toBe(true);
    expect(caps.canToggleStatus).toBe(false);
    expect(caps.canEdit).toBe(false);
    expect(caps.canDelete).toBe(false);
  });
});
