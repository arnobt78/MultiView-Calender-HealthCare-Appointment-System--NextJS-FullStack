import { describe, expect, it } from "vitest";
import {
  coerceDashboardOverviewUpcomingAppointments,
  type DashboardOverviewQueueAppointment,
} from "@/lib/dashboard-overview-queue";

const queueRow = { id: "a1" } as DashboardOverviewQueueAppointment;

describe("coerceDashboardOverviewUpcomingAppointments", () => {
  it("keeps array when upcomingAppointments already present", () => {
    const payload = { upcomingAppointments: [queueRow] };
    expect(coerceDashboardOverviewUpcomingAppointments(payload).upcomingAppointments).toEqual([
      queueRow,
    ]);
  });

  it("maps legacy nextAppointment to single-item array", () => {
    const payload = { nextAppointment: queueRow };
    expect(coerceDashboardOverviewUpcomingAppointments(payload).upcomingAppointments).toEqual([
      queueRow,
    ]);
  });

  it("returns empty array when neither field is set", () => {
    expect(coerceDashboardOverviewUpcomingAppointments({}).upcomingAppointments).toEqual([]);
  });
});
