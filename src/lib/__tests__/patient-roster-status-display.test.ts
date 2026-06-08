import { describe, expect, it } from "vitest";
import {
  patientRosterStatusInlineCount,
  patientRosterStatusInlineLabel,
  patientRosterStatusInlineTextClass,
} from "@/lib/patient-roster-status-display";

describe("patientRosterStatusInlineTextClass", () => {
  it("uses emerald for active and slate for inactive", () => {
    expect(patientRosterStatusInlineTextClass(true)).toBe("text-emerald-700");
    expect(patientRosterStatusInlineTextClass(false)).toBe("text-slate-600");
  });
});

describe("patientRosterStatusInlineLabel", () => {
  it("capitalizes roster keys", () => {
    expect(patientRosterStatusInlineLabel("active")).toBe("Active");
    expect(patientRosterStatusInlineLabel("inactive")).toBe("Inactive");
  });
});

describe("patientRosterStatusInlineCount", () => {
  it("reads counts by key", () => {
    expect(
      patientRosterStatusInlineCount({ active: 3, inactive: 0 }, "active")
    ).toBe(3);
    expect(
      patientRosterStatusInlineCount({ active: 3, inactive: 0 }, "inactive")
    ).toBe(0);
  });
});
