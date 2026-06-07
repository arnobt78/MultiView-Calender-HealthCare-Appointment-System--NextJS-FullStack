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
