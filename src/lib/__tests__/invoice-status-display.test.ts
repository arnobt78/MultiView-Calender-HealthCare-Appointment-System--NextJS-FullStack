import { describe, expect, it } from "vitest";
import {
  invoiceAmountTextClassForStatus,
  invoiceStatusInlineTextClass,
} from "@/lib/invoice-status-display";

describe("invoiceStatusInlineTextClass", () => {
  it("returns status-aligned text colors", () => {
    expect(invoiceStatusInlineTextClass("draft")).toBe("text-slate-700");
    expect(invoiceStatusInlineTextClass("sent")).toBe("text-sky-700");
    expect(invoiceStatusInlineTextClass("paid")).toBe("text-emerald-700");
    expect(invoiceStatusInlineTextClass("overdue")).toBe("text-rose-700");
    expect(invoiceStatusInlineTextClass("cancelled")).toBe("text-amber-800");
    expect(invoiceStatusInlineTextClass("refunded")).toBe("text-violet-700");
  });

  it("matches amount text class for the same status", () => {
    expect(invoiceStatusInlineTextClass("sent")).toBe(
      invoiceAmountTextClassForStatus("sent")
    );
  });
});
