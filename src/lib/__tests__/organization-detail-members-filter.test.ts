import { describe, expect, it } from "vitest";
import {
  filterOrganizationDetailMembers,
  organizationDetailMemberDisplayName,
  organizationDetailMemberSearchHaystack,
} from "@/lib/organization-detail-members-filter";
import type { OrganizationDetailMemberRow } from "@/lib/organization-detail-members-columns";

const adminRow: OrganizationDetailMemberRow = {
  id: "mem-admin-1",
  org_id: "org-1",
  user_id: "user-admin",
  role: "admin",
  joined_at: "2026-06-01T00:00:00Z",
  display_name: "Demo Admin",
  email: "test@admin.com",
};

const doctorRow: OrganizationDetailMemberRow = {
  id: "mem-doc-1",
  org_id: "org-1",
  user_id: "user-doc",
  role: "doctor",
  joined_at: "2026-06-01T00:00:00Z",
  display_name: "Demo Doctor",
  email: "doc@clinic.com",
  specialty: "Cardiology",
};

const patientRow: OrganizationDetailMemberRow = {
  id: "mem-pat-1",
  org_id: "org-1",
  user_id: "user-pat",
  role: "patient",
  joined_at: "2026-06-01T00:00:00Z",
  display_name: "Demo Patient",
  email: "test@patient.com",
  patient_id: "pat-1",
  patient_firstname: "Thomas",
  patient_lastname: "Weber",
  care_level: 3,
};

const sample = [adminRow, doctorRow, patientRow];

describe("organizationDetailMemberDisplayName", () => {
  it("uses patient clinical name when present", () => {
    expect(organizationDetailMemberDisplayName(patientRow)).toBe("Thomas Weber");
  });

  it("falls back to display_name for non-patient rows", () => {
    expect(organizationDetailMemberDisplayName(doctorRow)).toBe("Demo Doctor");
  });
});

describe("organizationDetailMemberSearchHaystack", () => {
  it("includes specialty and email tokens", () => {
    const haystack = organizationDetailMemberSearchHaystack(doctorRow);
    expect(haystack).toContain("cardiology");
    expect(haystack).toContain("doc@clinic.com");
  });
});

describe("filterOrganizationDetailMembers", () => {
  it("returns all rows when filters are default", () => {
    expect(filterOrganizationDetailMembers(sample, { search: "", role: "all" })).toHaveLength(3);
  });

  it("filters by role", () => {
    expect(
      filterOrganizationDetailMembers(sample, { search: "", role: "doctor" }).map((m) => m.role)
    ).toEqual(["doctor"]);
  });

  it("filters by search term across email and specialty", () => {
    expect(
      filterOrganizationDetailMembers(sample, { search: "cardiology", role: "all" })
    ).toHaveLength(1);
    expect(
      filterOrganizationDetailMembers(sample, { search: "test@admin", role: "all" })
    ).toHaveLength(1);
  });

  it("filters by patient clinical name", () => {
    expect(
      filterOrganizationDetailMembers(sample, { search: "thomas", role: "all" })
    ).toHaveLength(1);
  });

  it("combines role and search", () => {
    expect(
      filterOrganizationDetailMembers(sample, { search: "cardiology", role: "doctor" })
    ).toHaveLength(1);
    expect(
      filterOrganizationDetailMembers(sample, { search: "test@admin", role: "admin" })
    ).toHaveLength(1);
    expect(
      filterOrganizationDetailMembers(sample, { search: "thomas", role: "patient" })
    ).toHaveLength(1);
    expect(
      filterOrganizationDetailMembers(sample, { search: "cardiology", role: "patient" })
    ).toHaveLength(0);
  });
});
