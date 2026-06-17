import { describe, expect, it } from "vitest";
import type { Invoice } from "@/hooks/usePayments";
import {
  filterInvoicesBySearch,
  filterInvoicesByStatus,
  filterInvoicesForAppointment,
  filterInvoicesForPatient,
  filterInvoicesForToolbar,
} from "@/lib/invoice-entity-list-filters";

const base = (overrides: Partial<Invoice>): Invoice =>
  ({
    id: "inv-1",
    user_id: "u1",
    amount: 1000,
    currency: "eur",
    status: "draft",
    created_at: "2026-06-15T10:00:00Z",
    payments: [],
    ...overrides,
  }) as Invoice;

describe("invoice-entity-list-filters", () => {
  it("filterInvoicesForAppointment matches appointment_id and visit_summary", () => {
    const list = [
      base({ id: "a", appointment_id: "appt-1" }),
      base({ id: "b", visit_summary: { appointment_id: "appt-1" } as Invoice["visit_summary"] }),
      base({ id: "c", appointment_id: "other" }),
    ];
    expect(filterInvoicesForAppointment(list, "appt-1").map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("filterInvoicesForPatient matches visit_summary.patient_id", () => {
    const list = [
      base({ id: "p1", visit_summary: { patient_id: "pat-1" } as Invoice["visit_summary"] }),
      base({ id: "p2", visit_summary: { patient_id: "pat-2" } as Invoice["visit_summary"] }),
    ];
    expect(filterInvoicesForPatient(list, "pat-1").map((i) => i.id)).toEqual(["p1"]);
  });

  it("filterInvoicesByStatus uses display status including refunded", () => {
    const refunded = base({
      id: "r",
      status: "cancelled",
      payments: [{ id: "pay-1", amount: 1000, status: "refunded", created_at: "2026-06-15T10:00:00Z" }],
    });
    expect(filterInvoicesByStatus([refunded], "refunded")).toHaveLength(1);
    expect(filterInvoicesByStatus([refunded], "paid")).toHaveLength(0);
  });

  it("filterInvoicesBySearch matches invoice id blob", () => {
    const list = [base({ id: "abc-def", description: "Visit" })];
    expect(filterInvoicesBySearch(list, "abc-def")).toHaveLength(1);
    expect(filterInvoicesBySearch(list, "nomatch")).toHaveLength(0);
  });

  it("filterInvoicesForToolbar chains status and search", () => {
    const list = [
      base({ id: "one", status: "draft", description: "Alpha visit" }),
      base({ id: "two", status: "sent", description: "Alpha visit" }),
    ];
    expect(
      filterInvoicesForToolbar(list, { status: "draft", search: "alpha" }).map((i) => i.id)
    ).toEqual(["one"]);
  });
});
