import { describe, expect, it } from "vitest";
import {
  normalizeGoogleCalendarEventStatus,
  resolveGoogleCalendarEventStatusMeta,
} from "@/lib/google-calendar-event-status-display";

describe("google-calendar-event-status-display", () => {
  it("maps Google API status strings to badge meta", () => {
    expect(normalizeGoogleCalendarEventStatus("confirmed")).toBe("confirmed");
    expect(normalizeGoogleCalendarEventStatus("TENTATIVE")).toBe("tentative");
    expect(normalizeGoogleCalendarEventStatus("cancelled")).toBe("cancelled");
    expect(normalizeGoogleCalendarEventStatus(undefined)).toBe("unknown");
    expect(normalizeGoogleCalendarEventStatus("custom")).toBe("unknown");
  });

  it("resolveGoogleCalendarEventStatusMeta returns glass classes", () => {
    expect(resolveGoogleCalendarEventStatusMeta("confirmed").glassClass).toBe(
      "calendar-glass-badge-emerald"
    );
    expect(resolveGoogleCalendarEventStatusMeta("tentative").label).toBe("Tentative");
    expect(resolveGoogleCalendarEventStatusMeta("cancelled").label).toBe("Cancelled");
    expect(resolveGoogleCalendarEventStatusMeta(null).label).toBe("Unknown");
  });
});
