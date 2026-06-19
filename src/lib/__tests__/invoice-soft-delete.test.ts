import { describe, expect, it } from "vitest";
import {
  invoiceSoftDeleteActorFields,
  invoiceSoftDeleteByFields,
  invoiceVisitDetachedByFields,
} from "@/lib/invoice-api-include";
import {
  mapInvoiceSoftDeletedByActor,
  mapInvoiceVisitDetachedByActor,
  listInvoiceDeletionMetaSlices,
  resolveInvoiceVisitDeletionMeta,
  resolveInvoiceSoftDeletionMeta,
} from "@/lib/entity-detail-audit-actor";
import {
  INVOICE_SOFT_DELETED_ERROR,
  isPrismaInvoiceSoftDeleted,
} from "@/lib/invoice-soft-delete-guard";
import { isInvoiceSoftDeleted, isInvoiceTombstone } from "@/lib/invoice-status-display";

const actorUser = {
  id: "user-1",
  display_name: "Demo Admin",
  email: "admin@example.com",
  image: "https://cdn.example/a.png",
  role: "admin",
};

describe("invoiceVisitDetachedByFields", () => {
  it("denormalizes actor columns", () => {
    expect(invoiceVisitDetachedByFields(actorUser)).toEqual({
      visit_detached_by_id: "user-1",
      visit_detached_by_display: "Demo Admin",
      visit_detached_by_email: "admin@example.com",
      visit_detached_by_image: "https://cdn.example/a.png",
      visit_detached_by_role: "admin",
    });
  });
});

describe("invoiceSoftDeleteByFields", () => {
  it("sets deleted_at and actor columns", () => {
    const at = new Date("2026-06-19T12:00:00.000Z");
    const fields = invoiceSoftDeleteByFields(actorUser, at);
    expect(fields.deleted_at).toEqual(at);
    expect(invoiceSoftDeleteActorFields(actorUser)).toEqual({
      deleted_by_id: "user-1",
      deleted_by_display: "Demo Admin",
      deleted_by_email: "admin@example.com",
      deleted_by_image: "https://cdn.example/a.png",
      deleted_by_role: "admin",
    });
  });
});

describe("mapInvoiceVisitDetachedByActor", () => {
  it("maps denormalized visit detached actor", () => {
    const actor = mapInvoiceVisitDetachedByActor({
      visit_detached_by_id: "user-1",
      visit_detached_by_display: "Demo Admin",
      visit_detached_by_email: "admin@example.com",
      visit_detached_by_image: null,
      visit_detached_by_role: "admin",
    });
    expect(actor).toEqual({
      userId: "user-1",
      label: "Demo Admin",
      email: "admin@example.com",
      image: null,
      role: "admin",
    });
  });
});

describe("mapInvoiceSoftDeletedByActor", () => {
  it("maps denormalized soft-delete actor", () => {
    const actor = mapInvoiceSoftDeletedByActor({
      deleted_by_id: "user-2",
      deleted_by_display: "Demo Doctor",
      deleted_by_email: "doc@example.com",
      deleted_by_image: null,
      deleted_by_role: "doctor",
    });
    expect(actor?.userId).toBe("user-2");
    expect(actor?.label).toBe("Demo Doctor");
  });
});

describe("isPrismaInvoiceSoftDeleted", () => {
  it("detects tombstone rows", () => {
    expect(isPrismaInvoiceSoftDeleted({ deleted_at: new Date() })).toBe(true);
    expect(isPrismaInvoiceSoftDeleted({ deleted_at: "2026-06-19T12:00:00.000Z" })).toBe(true);
    expect(isPrismaInvoiceSoftDeleted({ deleted_at: null })).toBe(false);
  });
});

describe("invoice status tombstone helpers", () => {
  it("combines visit detached and soft delete", () => {
    expect(isInvoiceSoftDeleted({ deleted_at: "2026-06-19T12:00:00.000Z" })).toBe(true);
    expect(isInvoiceTombstone({ visit_detached_at: "2026-06-19T12:00:00.000Z" })).toBe(true);
    expect(isInvoiceTombstone({ deleted_at: "2026-06-19T12:00:00.000Z" })).toBe(true);
    expect(INVOICE_SOFT_DELETED_ERROR).toBe("Invoice has been deleted");
  });
});

describe("listInvoiceDeletionMetaSlices", () => {
  it("returns visit then invoice slices with mapped actors", () => {
    const invoice = {
      visit_detached_at: "2026-06-19T12:00:00.000Z",
      visit_detached_by_id: "user-1",
      visit_detached_by_display: "Demo Admin",
      visit_detached_by_email: "admin@example.com",
      deleted_at: "2026-06-19T13:00:00.000Z",
      deleted_by_id: "user-2",
      deleted_by_display: "Demo Doctor",
      deleted_by_email: "doc@example.com",
    };
    const slices = listInvoiceDeletionMetaSlices(invoice);
    expect(slices).toHaveLength(2);
    expect(slices[0]?.kind).toBe("visit");
    expect(slices[0]?.actor?.label).toBe("Demo Admin");
    expect(slices[1]?.kind).toBe("invoice");
    expect(slices[1]?.actor?.label).toBe("Demo Doctor");
    expect(resolveInvoiceVisitDeletionMeta(invoice)?.at).toBe(invoice.visit_detached_at);
    expect(resolveInvoiceSoftDeletionMeta(invoice)?.at).toBe(invoice.deleted_at);
  });
});
