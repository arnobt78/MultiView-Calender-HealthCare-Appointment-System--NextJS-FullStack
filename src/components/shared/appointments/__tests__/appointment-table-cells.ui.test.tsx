import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AppointmentCategoryTableCell,
  AppointmentManagementStatusCell,
  AppointmentTitleTableCell,
  AppointmentWhenTableCell,
} from "@/components/shared/appointments/appointment-table-cells";
import type { FullAppointment } from "@/hooks/useAppointments";

vi.mock("@/components/shared/EntityTitleLink", () => ({
  EntityTitleLink: ({ label }: { label: string }) => <span>{label}</span>,
}));

vi.mock("@/components/shared/appointments/AppointmentStatusGlassBadge", () => ({
  AppointmentStatusGlassBadge: ({ status }: { status?: string | null }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

vi.mock("@/components/shared/appointment-display/AppointmentListVisitFeeBadge", () => ({
  AppointmentListVisitFeeBadge: ({ size }: { size?: string }) => (
    <span data-testid="fee-badge" data-size={size}>
      €150
    </span>
  ),
}));

vi.mock("@/components/shared/billing/InvoiceStatusBadge", () => ({
  InvoiceStatusBadge: ({ displayStatus }: { displayStatus?: string }) => (
    <span data-testid="invoice-badge">{displayStatus}</span>
  ),
}));

vi.mock("@/components/shared/billing/PaymentStatusBadge", () => ({
  PaymentStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="payment-badge">{status}</span>
  ),
}));

vi.mock("@/components/control-panel/patient-detail-snapshot-columns", () => ({
  CategoryTableCell: ({ label }: { label: string }) => (
    <span data-testid="category-label">{label}</span>
  ),
}));

vi.mock("@/components/shared/category-display/CategoryDurationMinutesBadge", () => ({
  CategoryDurationMinutesBadge: ({ minutes }: { minutes: number | null }) => (
    <span data-testid="duration-badge">{minutes} min</span>
  ),
}));

const sample: FullAppointment = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "user-1",
  title: "Annual Check-up",
  start: "2026-06-08T09:00:00.000Z",
  end: "2026-06-08T10:00:00.000Z",
  status: "pending",
  location: "Demo Clinic",
  created_at: "2026-06-01T10:00:00.000Z",
  updated_at: null,
  patient: null,
  attachments: [],
  category: null,
  notes: null,
  appointment_type_price_cents: 15000,
};

describe("AppointmentTitleTableCell", () => {
  it("renders linked title text", () => {
    const markup = renderToStaticMarkup(
      <AppointmentTitleTableCell appointment={sample} viewerRole="admin" />
    );
    expect(markup).toContain("Annual Check-up");
  });
});

describe("AppointmentWhenTableCell", () => {
  it("renders muted datetime range and location with icons", () => {
    const markup = renderToStaticMarkup(
      <AppointmentWhenTableCell appointment={sample} />
    );
    expect(markup).toContain("Demo Clinic");
    expect(markup).toContain("–");
    expect(markup).toContain("text-muted-foreground");
    expect(markup).toContain('aria-hidden="true"');
  });
});

describe("AppointmentManagementStatusCell", () => {
  it("dedupes paid invoice — payment tick only, table fee size", () => {
    const markup = renderToStaticMarkup(
      <AppointmentManagementStatusCell
        appointment={sample}
        invoiceDisplayStatus="paid"
        invoice={{
          id: "inv-1",
          user_id: "user-1",
          amount: 15000,
          currency: "eur",
          status: "paid",
          created_at: "2026-06-01T10:00:00.000Z",
          payments: [
            {
              id: "pay-1",
              amount: 15000,
              status: "succeeded",
              created_at: "2026-06-02T10:00:00.000Z",
            },
          ],
        }}
      />
    );
    expect(markup).toContain("pending");
    expect(markup).toContain('data-size="table"');
    expect(markup).not.toContain('data-testid="invoice-badge"');
    expect(markup).toContain("succeeded");
  });

  it("shows both badges when invoice and payment differ", () => {
    const markup = renderToStaticMarkup(
      <AppointmentManagementStatusCell
        appointment={sample}
        invoiceDisplayStatus="sent"
        invoice={{
          id: "inv-2",
          user_id: "user-1",
          amount: 15000,
          currency: "eur",
          status: "sent",
          created_at: "2026-06-01T10:00:00.000Z",
          payments: [
            {
              id: "pay-2",
              amount: 15000,
              status: "pending",
              created_at: "2026-06-02T10:00:00.000Z",
            },
          ],
        }}
      />
    );
    expect(markup).toContain("sent");
    expect(markup).toContain("pending");
  });
});

describe("AppointmentCategoryTableCell", () => {
  it("renders category label and duration inline", () => {
    const appt: FullAppointment = {
      ...sample,
      category: "cat-1",
      category_data: {
        id: "cat-1",
        label: "Dermatology",
        color: "#f59e0b",
        icon: "Sun",
        created_at: "2026-06-01T00:00:00.000Z",
        updated_at: null,
        description: null,
        duration_minutes_default: 30,
      },
    };
    const markup = renderToStaticMarkup(
      <AppointmentCategoryTableCell appointment={appt} viewerRole="admin" />
    );
    expect(markup).toContain("Dermatology");
    expect(markup).toContain("30 min");
    expect(markup).toContain("flex-wrap");
  });
});
