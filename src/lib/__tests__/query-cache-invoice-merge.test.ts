import { describe, expect, it } from "vitest";
import type { InvoiceRow } from "@/lib/billing-types";
import { publishInvoiceMergeCrossTab, publishInvoiceRemoveCrossTab } from "@/lib/query-cache-cross-tab";

describe("publishInvoiceMergeCrossTab", () => {
  const row: InvoiceRow = {
    id: "fa491e54-b0b7-42dd-918e-2f4bb96f95af",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    amount: 5000,
    currency: "eur",
    status: "sent",
    created_at: "2026-01-01T00:00:00.000Z",
    payments: [],
  };

  it("publishes without throwing in browser context", () => {
    expect(() =>
      publishInvoiceMergeCrossTab(row, { scope: "billing", patientId: "p1" })
    ).not.toThrow();
  });

  it("publishes remove payload without throwing", () => {
    expect(() =>
      publishInvoiceRemoveCrossTab(row.id, { scope: "full" })
    ).not.toThrow();
  });
});
