import { describe, expect, it } from "vitest";
import {
  filterDoctorPortalInvoices,
  getInvoiceListTitle,
  countDoctorPortalOutstanding,
} from "@/lib/invoice-list-display";
import type { InvoiceRow } from "@/lib/billing-types";

const baseInvoice = (overrides: Partial<InvoiceRow> = {}): InvoiceRow => ({
  id: "inv-abcdef12-3456-7890-abcd-ef1234567890",
  user_id: "doc-1",
  amount: 12_000,
  currency: "eur",
  status: "draft",
  created_at: "2026-06-02T10:00:00.000Z",
  payments: [],
  ...overrides,
});

describe("getInvoiceListTitle", () => {
  it("prefers category + patient over demo description", () => {
    const title = getInvoiceListTitle(
      baseInvoice({
        description:
          "Demo curated invoice — Demo curated — 07-doc6-owner-demo-refunded — Thomas Weber",
        visit_summary: {
          appointment_id: "a1",
          title: "Demo curated — 07-doc6-owner-demo-refunded — Thomas Weber",
          start_iso: "2026-03-25T15:30:00.000Z",
          end_iso: "2026-03-25T16:15:00.000Z",
          when_label: "Wed, 25 Mar 2026 · 15:30 – 16:15",
          location_label: "—",
          is_telehealth: false,
          patient_id: "p1",
          patient_label: "Thomas Weber",
          category_id: "cat-1",
          category_label: "Follow-Up Visit",
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
    );
    expect(title).toBe("Follow-Up Visit — Thomas Weber");
  });

  it("falls back to short description when no visit summary", () => {
    expect(
      getInvoiceListTitle(
        baseInvoice({ description: "Consultation fee", visit_summary: undefined })
      )
    ).toBe("Consultation fee");
  });

  it("falls back to invoice id prefix for long demo descriptions", () => {
    const title = getInvoiceListTitle(
      baseInvoice({
        description: "Demo curated invoice — something very long that should not show",
        visit_summary: undefined,
      })
    );
    expect(title).toBe("Invoice #inv-abcd");
  });
});

describe("filterDoctorPortalInvoices", () => {
  const rows = [
    baseInvoice({ id: "11111111-1111-1111-1111-111111111111", status: "draft" }),
    baseInvoice({ id: "22222222-2222-2222-2222-222222222222", status: "paid" }),
  ];

  it("filters by status", () => {
    expect(
      filterDoctorPortalInvoices(rows, { search: "", status: "paid" }).map((r) => r.status)
    ).toEqual(["paid"]);
  });
});

describe("countDoctorPortalOutstanding", () => {
  it("excludes paid, cancelled, and refunded", () => {
    expect(
      countDoctorPortalOutstanding([
        baseInvoice({ status: "draft" }),
        baseInvoice({ status: "paid" }),
        baseInvoice({ status: "cancelled" }),
        baseInvoice({ status: "refunded" }),
        baseInvoice({ status: "sent" }),
      ])
    ).toBe(2);
  });
});
