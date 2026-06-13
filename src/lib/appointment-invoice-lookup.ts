/**
 * Client-side invoice lookup by appointment_id — warm `invoices.all` cache (SSR seed + invalidation).
 */

import type { InvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import { resolveInvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import type { InvoicePaymentRow, InvoiceRow } from "@/lib/billing-types";

/** First invoice row linked to a visit (one active bill per appointment in product rules). */
export function getInvoiceForAppointment(
  invoices: InvoiceRow[],
  appointmentId: string
): InvoiceRow | undefined {
  return invoices.find((inv) => inv.appointment_id === appointmentId);
}

/** Build appointmentId → display status map (shared by calendar + CP list). */
export function buildAppointmentInvoiceDisplayMap(
  invoices: InvoiceRow[],
  appointmentIds: string[]
): Map<string, InvoiceDisplayStatus> {
  const map = new Map<string, InvoiceDisplayStatus>();
  const idSet = new Set(appointmentIds);
  for (const inv of invoices) {
    const aid = inv.appointment_id;
    if (!aid || !idSet.has(aid) || map.has(aid)) continue;
    map.set(aid, resolveInvoiceDisplayStatus(inv));
  }
  return map;
}

/** Latest payment row for badge — prefers most recent created_at. */
export function resolveLatestInvoicePayment(
  payments: InvoicePaymentRow[] | undefined
): InvoicePaymentRow | null {
  if (!payments?.length) return null;
  return [...payments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
}

function normStatus(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

/** True when invoice display status and payment row say the same thing (duplicate Paid/Refunded). */
function isRedundantInvoiceAndPayment(
  invoiceDisplayStatus: string,
  paymentStatus: string
): boolean {
  const inv = normStatus(invoiceDisplayStatus);
  const pay = normStatus(paymentStatus);
  if (inv === "paid" && pay === "succeeded") return true;
  if (inv === "refunded" && pay === "refunded") return true;
  return false;
}

/** CP list status col — pick invoice vs payment badge without duplicate Paid/Refunded chips. */
export function resolveAppointmentListBillingBadges(input: {
  invoiceDisplayStatus?: InvoiceDisplayStatus | null;
  latestPaymentStatus?: string | null;
}): { showInvoice: boolean; showPayment: boolean } {
  const invoiceStatus = input.invoiceDisplayStatus ?? null;
  const paymentStatus = input.latestPaymentStatus ?? null;
  const hasInvoice = Boolean(invoiceStatus);
  const hasPayment = Boolean(paymentStatus?.trim());

  if (!hasInvoice) {
    return { showInvoice: false, showPayment: hasPayment };
  }

  if (!hasPayment) {
    return { showInvoice: true, showPayment: false };
  }

  if (isRedundantInvoiceAndPayment(invoiceStatus!, paymentStatus!)) {
    return { showInvoice: false, showPayment: true };
  }

  return { showInvoice: true, showPayment: true };
}
