import { describe, expect, it } from "vitest";
import {
  isSchedulingMonthDayDisabled,
  resolveDefaultSchedulingDateStr,
} from "@/lib/scheduling/default-scheduling-date";
import type { MonthDayEntry } from "@/lib/scheduling/scheduling-types";

const TODAY = "2026-06-18";

function day(date: string, status: MonthDayEntry["status"]): MonthDayEntry {
  return { date, status };
}

describe("resolveDefaultSchedulingDateStr", () => {
  it("returns today when today is open", () => {
    expect(
      resolveDefaultSchedulingDateStr(TODAY, [
        day("2026-06-17", "open"),
        day(TODAY, "open"),
        day("2026-06-19", "open"),
      ])
    ).toBe(TODAY);
  });

  it("returns today when today is full (day grid may still have slots)", () => {
    expect(
      resolveDefaultSchedulingDateStr(TODAY, [
        day(TODAY, "full"),
        day("2026-06-19", "open"),
      ])
    ).toBe(TODAY);
  });

  it("returns later open day when today is unavailable", () => {
    expect(
      resolveDefaultSchedulingDateStr(TODAY, [
        day(TODAY, "unavailable"),
        day("2026-06-22", "open"),
      ])
    ).toBe("2026-06-22");
  });

  it("returns today when today missing from map but month has future days", () => {
    expect(
      resolveDefaultSchedulingDateStr(TODAY, [day("2026-06-19", "open")])
    ).toBe(TODAY);
  });

  it("returns null when today unavailable and no future open days", () => {
    expect(
      resolveDefaultSchedulingDateStr(TODAY, [
        day(TODAY, "unavailable"),
        day("2026-06-19", "full"),
      ])
    ).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(resolveDefaultSchedulingDateStr(TODAY, [])).toBeNull();
    expect(resolveDefaultSchedulingDateStr("", [day(TODAY, "open")])).toBeNull();
  });
});

describe("isSchedulingMonthDayDisabled", () => {
  it("disables only unavailable", () => {
    expect(isSchedulingMonthDayDisabled("unavailable")).toBe(true);
    expect(isSchedulingMonthDayDisabled("open")).toBe(false);
    expect(isSchedulingMonthDayDisabled("full")).toBe(false);
    expect(isSchedulingMonthDayDisabled(undefined)).toBe(false);
  });
});
