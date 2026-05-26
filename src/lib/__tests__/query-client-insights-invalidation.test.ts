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
