import { describe, expect, it } from "vitest";
import { resolveInvoiceDetailActionCapabilities } from "@/lib/invoice-detail-action-capabilities";
import type { Invoice } from "@/hooks/usePayments";

function invoice(status: string): Invoice {
  return {
    id: "inv-1",
    user_id: "u-1",
    amount: 10000,
    currency: "eur",
    status,
    created_at: new Date().toISOString(),
    payments: [],
  };
}

describe("resolveInvoiceDetailActionCapabilities", () => {
  it("admin draft: pay, send, mark paid, edit, delete; no refund", () => {
    const caps = resolveInvoiceDetailActionCapabilities(invoice("draft"), "admin");
    expect(caps.canPay).toBe(true);
    expect(caps.canSend).toBe(true);
    expect(caps.canMarkPaid).toBe(true);
    expect(caps.canEditDetails).toBe(true);
    expect(caps.canDelete).toBe(true);
    expect(caps.canRefund).toBe(false);
  });

  it("admin paid: refund only among write actions", () => {
    const caps = resolveInvoiceDetailActionCapabilities(invoice("paid"), "admin");
    expect(caps.canPay).toBe(false);
    expect(caps.canSend).toBe(false);
    expect(caps.canMarkPaid).toBe(false);
    expect(caps.canEditDetails).toBe(false);
    expect(caps.canDelete).toBe(false);
    expect(caps.canRefund).toBe(true);
  });

  it("doctor draft: send and edit; no admin pay/refund", () => {
    const caps = resolveInvoiceDetailActionCapabilities(invoice("draft"), "doctor");
    expect(caps.canPay).toBe(false);
    expect(caps.canSend).toBe(true);
    expect(caps.canEditDetails).toBe(true);
    expect(caps.canRefund).toBe(false);
  });

  it("cancelled: no mark paid or cancel; delete still allowed", () => {
    const caps = resolveInvoiceDetailActionCapabilities(invoice("cancelled"), "admin");
    expect(caps.canMarkPaid).toBe(false);
    expect(caps.canCancel).toBe(false);
    expect(caps.canDelete).toBe(true);
  });
});
