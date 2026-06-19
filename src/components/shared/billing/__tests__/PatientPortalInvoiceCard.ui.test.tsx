import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PatientPortalInvoiceCard } from "@/components/shared/billing/PatientPortalInvoiceCard";
import type { Invoice } from "@/hooks/usePayments";

vi.mock("@/components/shared/EntityTitleLink", () => ({
  EntityTitleLink: ({ label, wrapLabel }: { label: string; wrapLabel?: boolean }) => (
    <span data-wrap-label={wrapLabel ? "1" : "0"}>{label}</span>
  ),
}));

vi.mock("@/components/shared/billing/InvoiceAmountDisplay", () => ({
  InvoiceAmountDisplay: () => <span>€150</span>,
}));

vi.mock("@/components/shared/billing/InvoiceStatusBadge", () => ({
  InvoiceStatusBadge: () => <span>Draft</span>,
}));

vi.mock("@/components/shared/billing/InvoiceVisitMetaLine", () => ({
  InvoiceVisitMetaLine: () => <span data-testid="visit-meta" />,
}));

vi.mock("@/components/shared/billing/InvoicePayActions", () => ({
  InvoicePayActions: ({ isPaying }: { isPaying?: boolean }) => (
    <button type="button" data-paying={isPaying ? "1" : "0"}>
      {isPaying ? "Redirecting…" : "Pay Now"}
    </button>
  ),
}));

vi.mock("@/components/shared/doctor-display/DoctorIdentityRow", () => ({
  DoctorIdentityRow: ({ layout, showRoleBadge }: { layout?: string; showRoleBadge?: boolean }) => (
    <span data-testid="doctor-row" data-layout={layout} data-role-badge={showRoleBadge ? "1" : "0"} />
  ),
}));

vi.mock("@/components/shared/billing/InvoiceIssuedByMeta", () => ({
  InvoiceIssuedByMeta: ({ layout, issuerRole }: { layout?: string; issuerRole?: string | null }) => (
    <span data-testid="issued-meta" data-layout={layout} data-role={issuerRole ?? ""} />
  ),
}));

const invoice = {
  id: "inv-1",
  user_id: "user-1",
  amount: 15000,
  currency: "eur",
  status: "draft",
  created_at: "2026-06-01T10:00:00.000Z",
  issuer_label: "Demo Doctor",
  issuer_role: "doctor",
  created_by_id: "admin-1",
  created_by_display: "Demo Admin",
  created_by_role: "admin",
  visit_summary: {
    appointment_id: "a1",
    title: "Check-up",
    treating_physician_id: "doc-1",
    treating_physician_label: "Demo Doctor",
    treating_physician_role: "doctor",
    start_iso: "2026-06-08T09:00:00.000Z",
    end_iso: "2026-06-08T10:00:00.000Z",
    when_label: "Mon 10:00",
    location_label: "Clinic",
    is_telehealth: false,
    patient_id: null,
    patient_label: null,
    category_id: null,
    category_label: null,
    category_color: null,
    category_icon: null,
    treating_physician_specialty: null,
    calendar_owner_id: null,
    calendar_owner_label: null,
    calendar_owner_specialty: null,
  },
} as Invoice;

describe("PatientPortalInvoiceCard", () => {
  it("wraps long invoice titles across lines in the sidebar card", () => {
    const markup = renderToStaticMarkup(
      <PatientPortalInvoiceCard invoice={invoice} onPay={() => undefined} />
    );
    expect(markup).toContain('data-wrap-label="1"');
  });

  it("uses compactStack doctor row and wrapInline issued meta with creator role", () => {
    const markup = renderToStaticMarkup(
      <PatientPortalInvoiceCard invoice={invoice} onPay={() => undefined} />
    );
    expect(markup).toContain('data-layout="compactStack"');
    expect(markup).toContain('data-role-badge="1"');
    expect(markup).toContain('data-layout="wrapInline"');
    expect(markup).toContain('data-role="admin"');
  });

  it("forwards isPaying to Pay Now for per-invoice loading state", () => {
    const paying = renderToStaticMarkup(
      <PatientPortalInvoiceCard invoice={invoice} onPay={() => undefined} isPaying />
    );
    const idle = renderToStaticMarkup(
      <PatientPortalInvoiceCard invoice={invoice} onPay={() => undefined} isPaying={false} />
    );
    expect(paying).toContain('data-paying="1"');
    expect(paying).toContain("Redirecting…");
    expect(idle).toContain('data-paying="0"');
    expect(idle).toContain("Pay Now");
  });
});
