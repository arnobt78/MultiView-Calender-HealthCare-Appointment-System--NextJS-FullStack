import { describe, expect, it } from "vitest";
import { buildOrganizationManagementColumns } from "@/lib/organization-management-columns";
import type { Organization } from "@/hooks/useOrganization";

const org: Organization = {
  id: "org-1",
  name: "HealthCal Clinic",
  slug: "healthcal-clinic",
  owner_user_id: "u-1",
  role: "admin",
  created_at: "2024-03-01T00:00:00Z",
  member_count: 2,
  members_by_role: { admin: 1, doctor: 1, patient: 0 },
  invoice_count: 1,
  outstanding_cents: 1200,
};

describe("buildOrganizationManagementColumns", () => {
  it("defines organization, members, invoices, and actions columns", () => {
    const columns = buildOrganizationManagementColumns({
      renderActions: () => null,
    });
    const ids = columns.map((c) => c.id);
    expect(ids).toEqual([
      "organization",
      "your_role",
      "members",
      "invoices",
      "outstanding",
      "created",
      "actions",
    ]);
  });

  it("members column uses member_count accessor", () => {
    const columns = buildOrganizationManagementColumns({
      renderActions: () => null,
    });
    const membersCol = columns.find((c) => c.id === "members") as {
      accessorFn?: (row: Organization) => number;
    };
    expect(membersCol?.accessorFn?.(org)).toBe(2);
  });
});
