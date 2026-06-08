import { describe, expect, it } from "vitest";
import { resolveInvoiceListMetaStatusDates } from "@/lib/invoice-list-meta-status-dates";
import type { InvoiceRow } from "@/lib/billing-types";

const base = (overrides: Partial<InvoiceRow> = {}): InvoiceRow => ({
  id: "11111111-1111-1111-1111-111111111111",
  user_id: "user-1",
  amount: 5000,
  currency: "eur",
  status: "draft",
  created_at: "2026-06-08T10:00:00.000Z",
  payments: [],
  ...overrides,
});

describe("resolveInvoiceListMetaStatusDates", () => {
  it("returns Paid segment when display status is paid and paid_at is set", () => {
    const segments = resolveInvoiceListMetaStatusDates(
      base({
        status: "paid",
        paid_at: "2026-06-10T14:00:00.000Z",
      })
    );
    expect(segments).toEqual([
      { label: "Paid", iso: "2026-06-10T14:00:00.000Z" },
    ]);
  });

  it("returns Refunded segment from refunded payment row", () => {
    const segments = resolveInvoiceListMetaStatusDates(
      base({
        status: "cancelled",
        payments: [
          {
            id: "pay-1",
            amount: 5000,
            status: "refunded",
            created_at: "2026-06-11T09:00:00.000Z",
          },
        ],
      })
    );
    expect(segments).toEqual([
      { label: "Refunded", iso: "2026-06-11T09:00:00.000Z" },
    ]);
  });

  it("omits segment for cancelled without refunded payment", () => {
    expect(
      resolveInvoiceListMetaStatusDates(base({ status: "cancelled" }))
    ).toEqual([]);
  });

  it("prefers Refunded over Paid when payment is refunded", () => {
    const segments = resolveInvoiceListMetaStatusDates(
      base({
        status: "cancelled",
        paid_at: "2026-06-09T12:00:00.000Z",
        payments: [
          {
            id: "pay-1",
            amount: 5000,
            status: "refunded",
            created_at: "2026-06-11T09:00:00.000Z",
          },
        ],
      })
    );
    expect(segments).toEqual([{ label: "Refunded", iso: "2026-06-11T09:00:00.000Z" }]);
  });
});
