/**
 * Invoice status → text color classes (aligned with InvoiceStatusBadge glass badges).
 */

import type { InvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";

const STATUS_TEXT_CLASS: Record<string, string> = {
  draft: "text-slate-700",
  sent: "text-sky-700",
  paid: "text-emerald-700",
  overdue: "text-rose-700",
  cancelled: "text-amber-800",
  refunded: "text-violet-700",
};

/** Text color for amount column and detail amount line. */
export function invoiceAmountTextClassForStatus(
  status: InvoiceDisplayStatus | string | null | undefined
): string {
  const key = (status ?? "draft").toLowerCase();
  return STATUS_TEXT_CLASS[key] ?? STATUS_TEXT_CLASS.draft;
}

/** Muted due-date tint when overdue. */
export function invoiceDueDateTextClassForStatus(
  status: InvoiceDisplayStatus | string | null | undefined
): string {
  if (status === "overdue") return "text-rose-600";
  return "text-muted-foreground";
}

/** Inline status count segments — matches InvoiceStatusBadge glass tones as text. */
export function invoiceStatusInlineTextClass(
  status: InvoiceDisplayStatus | string | null | undefined
): string {
  const key = (status ?? "draft").toLowerCase();
  return STATUS_TEXT_CLASS[key] ?? STATUS_TEXT_CLASS.draft;
}
