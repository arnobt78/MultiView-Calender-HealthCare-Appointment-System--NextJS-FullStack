import { describe, expect, it } from "vitest";
import {
  resolveInvoiceDetailActionCapabilities,
  resolveInvoiceDetailGenerateInHeader,
  resolveInvoiceDetailSendInFooter,
} from "@/lib/invoice-detail-action-capabilities";
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
    expect(caps.canGenerateInvoice).toBe(true);
    expect(caps.canDownloadPdf).toBe(true);
    expect(caps.canPay).toBe(true);
    expect(caps.canSend).toBe(true);
    expect(caps.canMarkPaid).toBe(true);
    expect(caps.canEditDetails).toBe(true);
    expect(caps.canDelete).toBe(true);
    expect(caps.canRefund).toBe(false);
  });

  it("admin paid: refund only among write actions", () => {
    const caps = resolveInvoiceDetailActionCapabilities(invoice("paid"), "admin");
    expect(caps.canGenerateInvoice).toBe(false);
    expect(caps.canDownloadPdf).toBe(true);
    expect(caps.canPay).toBe(false);
    expect(caps.canSend).toBe(false);
    expect(caps.canMarkPaid).toBe(false);
    expect(caps.canEditDetails).toBe(false);
    expect(caps.canDelete).toBe(false);
    expect(caps.canRefund).toBe(true);
  });

  it("doctor draft without viewerUserId: legacy send and edit caps", () => {
    const caps = resolveInvoiceDetailActionCapabilities(invoice("draft"), "doctor");
    expect(caps.canPay).toBe(false);
    expect(caps.canSend).toBe(true);
    expect(caps.canEditDetails).toBe(true);
    expect(caps.canRefund).toBe(false);
  });

  it("doctor draft issuer: send and edit when viewerUserId matches user_id", () => {
    const inv = { ...invoice("draft"), user_id: "doc-issuer" };
    const caps = resolveInvoiceDetailActionCapabilities(inv, "doctor", {
      viewerUserId: "doc-issuer",
    });
    expect(caps.canSend).toBe(true);
    expect(caps.canEditDetails).toBe(true);
    expect(caps.canDelete).toBe(true);
    expect(caps.canCancel).toBe(true);
  });

  it("doctor draft calendar owner (non-issuer): send and edit when visit_summary matches", () => {
    const inv = {
      ...invoice("draft"),
      user_id: "doc-issuer",
      visit_summary: {
        appointment_id: "appt-1",
        treating_physician_id: "doc-issuer",
        treating_physician_label: "Issuer",
        treating_physician_specialty: null,
        calendar_owner_id: "doc-owner",
        calendar_owner_label: "Owner",
        calendar_owner_specialty: null,
        patient_id: null,
        patient_label: null,
        category_id: null,
        category_label: null,
        category_color: null,
        category_icon: null,
      },
    };
    const caps = resolveInvoiceDetailActionCapabilities(inv as Invoice, "doctor", {
      viewerUserId: "doc-owner",
    });
    expect(caps.canSend).toBe(true);
    expect(caps.canEditDetails).toBe(true);
    expect(caps.canDelete).toBe(true);
  });

  it("doctor draft treating physician (non-issuer): mutate caps", () => {
    const inv = {
      ...invoice("draft"),
      user_id: "doc-owner",
      visit_summary: {
        appointment_id: "appt-1",
        treating_physician_id: "doc-treating",
        treating_physician_label: "Treating",
        treating_physician_specialty: null,
        calendar_owner_id: "doc-owner",
        calendar_owner_label: "Owner",
        calendar_owner_specialty: null,
        patient_id: null,
        patient_label: null,
        category_id: null,
        category_label: null,
        category_color: null,
        category_icon: null,
      },
    };
    const caps = resolveInvoiceDetailActionCapabilities(inv as Invoice, "doctor", {
      viewerUserId: "doc-treating",
    });
    expect(caps.canSend).toBe(true);
    expect(caps.canEditDetails).toBe(true);
  });

  it("doctor draft unrelated: no send, edit, delete, or cancel", () => {
    const inv = { ...invoice("draft"), user_id: "doc-issuer" };
    const caps = resolveInvoiceDetailActionCapabilities(inv, "doctor", {
      viewerUserId: "doc-unrelated",
    });
    expect(caps.canSend).toBe(false);
    expect(caps.canEditDetails).toBe(false);
    expect(caps.canDelete).toBe(false);
    expect(caps.canCancel).toBe(false);
    expect(caps.canDownloadPdf).toBe(true);
  });

  it("cancelled: no mark paid or cancel; delete still allowed", () => {
    const caps = resolveInvoiceDetailActionCapabilities(invoice("cancelled"), "admin");
    expect(caps.canMarkPaid).toBe(false);
    expect(caps.canCancel).toBe(false);
    expect(caps.canDelete).toBe(true);
  });

  it("draft admin: Generate in header, not Send in footer", () => {
    const caps = resolveInvoiceDetailActionCapabilities(invoice("draft"), "admin");
    expect(resolveInvoiceDetailGenerateInHeader("admin", caps)).toBe(true);
    expect(resolveInvoiceDetailSendInFooter("admin", caps)).toBe(false);
  });

  it("draft mutate doctor: Generate in header hides footer Send", () => {
    const caps = resolveInvoiceDetailActionCapabilities(invoice("draft"), "doctor");
    expect(resolveInvoiceDetailGenerateInHeader("mutate", caps)).toBe(true);
    expect(resolveInvoiceDetailSendInFooter("mutate", caps)).toBe(false);
  });
});
