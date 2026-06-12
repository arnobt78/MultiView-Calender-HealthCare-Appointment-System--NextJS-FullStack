/**
 * Invoice list title + filter helpers — avoids demo seed description / visit title duplication in UI.
 */

import { format } from "date-fns";
import { resolveInvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import { formatShortEntityId } from "@/lib/entity-id-display";
import type { InvoiceRow, InvoiceVisitSummary } from "@/lib/billing-types";

const DEMO_DESC_PREFIX = /^demo curated invoice/i;
const MAX_FALLBACK_DESC_LEN = 48;

/** Prefer visit type label + patient; skip long seeded descriptions and appointment titles. */
export function getInvoiceListTitle(invoice: Pick<InvoiceRow, "id" | "description" | "visit_summary">): string {
  const summary = invoice.visit_summary;
  if (summary) {
    const fromVisit = buildTitleFromVisitSummary(summary);
    if (fromVisit) return fromVisit;
  }

  const desc = invoice.description?.trim();
  if (desc && !DEMO_DESC_PREFIX.test(desc) && desc.length <= MAX_FALLBACK_DESC_LEN) {
    return desc;
  }

  return `Invoice ${formatShortEntityId(invoice.id)}`;
}

/** Sort/search key — title + patient (not raw description alone). */
export function getInvoiceListSortKey(
  invoice: Pick<InvoiceRow, "id" | "description" | "visit_summary">
): string {
  const title = getInvoiceListTitle(invoice);
  const patient = invoice.visit_summary?.patient_label?.trim() ?? "";
  return `${title} ${patient}`.trim();
}

/** Global filter haystack for CP invoice list search. */
export function getInvoiceListSearchBlob(
  invoice: Pick<InvoiceRow, "id" | "description" | "visit_summary">
): string {
  const summary = invoice.visit_summary;
  return [
    invoice.id,
    invoice.description ?? "",
    getInvoiceListTitle(invoice),
    summary?.title ?? "",
    summary?.patient_label ?? "",
    summary?.patient_email ?? "",
    summary?.treating_physician_label ?? "",
    summary?.appointment_type_name ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function buildTitleFromVisitSummary(summary: InvoiceVisitSummary): string | null {
  const typeLabel =
    summary.appointment_type_name?.trim() || summary.category_label?.trim();
  const patient = summary.patient_label?.trim();
  if (typeLabel && patient) return `${typeLabel} — ${patient}`;
  if (patient) return patient;
  if (typeLabel) return typeLabel;
  if (summary.when_label) {
    const start = summary.start_iso ? new Date(summary.start_iso) : null;
    const datePart =
      start && !Number.isNaN(start.getTime()) ? format(start, "dd MMM yyyy") : null;
    return datePart ? `Visit · ${datePart}` : "Visit";
  }
  return null;
}

/** Portal list card header — `Invoice 1: #168da90a` (1-based position in visible list). */
export function formatPortalInvoiceListLabel(
  listIndex: number,
  invoiceId: string
): string {
  const shortId = formatShortEntityId(invoiceId);
  if (!Number.isFinite(listIndex) || listIndex < 1) {
    return `Invoice ${shortId}`;
  }
  return `Invoice ${listIndex}: ${shortId}`;
}

/** CP invoice-management table — sequence label only (hex id on second line). */
export function formatInvoiceManagementSequenceLabel(listIndex: number): string {
  if (!Number.isFinite(listIndex) || listIndex < 1) {
    return "Invoice";
  }
  return `Invoice ${listIndex}`;
}

/** Client-side doctor portal billing filters (no API). */
export type DoctorPortalInvoiceStatusFilter =
  | "all"
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled"
  | "refunded";

export function filterDoctorPortalInvoices(
  invoices: InvoiceRow[],
  opts: { search: string; status: DoctorPortalInvoiceStatusFilter }
): InvoiceRow[] {
  const q = opts.search.trim().toLowerCase();
  let rows = invoices;

  if (opts.status !== "all") {
    rows = rows.filter((inv) => {
      const display = resolveInvoiceDisplayStatus(inv);
      return display === opts.status;
    });
  }

  if (!q) return rows;

  return rows.filter((inv) => {
    const title = getInvoiceListTitle(inv).toLowerCase();
    const patient = inv.visit_summary?.patient_label?.toLowerCase() ?? "";
    const idPrefix = inv.id.slice(0, 8).toLowerCase();
    const desc = inv.description?.toLowerCase() ?? "";
    return (
      title.includes(q) ||
      patient.includes(q) ||
      idPrefix.includes(q) ||
      desc.includes(q)
    );
  });
}

/**
 * @deprecated Prefer `countDoctorPortalInvoicesByStatus` + `INVOICE_OUTSTANDING_STATUSES` in UI.
 * Legacy helper counted every non-terminal row (draft + sent + overdue, not paid/cancelled/refunded).
 */
export function countDoctorPortalOutstanding(invoices: InvoiceRow[]): number {
  return invoices.filter(
    (i) => i.status !== "paid" && i.status !== "cancelled" && i.status !== "refunded"
  ).length;
}
