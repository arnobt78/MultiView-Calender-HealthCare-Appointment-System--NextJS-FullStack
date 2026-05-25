import { describe, it, expect } from "vitest";
import { datetimeLocalValueToIso, isoToDatetimeLocalValue } from "@/lib/datetime-local-value";

describe("datetime-local-value", () => {
  it("round-trips local datetime string", () => {
    const iso = "2026-07-25T12:37:00.000Z";
    const local = isoToDatetimeLocalValue(iso);
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(datetimeLocalValueToIso(local)).toBeTruthy();
  });
});
