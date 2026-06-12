import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  seedControlPanelSectionCacheFromSsr,
  seedNotificationsCacheFromSsr,
  seedOrgBillingCacheFromSsr,
  seedScopedInvoiceBillingCacheFromSsr,
  seedOrganizationsListCacheFromSsr,
  seedOrganizationDetailCacheFromSsr,
} from "@/lib/cp-list-query-ssr-seed";

describe("cp-list-query-ssr-seed", () => {
  it("seedNotificationsCacheFromSsr sets cache when absent", () => {
    const qc = new QueryClient();
    const payload = { notifications: [{ id: "n1" }], total: 1, unreadCount: 1 };
    seedNotificationsCacheFromSsr(qc, payload as never);
    expect(qc.getQueryData(queryKeys.notifications.all)).toEqual(payload);
  });

  it("seedNotificationsCacheFromSsr is no-op when cache warm without updatedAt", () => {
    const qc = new QueryClient();
    const warm = { notifications: [], total: 0, unreadCount: 0 };
    qc.setQueryData(queryKeys.notifications.all, warm);
    seedNotificationsCacheFromSsr(qc, {
      notifications: [{ id: "n2" }],
      total: 1,
      unreadCount: 1,
    } as never);
    expect(qc.getQueryData(queryKeys.notifications.all)).toEqual(warm);
  });

  it("seedNotificationsCacheFromSsr force-writes when updatedAt provided", () => {
    const qc = new QueryClient();
    const warm = { notifications: [], total: 0, unreadCount: 0 };
    qc.setQueryData(queryKeys.notifications.all, warm);
    const ssr = { notifications: [{ id: "n2" }], total: 1, unreadCount: 1 };
    seedNotificationsCacheFromSsr(qc, ssr as never, 12345);
    expect(qc.getQueryData(queryKeys.notifications.all)).toEqual(ssr);
    expect(qc.getQueryState(queryKeys.notifications.all)?.dataUpdatedAt).toBe(12345);
  });

  it("seedOrgBillingCacheFromSsr seeds invoices and totals per org", () => {
    const qc = new QueryClient();
    seedOrgBillingCacheFromSsr(qc, {
      org1: {
        invoices: [{ id: "inv1" }],
        billingKpi: {
          totals: {
            paid: { cents: 100, count: 1 },
            outstanding: { cents: 0, count: 0 },
            refunded: { cents: 0, count: 0 },
            cancelled: { cents: 0, count: 0 },
          },
          statusTotals: {
            draft: { cents: 0, count: 0 },
            sent: { cents: 0, count: 0 },
            paid: { cents: 100, count: 1 },
            overdue: { cents: 0, count: 0 },
            cancelled: { cents: 0, count: 0 },
            refunded: { cents: 0, count: 0 },
          },
        },
      },
    } as never);
    expect(qc.getQueryData(queryKeys.invoices.byOrganization("org1"))).toEqual({
      invoices: [{ id: "inv1" }],
    });
    const totalsPayload = qc.getQueryData<{ totals: unknown }>(
      queryKeys.invoices.byOrganizationTotals("org1")
    );
    expect(totalsPayload?.totals).toBeDefined();
  });

  it("seedScopedInvoiceBillingCacheFromSsr seeds doctor list + totals", () => {
    const qc = new QueryClient();
    const docId = "doc-1";
    seedScopedInvoiceBillingCacheFromSsr(qc, null, {
      [docId]: {
        invoices: [{ id: "inv-d1" }],
        billingKpi: {
          totals: {
            paid: { cents: 200, count: 1 },
            outstanding: { cents: 0, count: 0 },
            refunded: { cents: 0, count: 0 },
            cancelled: { cents: 0, count: 0 },
          },
          statusTotals: {
            draft: { cents: 0, count: 0 },
            sent: { cents: 0, count: 0 },
            paid: { cents: 200, count: 1 },
            overdue: { cents: 0, count: 0 },
            cancelled: { cents: 0, count: 0 },
            refunded: { cents: 0, count: 0 },
          },
        },
      },
    } as never);
    expect(qc.getQueryData(queryKeys.invoices.byDoctor(docId))).toEqual({
      invoices: [{ id: "inv-d1" }],
    });
    expect(
      qc.getQueryData<{ totals: { paid: { cents: number } } }>(
        queryKeys.invoices.byDoctorTotals(docId)
      )?.totals.paid.cents
    ).toBe(200);
  });

  it("seedOrganizationsListCacheFromSsr stores enriched list rows", () => {
    const qc = new QueryClient();
    const enriched = [
      {
        id: "org-1",
        name: "Clinic",
        slug: "clinic",
        owner_user_id: "u1",
        role: "admin",
        created_at: "2026-01-01T00:00:00.000Z",
        member_count: 2,
        members_by_role: { admin: 1, doctor: 1, patient: 0 },
        invoice_count: 1,
        outstanding_cents: 500,
      },
    ];
    seedOrganizationsListCacheFromSsr(qc, enriched);
    expect(qc.getQueryData(queryKeys.organizations.all)).toEqual(enriched);
  });

  it("seedOrganizationDetailCacheFromSsr seeds detail + members", () => {
    const qc = new QueryClient();
    const orgId = "org-detail-1";
    const payload = {
      org: {
        id: orgId,
        name: "Clinic",
        slug: "clinic",
        owner_user_id: "u1",
        owner_label: "Owner",
        owner: null,
        created_at: "2026-01-01T00:00:00.000Z",
      },
      members: [
        {
          id: "m1",
          org_id: orgId,
          user_id: "u1",
          role: "admin",
          joined_at: "2026-01-01T00:00:00.000Z",
          display_name: "Owner",
          email: "o@test.com",
        },
      ],
    };
    seedOrganizationDetailCacheFromSsr(qc, orgId, payload);
    expect(qc.getQueryData(queryKeys.organizations.detail(orgId))).toEqual(payload.org);
    expect(qc.getQueryData(queryKeys.organizations.members(orgId))).toEqual(payload.members);
  });

  it("seedOrganizationDetailCacheFromSsr is no-op when detail cache warm", () => {
    const qc = new QueryClient();
    const orgId = "org-detail-2";
    const warm = {
      id: orgId,
      name: "Warm",
      slug: "warm",
      owner_user_id: "u1",
      owner_label: "U",
      owner: null,
      created_at: "2026-01-01T00:00:00.000Z",
    };
    qc.setQueryData(queryKeys.organizations.detail(orgId), warm);
    seedOrganizationDetailCacheFromSsr(qc, orgId, {
      org: { ...warm, name: "Fresh" },
      members: [],
    });
    expect(qc.getQueryData(queryKeys.organizations.detail(orgId))).toEqual(warm);
  });

  it("seedControlPanelSectionCacheFromSsr seeds invoices and viewer totals", () => {
    const qc = new QueryClient();
    seedControlPanelSectionCacheFromSsr(qc, {
      invoices: [{ id: "inv-all" }],
      invoiceViewerBillingTotals: {
        totals: {
          paid: { cents: 100, count: 1 },
          outstanding: { cents: 0, count: 0 },
          refunded: { cents: 0, count: 0 },
          cancelled: { cents: 0, count: 0 },
        },
        statusTotals: {
          draft: { cents: 0, count: 0 },
          sent: { cents: 0, count: 0 },
          paid: { cents: 100, count: 1 },
          overdue: { cents: 0, count: 0 },
          cancelled: { cents: 0, count: 0 },
          refunded: { cents: 0, count: 0 },
        },
      },
    } as never);
    expect(qc.getQueryData(queryKeys.invoices.all)).toEqual([{ id: "inv-all" }]);
    expect(
      qc.getQueryData<{ totals: { paid: { cents: number } } }>(
        queryKeys.invoices.viewerTotals
      )?.totals.paid.cents
    ).toBe(100);
  });
});
