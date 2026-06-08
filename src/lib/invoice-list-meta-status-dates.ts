/**
 * Doctor portal invoice list footer — Paid / Refunded / Cancelled milestone dates.
 */

import { resolveInvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import type { InvoiceRow } from "@/lib/billing-types";

export type InvoiceListMetaStatusDateLabel = "Paid" | "Refunded" | "Cancelled";

export type InvoiceListMetaStatusDateSegment = {
  label: InvoiceListMetaStatusDateLabel;
  iso: string;
};

function latestRefundedPaymentIso(invoice: InvoiceRow): string | null {
  const refunded = (invoice.payments ?? []).filter((p) => p.status === "refunded");
  if (refunded.length === 0) return null;
  const sorted = [...refunded].sort((a, b) => {
    const aIso = a.refunded_at ?? a.created_at;
    const bIso = b.refunded_at ?? b.created_at;
    return new Date(bIso).getTime() - new Date(aIso).getTime();
  });
  const latest = sorted[0];
  if (!latest) return null;
  return latest.refunded_at ?? latest.created_at;
}

/** Inline footer segments after Due/Created — paid_at, refunded_at, or cancelled_at when applicable. */
export function resolveInvoiceListMetaStatusDates(
  invoice: InvoiceRow
): InvoiceListMetaStatusDateSegment[] {
  const display = resolveInvoiceDisplayStatus(invoice);
  const segments: InvoiceListMetaStatusDateSegment[] = [];

  if (display === "refunded") {
    const refundedIso = latestRefundedPaymentIso(invoice);
    if (refundedIso) {
      segments.push({ label: "Refunded", iso: refundedIso });
    }
    return segments;
  }

  if (display === "paid" && invoice.paid_at) {
    segments.push({ label: "Paid", iso: invoice.paid_at });
    return segments;
  }

  if (display === "cancelled" && invoice.cancelled_at) {
    segments.push({ label: "Cancelled", iso: invoice.cancelled_at });
  }

  return segments;
}
