import { describe, expect, it } from "vitest";
import {
  getAppointmentDateTagKind,
  getAppointmentDayDiff,
  getCalendarTagReferenceDate,
} from "@/lib/appointment-date-tags";

describe("appointment-date-tags", () => {
  it("uses real calendar today when reference omitted", () => {
    const today = getCalendarTagReferenceDate();
    expect(getAppointmentDateTagKind(today, today)).toBe("today");
    expect(getAppointmentDateTagKind(new Date(today.getTime() + 86400000), today)).toBe(
      "tomorrow"
    );
    expect(getAppointmentDateTagKind(new Date(today.getTime() - 86400000), today)).toBe(
      "passed"
    );
  });

  it("does not treat navigation anchor as today", () => {
    const navAnchor = new Date(2026, 4, 1);
    navAnchor.setHours(0, 0, 0, 0);
    const apptOnMay15 = new Date(2026, 4, 15);
    apptOnMay15.setHours(0, 0, 0, 0);
    const realToday = new Date(2026, 4, 15);
    realToday.setHours(0, 0, 0, 0);

    expect(getAppointmentDateTagKind(apptOnMay15, navAnchor)).toBe("later");
    expect(getAppointmentDateTagKind(apptOnMay15, realToday)).toBe("today");
    expect(getAppointmentDayDiff(apptOnMay15, realToday)).toBe(0);
  });
});
