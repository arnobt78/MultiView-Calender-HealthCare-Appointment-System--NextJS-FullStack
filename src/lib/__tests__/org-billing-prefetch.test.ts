import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/server-prefetch", () => ({
  prefetchInvoicesForOrganization: vi.fn(),
}));

import { prefetchInvoicesForOrganization } from "@/lib/server-prefetch";
import { prefetchOrgBillingInvoicesByOrgIds } from "@/lib/org-billing-prefetch";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("prefetchOrgBillingInvoicesByOrgIds", () => {
  it("prefetches every org id in parallel", async () => {
    vi.mocked(prefetchInvoicesForOrganization)
      .mockResolvedValueOnce([{ id: "inv-a", amount: 100, status: "paid", currency: "eur", user_id: "u", created_at: "", payments: [] }])
      .mockResolvedValueOnce([{ id: "inv-b", amount: 200, status: "sent", currency: "eur", user_id: "u", created_at: "", payments: [] }]);

    const map = await prefetchOrgBillingInvoicesByOrgIds(
      ["org-1", "org-2"],
      "admin-1",
      "admin",
      "a@test.com"
    );

    expect(prefetchInvoicesForOrganization).toHaveBeenCalledTimes(2);
    expect(map["org-1"]?.invoices).toHaveLength(1);
    expect(map["org-2"]?.invoices).toHaveLength(1);
  });

  it("dedupes org ids", async () => {
    vi.mocked(prefetchInvoicesForOrganization).mockResolvedValue([]);
    await prefetchOrgBillingInvoicesByOrgIds(
      ["org-1", "org-1"],
      "admin-1",
      "admin",
      "a@test.com"
    );
    expect(prefetchInvoicesForOrganization).toHaveBeenCalledTimes(1);
  });
});
