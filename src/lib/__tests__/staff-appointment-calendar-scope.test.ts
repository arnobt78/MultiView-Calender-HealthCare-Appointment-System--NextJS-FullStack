import { describe, expect, it } from "vitest";
import {
  dashboardOverviewAppointmentFilter,
  staffCalendarAppointmentFilter,
  staffCalendarAppointmentWhere,
} from "@/lib/staff-appointment-calendar-scope";

describe("staff-appointment-calendar-scope", () => {
  it("staffCalendarAppointmentWhere includes owner and treating physician", () => {
    expect(staffCalendarAppointmentWhere("doc-a")).toEqual({
      OR: [{ owner_id: "doc-a" }, { treating_physician_id: "doc-a" }],
    });
  });

  it("staffCalendarAppointmentFilter ANDs extra predicates", () => {
    expect(
      staffCalendarAppointmentFilter("doc-a", { status: "pending" })
    ).toEqual({
      AND: [
        {
          OR: [{ owner_id: "doc-a" }, { treating_physician_id: "doc-a" }],
        },
        { status: "pending" },
      ],
    });
  });

  it("dashboardOverviewAppointmentFilter is global for admin", () => {
    expect(dashboardOverviewAppointmentFilter("admin-1", "admin")).toEqual({});
    expect(
      dashboardOverviewAppointmentFilter("admin-1", "admin", { status: "done" })
    ).toEqual({ status: "done" });
  });

  it("dashboardOverviewAppointmentFilter uses staff scope for doctors", () => {
    expect(dashboardOverviewAppointmentFilter("doc-a", "doctor")).toEqual({
      OR: [{ owner_id: "doc-a" }, { treating_physician_id: "doc-a" }],
    });
  });
});
