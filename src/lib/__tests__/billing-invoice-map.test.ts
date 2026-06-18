import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  mapApiInvoiceToRow,
  mergeInvoiceIntoDetailCache,
  mergeInvoiceIntoScopedListCaches,
  removeInvoiceFromScopedListCaches,
  resolvePatientIdFromInvoiceRow,
} from "@/lib/billing-invoice-map";
import type { InvoiceRow } from "@/lib/billing-types";

const DOC = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ORG = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const INV = "11111111-1111-4111-8111-111111111111";

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

  it("passes through audit and issuer fields", () => {
    const row = mapApiInvoiceToRow({
      id: INV,
      user_id: DOC,
      amount: 5000,
      currency: "eur",
      status: "sent",
      created_at: "2026-01-15T10:00:00.000Z",
      updated_at: "2026-01-16T10:00:00.000Z",
      created_by_id: "admin-1",
      created_by_display: "Demo Admin",
      updated_by_id: "admin-2",
      updated_by_display: "Editor",
      issuer_label: "Demo Doctor",
      issuer_role: "doctor",
      payments: [],
    });
    expect(row.updated_at).toBe("2026-01-16T10:00:00.000Z");
    expect(row.created_by_display).toBe("Demo Admin");
    expect(row.updated_by_display).toBe("Editor");
    expect(row.issuer_label).toBe("Demo Doctor");
  });
});

describe("mergeInvoiceIntoDetailCache", () => {
  const baseRow: InvoiceRow = {
    id: INV,
    user_id: DOC,
    amount: 5000,
    currency: "eur",
    status: "sent",
    created_at: "2026-01-01T00:00:00.000Z",
    payments: [],
  };

  it("seeds invoices.detail without list merge", () => {
    const qc = new QueryClient();
    mergeInvoiceIntoDetailCache(qc, baseRow);
    expect(qc.getQueryData(queryKeys.invoices.detail(INV))).toEqual(baseRow);
  });
});

describe("resolvePatientIdFromInvoiceRow", () => {
  it("reads visit_summary.patient_id", () => {
    expect(
      resolvePatientIdFromInvoiceRow({
        visit_summary: {
          appointment_id: "a1",
          title: "Visit",
          start_iso: "",
          end_iso: "",
          when_label: "",
          location_label: "",
          is_telehealth: false,
          patient_id: "p1",
          patient_label: "Pat",
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
      })
    ).toBe("p1");
  });
});

describe("mergeInvoiceIntoScopedListCaches", () => {
  const baseRow: InvoiceRow = {
    id: INV,
    user_id: DOC,
    organization_id: ORG,
    amount: 5000,
    currency: "eur",
    status: "sent",
    created_at: "2026-01-01T00:00:00.000Z",
    payments: [],
  };

  it("patches invoices.all, byOrganization, and byDoctor caches", () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.invoices.all, []);
    qc.setQueryData(queryKeys.invoices.byOrganization(ORG), { invoices: [] });
    qc.setQueryData(queryKeys.invoices.byDoctor(DOC), { invoices: [] });

    mergeInvoiceIntoScopedListCaches(qc, baseRow);

    expect(qc.getQueryData<InvoiceRow[]>(queryKeys.invoices.all)).toHaveLength(1);
    expect(
      qc.getQueryData<{ invoices: InvoiceRow[] }>(queryKeys.invoices.byOrganization(ORG))
        ?.invoices
    ).toHaveLength(1);
    expect(
      qc.getQueryData<{ invoices: InvoiceRow[] }>(queryKeys.invoices.byDoctor(DOC))?.invoices
    ).toHaveLength(1);
  });

  it("removes invoice from doctor cache when no longer in scope", () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.invoices.all, [baseRow]);
    qc.setQueryData(queryKeys.invoices.byDoctor(DOC), { invoices: [baseRow] });

    mergeInvoiceIntoScopedListCaches(qc, {
      ...baseRow,
      user_id: "22222222-2222-4222-8222-222222222222",
      visit_summary: undefined,
    });

    expect(
      qc.getQueryData<{ invoices: InvoiceRow[] }>(queryKeys.invoices.byDoctor(DOC))?.invoices
    ).toHaveLength(0);
  });

  it("patches viewerTotals from invoices.all after merge", () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.invoices.all, []);
    qc.setQueryData(queryKeys.invoices.viewerTotals, {
      totals: {
        paid: { cents: 0, count: 0 },
        outstanding: { cents: 0, count: 0 },
        refunded: { cents: 0, count: 0 },
        cancelled: { cents: 0, count: 0 },
      },
      statusTotals: {},
    });

    mergeInvoiceIntoScopedListCaches(qc, { ...baseRow, status: "paid", amount: 9000 });

    const payload = qc.getQueryData(queryKeys.invoices.viewerTotals) as
      | { totals: { paid: { cents: number } }; paidPeriod?: unknown }
      | undefined;
    expect(payload?.totals.paid.cents).toBe(9000);
    expect(payload?.paidPeriod).toBeUndefined();
  });
});

describe("removeInvoiceFromScopedListCaches", () => {
  const baseRow: InvoiceRow = {
    id: INV,
    user_id: DOC,
    organization_id: ORG,
    amount: 5000,
    currency: "eur",
    status: "sent",
    created_at: "2026-01-01T00:00:00.000Z",
    payments: [],
  };

  it("removes from global and warm scoped caches", () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.invoices.all, [baseRow]);
    qc.setQueryData(queryKeys.invoices.byOrganization(ORG), { invoices: [baseRow] });
    qc.setQueryData(queryKeys.invoices.byDoctor(DOC), { invoices: [baseRow] });

    removeInvoiceFromScopedListCaches(qc, baseRow);

    expect(qc.getQueryData<InvoiceRow[]>(queryKeys.invoices.all)).toHaveLength(0);
    expect(
      qc.getQueryData<{ invoices: InvoiceRow[] }>(queryKeys.invoices.byOrganization(ORG))
        ?.invoices
    ).toHaveLength(0);
    expect(
      qc.getQueryData<{ invoices: InvoiceRow[] }>(queryKeys.invoices.byDoctor(DOC))?.invoices
    ).toHaveLength(0);
  });
});
