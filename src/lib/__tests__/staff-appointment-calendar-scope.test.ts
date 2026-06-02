import { describe, expect, it } from "vitest";
import {
  dashboardOverviewAppointmentFilter,
  staffCalendarAcceptedAssigneeWhere,
  staffCalendarAppointmentByIdWhere,
  staffCalendarAppointmentFilter,
  staffCalendarAppointmentIdsBatchWhere,
  staffCalendarAppointmentWhere,
  staffCalendarVisibilityOrClauses,
} from "@/lib/staff-appointment-calendar-scope";

const ASSIGNEE_EMAIL = {
  assignees: {
    some: {
      status: "accepted",
      OR: [{ user_id: "doc-a" }, { invited_email: "doc@test.com" }],
    },
  },
};

describe("staff-appointment-calendar-scope", () => {
  it("staffCalendarVisibilityOrClauses includes owner, treating, assignee", () => {
    expect(staffCalendarVisibilityOrClauses("doc-a", "doc@test.com")).toEqual([
      { owner_id: "doc-a" },
      { treating_physician_id: "doc-a" },
      ASSIGNEE_EMAIL,
    ]);
  });

  it("staffCalendarAppointmentWhere wraps visibility OR", () => {
    expect(staffCalendarAppointmentWhere("doc-a", "doc@test.com")).toEqual({
      OR: staffCalendarVisibilityOrClauses("doc-a", "doc@test.com"),
    });
  });

  it("staffCalendarAppointmentFilter ANDs extra predicates", () => {
    expect(
      staffCalendarAppointmentFilter("doc-a", { status: "pending" }, "doc@test.com")
    ).toEqual({
      AND: [
        { OR: staffCalendarVisibilityOrClauses("doc-a", "doc@test.com") },
        { status: "pending" },
      ],
    });
  });

  it("staffCalendarAppointmentByIdWhere scopes id + visibility", () => {
    expect(staffCalendarAppointmentByIdWhere("doc-a", "appt-1", "doc@test.com")).toEqual({
      id: "appt-1",
      OR: staffCalendarVisibilityOrClauses("doc-a", "doc@test.com"),
    });
  });

  it("staffCalendarAppointmentIdsBatchWhere scopes ids + visibility", () => {
    expect(
      staffCalendarAppointmentIdsBatchWhere("doc-a", ["appt-1", "appt-2"], "doc@test.com")
    ).toEqual({
      id: { in: ["appt-1", "appt-2"] },
      OR: staffCalendarVisibilityOrClauses("doc-a", "doc@test.com"),
    });
  });

  it("staffCalendarAcceptedAssigneeWhere omits email branch when empty", () => {
    expect(staffCalendarAcceptedAssigneeWhere("doc-a")).toEqual({
      assignees: {
        some: {
          status: "accepted",
          OR: [{ user_id: "doc-a" }],
        },
      },
    });
  });

  it("dashboardOverviewAppointmentFilter is global for admin", () => {
    expect(dashboardOverviewAppointmentFilter("admin-1", "admin")).toEqual({});
    expect(
      dashboardOverviewAppointmentFilter("admin-1", "admin", { status: "done" })
    ).toEqual({ status: "done" });
  });

  it("dashboardOverviewAppointmentFilter uses staff scope for doctors", () => {
    expect(dashboardOverviewAppointmentFilter("doc-a", "doctor", undefined, "doc@test.com")).toEqual({
      OR: staffCalendarVisibilityOrClauses("doc-a", "doc@test.com"),
    });
  });
});
