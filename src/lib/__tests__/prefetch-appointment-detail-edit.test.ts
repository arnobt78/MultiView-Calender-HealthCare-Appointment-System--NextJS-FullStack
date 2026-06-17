import { describe, expect, it } from "vitest";
import { appointmentStartToSlotPickDateStr } from "@/lib/prefetch-appointment-detail-edit";

describe("prefetch-appointment-detail-edit", () => {
  it("derives local slot-pick date from UTC appointment start", () => {
    const day = appointmentStartToSlotPickDateStr("2026-06-17T14:00:00.000Z");
    expect(day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns empty for invalid start", () => {
    expect(appointmentStartToSlotPickDateStr("")).toBe("");
    expect(appointmentStartToSlotPickDateStr(null)).toBe("");
  });
});
