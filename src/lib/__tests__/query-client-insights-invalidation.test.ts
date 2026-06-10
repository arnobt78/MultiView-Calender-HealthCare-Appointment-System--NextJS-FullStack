import { describe, it, expect } from "vitest";
import {
  createQueryClient,
  invalidateInsightsAndAnalytics,
  invalidateQueriesForRoute,
} from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";

describe("invalidateInsightsAndAnalytics", () => {
  it("marks all insights filter variants stale", async () => {
    const qc = createQueryClient();
    const personalKey = queryKeys.insights.filter({
      scope: "personal",
      period: "month",
    });
    const orgKey = queryKeys.insights.filter({
      scope: "organization",
      period: "month",
    });

    qc.setQueryData(personalKey, { overview: { total: 1 } });
    qc.setQueryData(orgKey, { overview: { total: 2 } });

    await invalidateInsightsAndAnalytics(qc);

    expect(qc.getQueryState(personalKey)?.isInvalidated).toBe(true);
    expect(qc.getQueryState(orgKey)?.isInvalidated).toBe(true);
  });
});

describe("invalidateQueriesForRoute insights", () => {
  it("marks insights stale when navigating back to /insights", async () => {
    const qc = createQueryClient();
    const key = queryKeys.insights.filter({ scope: "personal", period: "month" });
    qc.setQueryData(key, { overview: { total: 5 } });

    await invalidateQueriesForRoute(qc, "/insights");

    expect(qc.getQueryState(key)?.isInvalidated).toBe(true);
  });
});

describe("invalidateQueriesForRoute CP list paths C14", () => {
  it("invalidates users on user-admin-management back", async () => {
    const qc = createQueryClient();
    qc.setQueryData(queryKeys.users.all, { users: [], total: 0 });
    await invalidateQueriesForRoute(qc, "/control-panel/user-admin-management");
    expect(qc.getQueryState(queryKeys.users.all)?.isInvalidated).toBe(true);
  });

  it("invalidates organizations on organization-management back", async () => {
    const qc = createQueryClient();
    qc.setQueryData(queryKeys.organizations.all, []);
    await invalidateQueriesForRoute(qc, "/control-panel/organization-management");
    expect(qc.getQueryState(queryKeys.organizations.all)?.isInvalidated).toBe(true);
  });

  it("invalidates invoices on invoice-management back", async () => {
    const qc = createQueryClient();
    qc.setQueryData(queryKeys.invoices.all, []);
    await invalidateQueriesForRoute(qc, "/control-panel/invoice-management");
    expect(qc.getQueryState(queryKeys.invoices.all)?.isInvalidated).toBe(true);
  });
});
