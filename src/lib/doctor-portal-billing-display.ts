/**
 * Doctor portal billing panel — section title + per-status invoice counters (display status).
 */

import { resolveInvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import type { InvoiceRow } from "@/lib/billing-types";
import type { DoctorPortalInvoiceStatusFilter } from "@/lib/invoice-list-display";

export const DOCTOR_PORTAL_BILLING_SUBTITLE =
  "Invoices for visits you own or treat — counts by payment status";

/**
 * Doctors see billing read-only in portal — drafts are created on visit completion (auto-draft)
 * or by admin/front desk. Row menu still allows send/delete on existing drafts.
 */
export const DOCTOR_PORTAL_BILLING_SHOW_MANUAL_CREATE = false;

/** Panel title — possessive when we know the signed-in doctor's display name. */
export function doctorPortalBillingSectionTitle(displayName: string | null | undefined): string {
  const name = displayName?.trim();
  if (!name) return "My Related Billing";
  return `${name}'s Related Billing`;
}

/** Header line: `{name}'s Related Billing (total) (Draft: n · …)` — status segment in parens. */
export function doctorPortalBillingPanelTitleLine(
  displayName: string | null | undefined,
  totalCount: number,
  counts: DoctorPortalInvoiceStatusCounts
): string {
  const base = doctorPortalBillingSectionTitle(displayName);
  const statuses = doctorPortalInvoiceStatusBadgeLabel(counts);
  return `${base} (${totalCount}) (${statuses})`;
}

export type DoctorPortalInvoiceStatusCounts = Record<
  Exclude<DoctorPortalInvoiceStatusFilter, "all">,
  number
>;

/** Inline header row segment order — shared by string label + InvoiceStatusCountInlineRow. */
export const DOCTOR_PORTAL_INVOICE_STATUS_INLINE_ORDER: Exclude<
  DoctorPortalInvoiceStatusFilter,
  "all"
>[] = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
  "refunded",
];

/** Count doctor-scoped rows by UI display status (refunded vs cancelled uses payment rows). */
export function countDoctorPortalInvoicesByStatus(
  invoices: ReadonlyArray<InvoiceRow>
): DoctorPortalInvoiceStatusCounts {
  const counts: DoctorPortalInvoiceStatusCounts = {
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
    cancelled: 0,
    refunded: 0,
  };
  for (const inv of invoices) {
    const display = resolveInvoiceDisplayStatus(inv);
    if (display in counts) {
      counts[display as keyof DoctorPortalInvoiceStatusCounts] += 1;
    }
  }
  return counts;
}

/** Compact pill — same pattern as `doctorPortalTodayStatusBadgeLabel` (always shows every status). */
export function doctorPortalInvoiceStatusBadgeLabel(
  counts: DoctorPortalInvoiceStatusCounts
): string {
  return DOCTOR_PORTAL_INVOICE_STATUS_INLINE_ORDER.map((key) => {
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    return `${label}: ${counts[key]}`;
  }).join(" · ");
}
