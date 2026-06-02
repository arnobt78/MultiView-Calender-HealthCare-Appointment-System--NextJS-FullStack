import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/server-prefetch", () => ({
  prefetchInvoicesForOrganization: vi.fn(),
  prefetchInvoiceBillingTotalsForOrganization: vi.fn(),
}));

import { prefetchInvoicesForOrganization } from "@/lib/server-prefetch";
import { prefetchInvoiceBillingTotalsForOrganization } from "@/lib/server-prefetch";
import { prefetchOrgBillingInvoicesByOrgIds } from "@/lib/org-billing-prefetch";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("prefetchOrgBillingInvoicesByOrgIds", () => {
  it("prefetches every org id in parallel", async () => {
    vi.mocked(prefetchInvoicesForOrganization)
      .mockResolvedValueOnce([{ id: "inv-a", amount: 100, status: "paid", currency: "eur", user_id: "u", created_at: "", payments: [] }])
      .mockResolvedValueOnce([{ id: "inv-b", amount: 200, status: "sent", currency: "eur", user_id: "u", created_at: "", payments: [] }]);
    vi.mocked(prefetchInvoiceBillingTotalsForOrganization)
      .mockResolvedValueOnce({
        paid: { cents: 100, count: 1 },
        outstanding: { cents: 0, count: 0 },
        refunded: { cents: 0, count: 0 },
        cancelled: { cents: 0, count: 0 },
      })
      .mockResolvedValueOnce({
        paid: { cents: 0, count: 0 },
        outstanding: { cents: 200, count: 1 },
        refunded: { cents: 0, count: 0 },
        cancelled: { cents: 0, count: 0 },
      });

    const map = await prefetchOrgBillingInvoicesByOrgIds(
      ["org-1", "org-2"],
      "admin-1",
      "admin",
      "a@test.com"
    );

    expect(prefetchInvoicesForOrganization).toHaveBeenCalledTimes(2);
    expect(prefetchInvoiceBillingTotalsForOrganization).toHaveBeenCalledTimes(2);
    expect(map["org-1"]?.invoices).toHaveLength(1);
    expect(map["org-2"]?.invoices).toHaveLength(1);
    expect(map["org-1"]?.totals.paid.cents).toBe(100);
    expect(map["org-2"]?.totals.outstanding.cents).toBe(200);
  });

  it("dedupes org ids", async () => {
    vi.mocked(prefetchInvoicesForOrganization).mockResolvedValue([]);
    vi.mocked(prefetchInvoiceBillingTotalsForOrganization).mockResolvedValue({
      paid: { cents: 0, count: 0 },
      outstanding: { cents: 0, count: 0 },
      refunded: { cents: 0, count: 0 },
      cancelled: { cents: 0, count: 0 },
    });
    await prefetchOrgBillingInvoicesByOrgIds(
      ["org-1", "org-1"],
      "admin-1",
      "admin",
      "a@test.com"
    );
    expect(prefetchInvoicesForOrganization).toHaveBeenCalledTimes(1);
    expect(prefetchInvoiceBillingTotalsForOrganization).toHaveBeenCalledTimes(1);
  });
});
