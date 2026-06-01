import { describe, expect, it } from "vitest";
import { mapApiInvoiceToRow } from "@/lib/billing-invoice-map";

describe("mapApiInvoiceToRow", () => {
  it("normalizes dates and payments", () => {
    const row = mapApiInvoiceToRow({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      user_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      amount: 15000,
      currency: "eur",
      status: "sent",
      created_at: new Date("2026-01-15T10:00:00.000Z"),
      due_date: new Date("2026-02-01T00:00:00.000Z"),
      payments: [
        {
          id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          amount: 15000,
          status: "succeeded",
          created_at: new Date("2026-01-20T12:00:00.000Z"),
        },
      ],
    });
    expect(row.due_date).toBe("2026-02-01");
    expect(row.payments[0]?.created_at).toContain("2026-01-20");
  });
});
