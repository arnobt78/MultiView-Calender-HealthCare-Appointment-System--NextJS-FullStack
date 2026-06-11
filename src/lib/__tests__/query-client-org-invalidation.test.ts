import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { CROSS_TAB_SCOPES } from "@/lib/query-cache-cross-tab";

const publishQueryCacheCrossTab = vi.fn();

vi.mock("@/lib/query-cache-cross-tab", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/query-cache-cross-tab")>();
  return {
    ...actual,
    publishQueryCacheCrossTab: (...args: unknown[]) => publishQueryCacheCrossTab(...args),
  };
});

import { invalidateOrganizationDetail } from "@/lib/query-client";

describe("invalidateOrganizationDetail", () => {
  beforeEach(() => {
    publishQueryCacheCrossTab.mockClear();
  });

  it("invalidates detail, members, and org billing keys", async () => {
    const qc = new QueryClient();
    const orgId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    qc.setQueryData(queryKeys.organizations.detail(orgId), { id: orgId, name: "A" });
    qc.setQueryData(queryKeys.organizations.members(orgId), []);
    qc.setQueryData(queryKeys.invoices.byOrganization(orgId), { invoices: [] });
    qc.setQueryData(queryKeys.invoices.byOrganizationTotals(orgId), { totals: {} });

    await invalidateOrganizationDetail(qc, orgId);

    expect(qc.getQueryState(queryKeys.organizations.detail(orgId))?.isInvalidated).toBe(true);
    expect(qc.getQueryState(queryKeys.organizations.members(orgId))?.isInvalidated).toBe(true);
    expect(qc.getQueryState(queryKeys.invoices.byOrganization(orgId))?.isInvalidated).toBe(true);
    expect(
      qc.getQueryState(queryKeys.invoices.byOrganizationTotals(orgId))?.isInvalidated
    ).toBe(true);
  });

  it("publishes ORGANIZATIONS and INVOICES_BILLING cross-tab scopes", async () => {
    const qc = new QueryClient();
    await invalidateOrganizationDetail(qc, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(publishQueryCacheCrossTab).toHaveBeenCalledWith(CROSS_TAB_SCOPES.ORGANIZATIONS);
    expect(publishQueryCacheCrossTab).toHaveBeenCalledWith(CROSS_TAB_SCOPES.INVOICES_BILLING);
  });
});
