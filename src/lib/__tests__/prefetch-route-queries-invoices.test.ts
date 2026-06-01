import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

const apiClient = vi.fn();

vi.mock("@/lib/api-client", () => ({
  apiClient: (...args: unknown[]) => apiClient(...args),
}));

import { prefetchQueriesForDetailHref } from "@/lib/prefetch-route-queries";

describe("prefetchQueriesForDetailHref invoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.mockResolvedValue({
      invoice: {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        user_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        amount: 1000,
        currency: "eur",
        status: "sent",
        created_at: "2026-01-01T00:00:00.000Z",
        payments: [],
      },
    });
  });

  it.each([
    ["/invoices/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"],
    ["/control-panel/invoices/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"],
  ])("prefetches invoice detail for %s", async (href) => {
    const qc = new QueryClient();
    prefetchQueriesForDetailHref(qc, href);
    await vi.waitFor(() => {
      expect(apiClient).toHaveBeenCalledWith(
        "/api/invoices/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
      );
    });
    await vi.waitFor(() => {
      expect(
        qc.getQueryData(
          queryKeys.invoices.detail("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")
        )
      ).toBeTruthy();
    });
  });
});
