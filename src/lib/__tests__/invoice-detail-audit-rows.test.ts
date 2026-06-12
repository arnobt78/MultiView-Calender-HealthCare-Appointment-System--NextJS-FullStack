import { describe, expect, it } from "vitest";
import {
  buildInvoiceDetailAuditExtraRows,
  mapInvoiceIssuerActor,
} from "@/lib/appointment-detail-invoice-audit-rows";
import type { Invoice } from "@/hooks/usePayments";

const baseInvoice = (): Invoice => ({
  id: "inv-1",
  user_id: "u1",
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
});

describe("mapInvoiceIssuerActor", () => {
  it("maps issuer fields for Record Audit Created row", () => {
    const actor = mapInvoiceIssuerActor(baseInvoice());
    expect(actor).toEqual({
      userId: "u1",
      label: "Demo Doctor",
      email: "test@doctor.com",
      image: "https://cdn.example/doctor.png",
      role: "doctor",
    });
  });

  it("returns null when issuer label missing", () => {
    expect(mapInvoiceIssuerActor({ ...baseInvoice(), issuer_label: null })).toBeNull();
  });
});

describe("buildInvoiceDetailAuditExtraRows", () => {
  it("includes issued by, due date, and paid at", () => {
    const rows = buildInvoiceDetailAuditExtraRows(baseInvoice());
    expect(rows.map((r) => r.label)).toEqual(["Issued by", "Due date", "Paid at"]);
  });

  it("includes due date dash row when unpaid without paid_at", () => {
    const rows = buildInvoiceDetailAuditExtraRows({
      ...baseInvoice(),
      status: "sent",
      paid_at: undefined,
      due_date: undefined,
    });
    expect(rows.map((r) => r.label)).toEqual(["Issued by", "Due date"]);
  });

  it("omits issued by when issuer label missing", () => {
    const rows = buildInvoiceDetailAuditExtraRows({
      ...baseInvoice(),
      issuer_label: null,
      paid_at: undefined,
    });
    expect(rows.map((r) => r.label)).toEqual(["Due date"]);
  });
});
