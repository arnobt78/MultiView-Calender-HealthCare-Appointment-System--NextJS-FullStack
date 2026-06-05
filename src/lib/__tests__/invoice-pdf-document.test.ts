import { describe, expect, it } from "vitest";
import { buildInvoicePrintHtml } from "@/lib/invoice-pdf-document";
import type { Invoice } from "@/hooks/usePayments";

function baseInvoice(): Invoice {
  return {
    id: "7d041eb7-aaaa-bbbb-cccc-ddddeeeeffff",
    user_id: "u-1",
    amount: 15000,
    currency: "eur",
    status: "draft",
    description: "Demo visit invoice",
    created_at: "2026-06-01T10:00:00.000Z",
    payments: [],
    issuer_label: "Demo Doctor",
    visit_summary: {
      appointment_id: "a-1",
      title: "Follow-up",
      start_iso: "2026-06-01T10:00:00.000Z",
      end_iso: "2026-06-01T10:30:00.000Z",
      when_label: "Mon, 01 Jun 2026 · 12:00 - 12:30",
      location_label: "Demo Clinic",
      is_telehealth: false,
      patient_id: "p-1",
      patient_label: "Demo Patient",
      appointment_type_name: "Follow-up Visit",
      category_id: null,
      category_label: null,
      category_color: null,
      category_icon: null,
      treating_physician_id: null,
      treating_physician_label: null,
      treating_physician_specialty: null,
      calendar_owner_id: null,
      calendar_owner_label: null,
      calendar_owner_specialty: null,
    },
  };
}

describe("buildInvoicePrintHtml", () => {
  it("includes invoice id, amount, patient, and visit context", () => {
    const html = buildInvoicePrintHtml(baseInvoice());
    expect(html).toContain("7d041eb7");
    expect(html).toContain("150,00");
    expect(html).toContain("Demo Patient");
    expect(html).toContain("Follow-up Visit");
    expect(html).toContain("Demo Doctor");
  });

  it("escapes HTML in description", () => {
    const html = buildInvoicePrintHtml({
      ...baseInvoice(),
      description: "<script>alert(1)</script>",
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("injects auto-print script when requested", () => {
    const html = buildInvoicePrintHtml(baseInvoice(), { autoPrint: true });
    expect(html).toContain("window.print");
  });
});
