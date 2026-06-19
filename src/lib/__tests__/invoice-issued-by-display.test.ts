import { describe, expect, it } from "vitest";
import {
  invoiceIssuedByMetaProps,
  mapInvoiceIssuedByActor,
} from "@/lib/invoice-issued-by-display";

const invoice = {
  id: "inv-1",
  user_id: "doctor-1",
  created_at: "2026-06-01T10:00:00.000Z",
  issuer_label: "Demo Doctor",
  issuer_email: "test@doctor.com",
  issuer_role: "doctor",
  created_by_id: "admin-1",
  created_by_display: "Demo Admin",
  created_by_email: "test@admin.com",
  created_by_role: "admin",
};

describe("mapInvoiceIssuedByActor", () => {
  it("prefers created_by over billing issuer", () => {
    expect(mapInvoiceIssuedByActor(invoice)).toEqual({
      userId: "admin-1",
      label: "Demo Admin",
      email: "test@admin.com",
      image: null,
      role: "admin",
    });
  });

  it("falls back to billing issuer when created_by missing", () => {
    expect(
      mapInvoiceIssuedByActor({
        ...invoice,
        created_by_id: null,
        created_by_display: null,
        created_by_email: null,
        created_by_role: null,
      })
    ).toEqual({
      userId: "doctor-1",
      label: "Demo Doctor",
      email: "test@doctor.com",
      image: undefined,
      role: "doctor",
    });
  });
});

describe("invoiceIssuedByMetaProps", () => {
  it("maps actor fields for InvoiceIssuedByMeta", () => {
    expect(invoiceIssuedByMetaProps(invoice, "patient")).toEqual({
      createdAt: "2026-06-01T10:00:00.000Z",
      issuerLabel: "Demo Admin",
      issuerImage: null,
      issuerEmail: "test@admin.com",
      issuerUserId: "admin-1",
      issuerRole: "admin",
      viewerRole: "patient",
    });
  });
});
