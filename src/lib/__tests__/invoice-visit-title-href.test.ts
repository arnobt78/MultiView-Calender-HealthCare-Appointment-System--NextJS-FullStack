import { describe, expect, it } from "vitest";
import { resolveInvoiceVisitTitleHref } from "@/lib/invoice-visit-title-href";

describe("resolveInvoiceVisitTitleHref", () => {
  it("uses appointment detail when appointment_id on invoice row", () => {
    const href = resolveInvoiceVisitTitleHref(
      { id: "inv-1", appointment_id: "appt-1" },
      "admin"
    );
    expect(href).toBe("/control-panel/appointments/appt-1");
  });

  it("uses visit_summary appointment_id when row field absent", () => {
    const href = resolveInvoiceVisitTitleHref(
      {
        id: "inv-1",
        visit_summary: { appointment_id: "appt-2" },
      },
      "doctor"
    );
    expect(href).toBe("/appointments/appt-2");
  });

  it("falls back to invoice detail when no linked visit", () => {
    const href = resolveInvoiceVisitTitleHref({ id: "inv-9" }, "admin");
    expect(href).toBe("/control-panel/invoices/inv-9");
  });

  it("patient portal uses portal appointment route", () => {
    const href = resolveInvoiceVisitTitleHref(
      { id: "inv-1", appointment_id: "appt-3" },
      "patient"
    );
    expect(href).toBe("/appointments/appt-3");
  });
});
