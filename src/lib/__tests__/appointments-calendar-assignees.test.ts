import { describe, it, expect } from "vitest";
import { resolveExtraAssignedAppointmentIds } from "@/lib/appointments-calendar-assignees";
import type { AppointmentAssignee } from "@/types/types";

describe("resolveExtraAssignedAppointmentIds", () => {
  it("returns accepted assignee IDs not in owned list", () => {
    const owned = [{ id: "owned-1" }, { id: "owned-2" }];
    const assignees = [
      { appointment: "owned-1", user: "u1", status: "accepted" },
      { appointment: "shared-1", user: "u1", status: "accepted" },
      { appointment: "shared-2", invited_email: "a@b.com", status: "accepted" },
      { appointment: "pending-1", user: "u1", status: "pending" },
    ] as AppointmentAssignee[];

    expect(
      resolveExtraAssignedAppointmentIds(owned, assignees, "u1", "a@b.com")
    ).toEqual(["shared-1", "shared-2"]);
  });

  it("returns empty when no extra assignee rows", () => {
    expect(resolveExtraAssignedAppointmentIds([], [], "u1", null)).toEqual([]);
  });
});
