import { describe, expect, it } from "vitest";
import { resolveCalendarImportTreatingPhysicianId } from "@/lib/calendar-import";

const SESSION = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const DOCTOR = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

describe("resolveCalendarImportTreatingPhysicianId", () => {
  it("falls back to session user when form value is missing", () => {
    expect(resolveCalendarImportTreatingPhysicianId(null, SESSION)).toBe(SESSION);
  });

  it("falls back to session user when form value is empty string", () => {
    expect(resolveCalendarImportTreatingPhysicianId("", SESSION)).toBe(SESSION);
  });

  it("falls back to session user when form value is whitespace", () => {
    expect(resolveCalendarImportTreatingPhysicianId("   ", SESSION)).toBe(SESSION);
  });

  it("falls back to session user when form value is not a UUID", () => {
    expect(resolveCalendarImportTreatingPhysicianId("not-a-uuid", SESSION)).toBe(SESSION);
  });

  it("uses valid UUID from form value", () => {
    expect(resolveCalendarImportTreatingPhysicianId(DOCTOR, SESSION)).toBe(DOCTOR);
  });
});
