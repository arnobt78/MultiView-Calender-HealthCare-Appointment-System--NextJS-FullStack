import { describe, expect, it } from "vitest";
import { deriveOrganizationListMetrics } from "@/hooks/useOrganizationListMetrics";
import type { Organization } from "@/hooks/useOrganization";

const sampleOrgs: Organization[] = [
  {
    id: "1",
    name: "A",
    slug: "a",
    owner_user_id: "u1",
    role: "admin",
    created_at: "2024-01-01T00:00:00Z",
    member_count: 3,
    members_by_role: { admin: 1, doctor: 1, patient: 1 },
    invoice_count: 2,
    outstanding_cents: 5000,
  },
  {
    id: "2",
    name: "B",
    slug: "b",
    owner_user_id: "u2",
    role: "doctor",
    created_at: "2024-02-01T00:00:00Z",
    member_count: 1,
    members_by_role: { admin: 0, doctor: 1, patient: 0 },
    invoice_count: 0,
    outstanding_cents: 0,
  },
];

describe("deriveOrganizationListMetrics", () => {
  it("derives totals from enriched org rows", () => {
    expect(deriveOrganizationListMetrics(sampleOrgs)).toEqual({
      totalOrgs: 2,
      totalMembers: 4,
      totalAdmins: 1,
      totalDoctors: 2,
      totalPatients: 1,
      totalInvoices: 2,
      totalOutstandingCents: 5000,
    });
  });
});
