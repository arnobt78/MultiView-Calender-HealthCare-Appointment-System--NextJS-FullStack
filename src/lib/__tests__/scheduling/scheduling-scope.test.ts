import { describe, expect, it } from "vitest";
import { addMonthsToYm, schedulingScopeKeySegment } from "@/lib/scheduling/scheduling-scope";

describe("schedulingScopeKeySegment", () => {
  it("uses typeId for typed scope", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    expect(schedulingScopeKeySegment({ kind: "type", typeId: id })).toBe(id);
  });

  it("uses flex prefix for flexible scope", () => {
    expect(schedulingScopeKeySegment({ kind: "flex", durationMinutes: 45 })).toBe("flex:45");
  });
});

describe("addMonthsToYm", () => {
  it("shifts across year boundary", () => {
    expect(addMonthsToYm("2026-01", -1)).toBe("2025-12");
    expect(addMonthsToYm("2026-12", 1)).toBe("2027-01");
  });
});
