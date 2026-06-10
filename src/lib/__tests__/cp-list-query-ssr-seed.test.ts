import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  seedNotificationsCacheFromSsr,
  seedOrgBillingCacheFromSsr,
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
    expect(qc.getQueryData(queryKeys.invoices.byOrganization("org1"))).toEqual({
      invoices: [{ id: "inv1" }],
    });
    const totalsPayload = qc.getQueryData<{ totals: unknown }>(
      queryKeys.invoices.byOrganizationTotals("org1")
    );
    expect(totalsPayload?.totals).toBeDefined();
  });
});
