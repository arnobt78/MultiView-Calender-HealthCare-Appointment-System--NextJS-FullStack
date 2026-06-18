import { describe, expect, it } from "vitest";
import {
  invoiceAmountTextClassForStatus,
  invoiceDueDateTextClassForInvoice,
  invoiceStatusInlineTextClass,
  isInvoiceDueDatePastAndUnpaid,
  resolveInvoiceDueDateTone,
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

describe("invoiceDueDateTextClassForInvoice", () => {
  it("colors past-due draft invoice rose", () => {
    const invoice = {
      status: "draft",
      due_date: "2020-01-01",
      payments: [],
    };
    expect(isInvoiceDueDatePastAndUnpaid(invoice)).toBe(true);
    expect(resolveInvoiceDueDateTone(invoice)).toBe("pastDue");
    expect(invoiceDueDateTextClassForInvoice(invoice)).toBe("text-rose-600");
  });

  it("colors future sent invoice sky", () => {
    const invoice = {
      status: "sent",
      due_date: "2099-12-31",
      payments: [],
    };
    expect(resolveInvoiceDueDateTone(invoice)).toBe("sent");
    expect(invoiceDueDateTextClassForInvoice(invoice)).toBe("text-sky-700");
  });

  it("colors paid invoice emerald", () => {
    const invoice = {
      status: "paid",
      due_date: "2020-01-01",
      paid_at: "2020-01-02T00:00:00.000Z",
      payments: [],
    };
    expect(resolveInvoiceDueDateTone(invoice)).toBe("paid");
    expect(invoiceDueDateTextClassForInvoice(invoice)).toBe("text-emerald-700");
  });

  it("colors future draft invoice slate", () => {
    const invoice = {
      status: "draft",
      due_date: "2099-06-01",
      payments: [],
    };
    expect(resolveInvoiceDueDateTone(invoice)).toBe("draft");
    expect(invoiceDueDateTextClassForInvoice(invoice)).toBe("text-slate-700");
  });
});
