import { describe, expect, it } from "vitest";
import {
  coerceDashboardOverviewUpcomingAppointments,
  mapDashboardOverviewQueueAppointment,
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

describe("mapDashboardOverviewQueueAppointment", () => {
  it("maps visit type and duration from appointment_type join", () => {
    const mapped = mapDashboardOverviewQueueAppointment({
      id: "a1",
      title: "Check-up",
      start: new Date("2026-06-15T09:00:00.000Z"),
      end: new Date("2026-06-15T09:30:00.000Z"),
      location: "Room 1",
      status: "scheduled",
      is_telehealth: false,
      duration_minutes: 30,
      appointment_type: {
        name: "Annual Check-up",
        price_cents: 15000,
        duration_minutes: 45,
      },
      patient: null,
      treating_physician: null,
      owner: null,
    });
    expect(mapped.appointment_type_name).toBe("Annual Check-up");
    expect(mapped.duration_minutes).toBe(30);
    expect(mapped.appointment_type_duration_minutes).toBe(45);
  });
});
