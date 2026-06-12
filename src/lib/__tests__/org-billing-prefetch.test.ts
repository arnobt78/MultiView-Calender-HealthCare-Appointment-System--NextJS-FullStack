import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/server-prefetch", () => ({
  prefetchInvoicesForOrganization: vi.fn(),
  prefetchInvoiceBillingTotalsForOrganization: vi.fn(),
}));

import { prefetchInvoicesForOrganization } from "@/lib/server-prefetch";
import { prefetchInvoiceBillingTotalsForOrganization } from "@/lib/server-prefetch";
import { emptyInvoiceBillingStatusTotals } from "@/lib/invoice-billing-totals";
import { prefetchOrgBillingInvoicesByOrgIds } from "@/lib/org-billing-prefetch";

const EMPTY_STATUS = emptyInvoiceBillingStatusTotals();

const KPI_FIXTURE = {
  totals: {
    paid: { cents: 100, count: 1 },
    outstanding: { cents: 0, count: 0 },
    refunded: { cents: 0, count: 0 },
    cancelled: { cents: 0, count: 0 },
  },
  statusTotals: { ...EMPTY_STATUS, paid: { cents: 100, count: 1 } },
  paidPeriod: { paidInPeriodCents: 100, paidInPeriodCount: 1, paidPrevPeriodCents: 0 },
  extendedKpis: {
    totalCount: 1,
    totalAmountCents: 100,
    avgInvoiceCents: 100,
    paymentSuccessPct: 100,
    paymentAttemptCount: 1,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("prefetchOrgBillingInvoicesByOrgIds", () => {
  it("prefetches every org id in parallel", async () => {
    vi.mocked(prefetchInvoicesForOrganization)
      .mockResolvedValueOnce([{ id: "inv-a", amount: 100, status: "paid", currency: "eur", user_id: "u", created_at: "", payments: [] }])
      .mockResolvedValueOnce([{ id: "inv-b", amount: 200, status: "sent", currency: "eur", user_id: "u", created_at: "", payments: [] }]);
    vi.mocked(prefetchInvoiceBillingTotalsForOrganization)
      .mockResolvedValueOnce(KPI_FIXTURE)
      .mockResolvedValueOnce({
        ...KPI_FIXTURE,
        totals: {
          paid: { cents: 0, count: 0 },
          outstanding: { cents: 200, count: 1 },
          refunded: { cents: 0, count: 0 },
          cancelled: { cents: 0, count: 0 },
        },
        statusTotals: { ...EMPTY_STATUS, sent: { cents: 200, count: 1 } },
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
    expect(map["org-1"]?.billingKpi.totals.paid.cents).toBe(100);
    expect(map["org-2"]?.billingKpi.totals.outstanding.cents).toBe(200);
  });

  it("dedupes org ids", async () => {
    vi.mocked(prefetchInvoicesForOrganization).mockResolvedValue([]);
    vi.mocked(prefetchInvoiceBillingTotalsForOrganization).mockResolvedValue({
      totals: {
        paid: { cents: 0, count: 0 },
        outstanding: { cents: 0, count: 0 },
        refunded: { cents: 0, count: 0 },
        cancelled: { cents: 0, count: 0 },
      },
      statusTotals: EMPTY_STATUS,
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
