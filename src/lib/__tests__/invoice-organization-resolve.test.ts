import { describe, expect, it, vi, beforeEach } from "vitest";

const { findMany, userCanAccess, getAdminOrgIds } = vi.hoisted(() => ({
  findMany: vi.fn(),
  userCanAccess: vi.fn(),
  getAdminOrgIds: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    organizationMember: { findMany },
  },
}));

vi.mock("@/lib/organization-invoice-access", () => ({
  userCanAccessOrganizationInvoices: userCanAccess,
  getOrganizationAdminOrgIds: getAdminOrgIds,
}));

import { resolveInvoiceOrganizationId } from "@/lib/invoice-organization-resolve";

describe("resolveInvoiceOrganizationId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns explicit org for platform admin", async () => {
    const orgId = "11111111-1111-4111-8111-111111111111";
    const result = await resolveInvoiceOrganizationId({
      sessionUserId: "u1",
      role: "admin",
      appointmentId: null,
      billingUserId: "u2",
      explicitOrganizationId: orgId,
    });
    expect(result).toEqual({ organizationId: orgId });
    expect(findMany).not.toHaveBeenCalled();
  });

  it("forbids explicit org when org admin check fails", async () => {
    userCanAccess.mockResolvedValue(false);
    const orgId = "11111111-1111-4111-8111-111111111111";
    const result = await resolveInvoiceOrganizationId({
      sessionUserId: "u1",
      role: "doctor",
      appointmentId: null,
      billingUserId: "u2",
      explicitOrganizationId: orgId,
    });
    expect(result.forbidden).toBe(true);
  });

  it("auto-tags single billing doctor org", async () => {
    const orgId = "22222222-2222-4222-8222-222222222222";
    findMany.mockResolvedValue([{ org_id: orgId }]);
    const result = await resolveInvoiceOrganizationId({
      sessionUserId: "doc",
      role: "doctor",
      appointmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      billingUserId: "doc",
      explicitOrganizationId: null,
    });
    expect(result.organizationId).toBe(orgId);
  });

  it("picks shared org when creator is org admin on one of billing doctor orgs", async () => {
    const orgA = "33333333-3333-4333-8333-333333333333";
    const orgB = "44444444-4444-4444-8444-444444444444";
    findMany.mockResolvedValue([{ org_id: orgA }, { org_id: orgB }]);
    getAdminOrgIds.mockResolvedValue([orgB]);
    const result = await resolveInvoiceOrganizationId({
      sessionUserId: "admin-member",
      role: "doctor",
      appointmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      billingUserId: "doc",
    });
    expect(result.organizationId).toBe(orgB);
  });

  it("falls back to earliest billing doctor org when ambiguous", async () => {
    const orgA = "33333333-3333-4333-8333-333333333333";
    const orgB = "44444444-4444-4444-8444-444444444444";
    findMany.mockResolvedValue([{ org_id: orgA }, { org_id: orgB }]);
    getAdminOrgIds.mockResolvedValue([]);
    const result = await resolveInvoiceOrganizationId({
      sessionUserId: "doc",
      role: "doctor",
      appointmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      billingUserId: "doc",
    });
    expect(result.organizationId).toBe(orgA);
  });
});
