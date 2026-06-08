/**
 * Doctor portal invoice list footer — Paid / Refunded milestone dates from existing row fields.
 * No cancelled_at on Invoice schema — cancelled-without-refund omits a date segment.
 */

import { resolveInvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import type { InvoiceRow } from "@/lib/billing-types";

export type InvoiceListMetaStatusDateLabel = "Paid" | "Refunded";

export type InvoiceListMetaStatusDateSegment = {
  label: InvoiceListMetaStatusDateLabel;
  iso: string;
};

function latestRefundedPaymentIso(invoice: InvoiceRow): string | null {
  const refunded = (invoice.payments ?? []).filter((p) => p.status === "refunded");
  if (refunded.length === 0) return null;
  // Payment row lacks refund timestamp — created_at is best available (original charge time).
  const sorted = [...refunded].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return sorted[0]?.created_at ?? null;
}

/** Inline footer segments after Due/Created — paid_at or refunded payment when applicable. */
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
  }

  return segments;
}
