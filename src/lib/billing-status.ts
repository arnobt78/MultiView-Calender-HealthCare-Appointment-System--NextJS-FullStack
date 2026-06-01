/**
 * Invoice status transitions — enforced on PATCH and admin actions.
 */

import type { InvoiceStatus } from "@/lib/billing-types";

const ALLOWED: Record<InvoiceStatus, readonly InvoiceStatus[]> = {
  draft: ["sent", "cancelled", "overdue"],
  sent: ["paid", "overdue", "cancelled"],
  overdue: ["paid", "sent", "cancelled"],
  paid: [],
  cancelled: [],
};

/** Statuses a patient may pay via Stripe Checkout. */
export const PATIENT_PAYABLE_STATUSES: readonly InvoiceStatus[] = [
  "draft",
  "sent",
  "overdue",
];

export function isInvoiceStatus(value: string): value is InvoiceStatus {
  return value in ALLOWED;
}

export function canTransitionInvoiceStatus(
  from: string,
  to: string
): boolean {
  if (!isInvoiceStatus(from) || !isInvoiceStatus(to)) return false;
  if (from === to) return true;
  return ALLOWED[from].includes(to);
}

export function assertInvoiceStatusTransition(
  from: string,
  to: string
): { ok: true } | { ok: false; message: string } {
  if (from === to) return { ok: true };
  if (!canTransitionInvoiceStatus(from, to)) {
    return {
      ok: false,
      message: `Cannot change invoice status from "${from}" to "${to}".`,
    };
  }
  return { ok: true };
}

export function canPatientPayInvoiceStatus(status: string): boolean {
  return (PATIENT_PAYABLE_STATUSES as readonly string[]).includes(status);
}
