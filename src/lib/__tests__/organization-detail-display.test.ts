import { describe, expect, it } from "vitest";
import {
  countOrganizationMembersByRole,
  formatOrganizationTypeLabel,
} from "@/lib/organization-detail-display";

describe("formatOrganizationTypeLabel", () => {
  it("capitalizes simple org types", () => {
    expect(formatOrganizationTypeLabel("clinic")).toBe("Clinic");
    expect(formatOrganizationTypeLabel("hospital")).toBe("Hospital");
  });

  it("formats snake_case org types", () => {
    expect(formatOrganizationTypeLabel("private_practice")).toBe("Private Practice");
  });

  it("returns null for empty input", () => {
    expect(formatOrganizationTypeLabel(null)).toBeNull();
    expect(formatOrganizationTypeLabel("  ")).toBeNull();
  });
});

describe("countOrganizationMembersByRole", () => {
  it("aggregates admin, doctor, and patient counts", () => {
    expect(
      countOrganizationMembersByRole([
        { role: "admin" },
        { role: "doctor" },
        { role: "doctor" },
        { role: "patient" },
      ])
    ).toEqual({ admin: 1, doctor: 2, patient: 1 });
  });
});
