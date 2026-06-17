import { describe, expect, it } from "vitest";
import {
  appointmentStartToSlotPickIso,
  resolveSlotPickIsoFromCells,
  slotStartsMatch,
} from "@/lib/scheduling/slot-pick-selection";

describe("slot-pick-selection", () => {
  it("slotStartsMatch compares instants not string form", () => {
    expect(
      slotStartsMatch("2026-06-18T08:30:00.000Z", "2026-06-18T08:30:00Z")
    ).toBe(true);
  });

  it("resolveSlotPickIsoFromCells picks exact grid cell", () => {
    const cells = [{ start: "2026-06-18T08:30:00.000Z", status: "available" as const }];
    expect(
      resolveSlotPickIsoFromCells("2026-06-18T08:30:00Z", cells, 20)
    ).toBe("2026-06-18T08:30:00.000Z");
  });

  it("resolveSlotPickIsoFromCells snaps past cells for edit highlight", () => {
    const cells = [{ start: "2026-06-10T08:30:00.000Z", status: "past" as const }];
    expect(
      resolveSlotPickIsoFromCells("2026-06-10T08:30:00Z", cells, 20)
    ).toBe("2026-06-10T08:30:00.000Z");
  });

  it("appointmentStartToSlotPickIso normalizes UTC", () => {
    expect(appointmentStartToSlotPickIso("2026-06-18T08:30:00Z")).toBe(
      "2026-06-18T08:30:00.000Z"
    );
  });
});
