import { describe, expect, it } from "vitest";
import {
  buildAppointmentInvoiceAuditExtraRows,
  buildInvoiceDetailAuditExtraRows,
  mapInvoiceCreatedByActor,
  mapInvoiceIssuerActor,
} from "@/lib/appointment-detail-invoice-audit-rows";
import type { Invoice } from "@/hooks/usePayments";

const baseInvoice = (): Invoice => ({
  id: "inv-1",
  user_id: "doctor-1",
  amount: 9250,
  currency: "eur",
  status: "paid",
  created_at: "2026-06-04T11:24:45.000Z",
  due_date: "2026-05-30T02:00:00.000Z",
  paid_at: "2026-05-30T09:30:00.000Z",
  payments: [],
  issuer_label: "Demo Doctor",
  issuer_email: "test@doctor.com",
  issuer_image: "https://cdn.example/doctor.png",
  issuer_role: "doctor",
  created_by_id: "admin-1",
  created_by_display: "Demo Admin",
  created_by_email: "test@admin.com",
  created_by_role: "admin",
});

describe("mapInvoiceIssuerActor", () => {
  it("maps billing owner issuer fields", () => {
    const actor = mapInvoiceIssuerActor(baseInvoice());
    expect(actor).toEqual({
      userId: "doctor-1",
      label: "Demo Doctor",
      email: "test@doctor.com",
      image: "https://cdn.example/doctor.png",
      role: "doctor",
    });
  });
});

describe("mapInvoiceCreatedByActor", () => {
  it("maps created_by for appointment detail Invoice issued row", () => {
    const actor = mapInvoiceCreatedByActor(baseInvoice());
    expect(actor).toEqual({
      userId: "admin-1",
      label: "Demo Admin",
      email: "test@admin.com",
      image: null,
      role: "admin",
    });
  });

  it("falls back to issuer when created_by missing", () => {
    const actor = mapInvoiceCreatedByActor({
      ...baseInvoice(),
      created_by_id: null,
      created_by_display: null,
    });
    expect(actor?.userId).toBe("doctor-1");
    expect(actor?.label).toBe("Demo Doctor");
  });
});

describe("buildAppointmentInvoiceAuditExtraRows", () => {
  it("includes Invoice issued row label", () => {
    const rows = buildAppointmentInvoiceAuditExtraRows([baseInvoice()]);
    expect(rows.map((r) => r.label)).toContain("Invoice issued");
  });
});

describe("buildInvoiceDetailAuditExtraRows", () => {
  it("includes issued by billing owner, due date, and paid at", () => {
    const rows = buildInvoiceDetailAuditExtraRows(baseInvoice());
    expect(rows.map((r) => r.label)).toEqual(["Issued by", "Due date", "Paid at"]);
  });

  it("includes visit deleted row when visit_detached_at set", () => {
    const rows = buildInvoiceDetailAuditExtraRows({
      ...baseInvoice(),
      visit_detached_at: "2026-06-19T12:00:00.000Z",
      visit_detached_by_id: "admin-1",
      visit_detached_by_display: "Demo Admin",
      visit_detached_by_email: "test@admin.com",
      visit_detached_by_role: "admin",
    });
    expect(rows.map((r) => r.label)).toContain("Visit deleted");
  });

  it("includes invoice deleted row when deleted_at set", () => {
    const rows = buildInvoiceDetailAuditExtraRows({
      ...baseInvoice(),
      deleted_at: "2026-06-19T13:00:00.000Z",
      deleted_by_id: "doctor-1",
      deleted_by_display: "Demo Doctor",
      deleted_by_email: "test@doctor.com",
      deleted_by_role: "doctor",
    });
    expect(rows.map((r) => r.label)).toContain("Invoice deleted");
  });
});
