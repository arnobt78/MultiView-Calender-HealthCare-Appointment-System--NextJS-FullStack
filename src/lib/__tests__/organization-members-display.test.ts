import { describe, expect, it } from "vitest";
import {
  ORGANIZATION_MEMBERS_SUBTITLE,
  organizationMembersSectionTitle,
} from "@/lib/organization-members-display";

describe("organizationMembersSectionTitle", () => {
  it("returns possessive members title when org name is set", () => {
    expect(organizationMembersSectionTitle("HealthCal Demo Clinic")).toBe(
      "HealthCal Demo Clinic's Members"
    );
  });

  it("falls back when org name is blank", () => {
    expect(organizationMembersSectionTitle("")).toBe("Organization's Members");
    expect(organizationMembersSectionTitle(null)).toBe("Organization's Members");
  });
});

describe("ORGANIZATION_MEMBERS_SUBTITLE", () => {
  it("mentions membership roles", () => {
    expect(ORGANIZATION_MEMBERS_SUBTITLE).toMatch(/admin/i);
    expect(ORGANIZATION_MEMBERS_SUBTITLE).toMatch(/doctor/i);
    expect(ORGANIZATION_MEMBERS_SUBTITLE).toMatch(/patient/i);
  });
});
