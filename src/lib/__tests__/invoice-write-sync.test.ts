import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { syncInvoicesAfterWrite } from "@/lib/query-client";

describe("syncInvoicesAfterWrite", () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = new QueryClient();
    vi.restoreAllMocks();
  });

  it("skips invoices.all invalidation when cachesMerged", async () => {
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");
    await syncInvoicesAfterWrite(qc, {
      invoiceId: "11111111-1111-4111-8111-111111111111",
      scope: "billing",
      cachesMerged: true,
    });
    const keys = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).not.toContainEqual(queryKeys.invoices.all);
    expect(keys).not.toContainEqual(
      queryKeys.invoices.detail("11111111-1111-4111-8111-111111111111")
    );
    expect(keys).toContainEqual(queryKeys.billing.root);
  });

  it("invalidates invoices.all when cachesMerged is false", async () => {
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");
    await syncInvoicesAfterWrite(qc, {
      invoiceId: "11111111-1111-4111-8111-111111111111",
      scope: "billing",
      cachesMerged: false,
    });
    const keys = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).toContainEqual(queryKeys.invoices.all);
  });
});
