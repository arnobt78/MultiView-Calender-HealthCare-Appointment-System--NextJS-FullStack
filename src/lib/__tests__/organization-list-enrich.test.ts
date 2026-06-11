import { describe, expect, it } from "vitest";
import {
  countMembersByRole,
  mapOrganizationListRows,
  sumOutstandingCents,
} from "@/lib/organization-list-enrich";

describe("organization-list-enrich", () => {
  it("countMembersByRole rolls admin/doctor/patient", () => {
    expect(
      countMembersByRole([
        { role: "admin" },
        { role: "doctor" },
        { role: "doctor" },
        { role: "patient" },
      ])
    ).toEqual({ admin: 1, doctor: 2, patient: 1 });
  });

  it("sumOutstandingCents includes draft/sent/overdue only", () => {
    expect(
      sumOutstandingCents([
        { status: "draft", amount: 1000 },
        { status: "sent", amount: 500 },
        { status: "paid", amount: 9000 },
        { status: "overdue", amount: 250 },
        { status: "cancelled", amount: 100 },
      ])
    ).toBe(1750);
  });

  it("mapOrganizationListRows produces enriched list shape", () => {
    const rows = mapOrganizationListRows([
      {
        role: "admin",
        organization: {
          id: "org-1",
          name: "Clinic A",
          slug: "clinic-a",
          owner_user_id: "u-1",
          created_at: new Date("2024-01-15T10:00:00Z"),
          description: null,
          website: null,
          address: null,
          phone: null,
          timezone: null,
          logo_url: null,
          org_type: "clinic",
          members: [{ role: "admin" }, { role: "doctor" }],
          invoices: [
            { status: "sent", amount: 2000 },
            { status: "paid", amount: 1000 },
          ],
        },
      },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "org-1",
      name: "Clinic A",
      role: "admin",
      member_count: 2,
      members_by_role: { admin: 1, doctor: 1, patient: 0 },
      invoice_count: 2,
      outstanding_cents: 2000,
      org_type: "clinic",
    });
  });
});
