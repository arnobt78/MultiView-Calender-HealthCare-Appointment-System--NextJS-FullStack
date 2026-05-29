import { describe, expect, it } from "vitest";
import { resolveDashboardAppointmentRelativeTone } from "@/lib/dashboard-appointment-relative-time";

describe("resolveDashboardAppointmentRelativeTone", () => {
  const now = new Date("2026-05-29T12:00:00.000Z");

  it("returns today when start is same calendar day", () => {
    expect(
      resolveDashboardAppointmentRelativeTone("2026-05-29T18:00:00.000Z", now)
    ).toBe("today");
  });

  it("returns within24h when start is tomorrow within 24 hours", () => {
    expect(
      resolveDashboardAppointmentRelativeTone("2026-05-30T08:00:00.000Z", now)
    ).toBe("within24h");
  });

  it("returns within48h when start is between 24h and 48h away", () => {
    expect(
      resolveDashboardAppointmentRelativeTone("2026-05-31T10:00:00.000Z", now)
    ).toBe("within48h");
  });

  it("returns later when start is more than 48h away", () => {
    expect(
      resolveDashboardAppointmentRelativeTone("2026-06-15T10:00:00.000Z", now)
    ).toBe("later");
  });
});
