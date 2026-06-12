import { describe, expect, it, beforeEach, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

const publishQueryCacheCrossTab = vi.fn();

vi.mock("@/lib/query-cache-cross-tab", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/query-cache-cross-tab")>();
  return {
    ...actual,
    publishQueryCacheCrossTab: (...args: unknown[]) => publishQueryCacheCrossTab(...args),
  };
});

import {
  getDoctorIdsFromInvoiceCache,
  invalidateInvoiceScopedBilling,
  invalidateInvoicesBilling,
} from "@/lib/query-client";
import type { InvoiceRow, InvoiceVisitSummary } from "@/lib/billing-types";

const DOC = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const INV = "11111111-1111-4111-8111-111111111111";

function visitSummary(calendarOwnerId: string): InvoiceVisitSummary {
  return {
    appointment_id: "appt",
    title: "Visit",
    location_label: "",
    is_telehealth: false,
    patient_id: null,
    patient_label: null,
    patient_email: null,
    patient_birth_date: null,
    patient_care_level: null,
    when_label: "Today",
    start_iso: "2026-01-15T10:00:00.000Z",
    end_iso: "2026-01-15T11:00:00.000Z",
    category_id: null,
    category_label: null,
    category_color: null,
    category_icon: null,
    treating_physician_id: null,
    treating_physician_label: null,
    treating_physician_specialty: null,
    calendar_owner_id: calendarOwnerId,
    calendar_owner_label: null,
    calendar_owner_specialty: null,
    appointment_type_name: null,
  };
}

describe("invoice scoped billing invalidation", () => {
  beforeEach(() => {
    publishQueryCacheCrossTab.mockClear();
  });

  it("getDoctorIdsFromInvoiceCache reads visit_summary from invoices.all", () => {
    const qc = new QueryClient();
    const row: InvoiceRow = {
      id: INV,
      user_id: DOC,
      amount: 100,
      currency: "eur",
      status: "sent",
      created_at: "2026-01-01T00:00:00.000Z",
      payments: [],
      visit_summary: visitSummary("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"),
    };
    qc.setQueryData(queryKeys.invoices.all, [row]);
    expect(getDoctorIdsFromInvoiceCache(qc, INV)).toEqual([
      DOC,
      "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    ]);
  });

  it("invalidateInvoiceScopedBilling busts byDoctor + byDoctorTotals", async () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.invoices.byDoctor(DOC), { invoices: [] });
    qc.setQueryData(queryKeys.invoices.byDoctorTotals(DOC), { totals: {} });
    qc.setQueryData(queryKeys.invoices.viewerTotals, { totals: {} });

    await invalidateInvoiceScopedBilling(qc, { doctorIds: [DOC] });

    expect(qc.getQueryState(queryKeys.invoices.byDoctor(DOC))?.isInvalidated).toBe(true);
    expect(qc.getQueryState(queryKeys.invoices.byDoctorTotals(DOC))?.isInvalidated).toBe(true);
    expect(qc.getQueryState(queryKeys.invoices.viewerTotals)?.isInvalidated).toBe(true);
  });

  it("invalidateInvoicesBilling busts doctor scoped keys when invoiceId in cache", async () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.invoices.all, [
      {
        id: INV,
        user_id: DOC,
        amount: 100,
        currency: "eur",
        status: "sent",
        created_at: "2026-01-01T00:00:00.000Z",
        payments: [],
      },
    ]);
    qc.setQueryData(queryKeys.invoices.byDoctor(DOC), { invoices: [] });
    qc.setQueryData(queryKeys.invoices.byDoctorTotals(DOC), { totals: {} });

    await invalidateInvoicesBilling(qc, { invoiceId: INV });

    expect(qc.getQueryState(queryKeys.invoices.byDoctor(DOC))?.isInvalidated).toBe(true);
    expect(qc.getQueryState(queryKeys.invoices.byDoctorTotals(DOC))?.isInvalidated).toBe(true);
  });
});
