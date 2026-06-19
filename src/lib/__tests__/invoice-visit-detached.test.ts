import { describe, expect, it } from "vitest";
import {
  parseStoredVisitSnapshot,
  mapAppointmentToInvoiceVisitSummary,
} from "@/lib/invoice-visit-summary";

describe("parseStoredVisitSnapshot", () => {
  it("returns null for invalid payload", () => {
    expect(parseStoredVisitSnapshot(null)).toBeNull();
    expect(parseStoredVisitSnapshot([])).toBeNull();
    expect(parseStoredVisitSnapshot({ title: "x" })).toBeNull();
  });

  it("parses valid snapshot JSON", () => {
    const snapshot = mapAppointmentToInvoiceVisitSummary({
      id: "appt-1",
      title: "Visit",
      status: "pending",
      start: new Date("2026-06-22T14:00:00.000Z"),
      end: new Date("2026-06-22T15:00:00.000Z"),
      location: "Room 1",
      is_telehealth: false,
      category: null,
      appointment_type: null,
      patient: null,
      owner: null,
      treating_physician: null,
    });
    const parsed = parseStoredVisitSnapshot(snapshot);
    expect(parsed?.appointment_id).toBe("appt-1");
    expect(parsed?.title).toBe("Visit");
  });
});
