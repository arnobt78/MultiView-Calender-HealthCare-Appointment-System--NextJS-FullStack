/**
 * Invoice status → text color classes (aligned with InvoiceStatusBadge glass badges).
 */

import {
  resolveInvoiceDisplayStatus,
  type InvoiceForDisplay,
} from "@/lib/billing-appointment-eligibility";
import { startOfDay, isBefore } from "date-fns";
import type { InvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";

const STATUS_TEXT_CLASS: Record<string, string> = {
  draft: "text-slate-700",
  sent: "text-sky-700",
  paid: "text-emerald-700",
  overdue: "text-rose-700",
  cancelled: "text-amber-800",
  refunded: "text-violet-700",
};

/** Due-date tone — date + status aware (C52). */
export type InvoiceDueDateTone =
  | "paid"
  | "pastDue"
  | "sent"
  | "draft"
  | "cancelled"
  | "refunded"
  | "muted";

export type InvoiceDueDateToneInput = InvoiceForDisplay & {
  due_date?: string | null;
  paid_at?: string | null;
};

const UNPAID_DUE_STATUSES = new Set(["draft", "sent", "overdue"]);

/** True when due_date is before today (start-of-day) and invoice is still collectible. */
export function isInvoiceDueDatePastAndUnpaid(invoice: InvoiceDueDateToneInput): boolean {
  if (!invoice.due_date?.trim()) return false;
  const displayStatus = resolveInvoiceDisplayStatus(invoice);
  if (displayStatus === "paid" || displayStatus === "cancelled" || displayStatus === "refunded") {
    return false;
  }
  if (invoice.paid_at) return false;
  if (!UNPAID_DUE_STATUSES.has(displayStatus)) return false;
  const due = startOfDay(new Date(invoice.due_date));
  if (Number.isNaN(due.getTime())) return false;
  return isBefore(due, startOfDay(new Date()));
}

/** Resolve semantic tone for due-date text — past unpaid beats DB status label. */
export function resolveInvoiceDueDateTone(invoice: InvoiceDueDateToneInput): InvoiceDueDateTone {
  const displayStatus = resolveInvoiceDisplayStatus(invoice);
  if (displayStatus === "paid" || invoice.paid_at) return "paid";
  if (displayStatus === "cancelled") return "cancelled";
  if (displayStatus === "refunded") return "refunded";
  if (!invoice.due_date?.trim()) return "muted";
  if (isInvoiceDueDatePastAndUnpaid(invoice)) return "pastDue";
  if (displayStatus === "sent" || displayStatus === "overdue") return "sent";
  return "draft";
}

const DUE_DATE_TONE_CLASS: Record<InvoiceDueDateTone, string> = {
  paid: "text-emerald-700",
  pastDue: "text-rose-600",
  sent: "text-sky-700",
  draft: "text-slate-700",
  cancelled: "text-amber-800",
  refunded: "text-violet-700",
  muted: "text-muted-foreground",
};

/** Text color for due-date rows in tables, audit cards, and portal cards. */
export function invoiceDueDateTextClassForInvoice(invoice: InvoiceDueDateToneInput): string {
  return DUE_DATE_TONE_CLASS[resolveInvoiceDueDateTone(invoice)];
}

/** Text color for amount column and detail amount line. */
export function invoiceAmountTextClassForStatus(
  status: InvoiceDisplayStatus | string | null | undefined
): string {
  const key = (status ?? "draft").toLowerCase();
  return STATUS_TEXT_CLASS[key] ?? STATUS_TEXT_CLASS.draft;
}

/** Legacy status-only due tint — prefer `invoiceDueDateTextClassForInvoice` for due dates. */
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
