/**
 * Doctor portal + compact invoice list row copy — appointment title vs legacy list title.
 */

import { format, parseISO } from "date-fns";
import type { InvoiceRow, InvoiceVisitSummary } from "@/lib/billing-types";
import { getInvoiceListTitle } from "@/lib/invoice-list-display";

/** Seeded demo appointment titles — prefer human list title over raw slug. */
const DEMO_CURATED_TITLE = /^demo curated\s*[—-]/i;
const DEMO_MATRIX_SLUG = /admin-treating-demo/i;

export function isSeededDemoAppointmentTitle(title: string | null | undefined): boolean {
  const trimmed = title?.trim();
  if (!trimmed) return false;
  return DEMO_CURATED_TITLE.test(trimmed) || DEMO_MATRIX_SLUG.test(trimmed);
}

/** Prefer linked visit `title` when not a demo seed slug; else list title composite. */
export function getInvoiceAppointmentTitle(
  invoice: Pick<InvoiceRow, "id" | "description" | "visit_summary">
): string {
  const visitTitle = invoice.visit_summary?.title?.trim();
  if (visitTitle && !isSeededDemoAppointmentTitle(visitTitle)) {
    return visitTitle;
  }
  return getInvoiceListTitle(invoice);
}

/** Detail page chrome + invoice card section — visit-related title. */
export function resolveInvoiceDetailHeaderTitle(
  invoice: Pick<InvoiceRow, "id" | "description" | "visit_summary">
): string {
  return getInvoiceAppointmentTitle(invoice);
}

export function formatInvoiceVisitDateLabel(startIso: string): string | null {
  try {
    const d = parseISO(startIso);
    return format(d, "EEE, dd MMM yyyy");
  } catch {
    return null;
  }
}

export function formatInvoiceVisitTimeRange(
  startIso: string,
  endIso: string
): string | null {
  try {
    const start = parseISO(startIso);
    const end = parseISO(endIso);
    return `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`;
  } catch {
    return null;
  }
}

export function formatInvoiceIssuedAtLabel(createdAtIso: string): string {
  return format(new Date(createdAtIso), "dd MMM yyyy · HH:mm");
}

/** Physical location only — telehealth uses badge instead of duplicating video copy. */
export function resolveInvoiceLocationDisplay(summary: InvoiceVisitSummary): string | null {
  if (summary.is_telehealth) return null;
  const loc = summary.location_label?.trim();
  if (!loc || loc === "—") return null;
  if (/telehealth|video call/i.test(loc)) return null;
  return loc;
}
