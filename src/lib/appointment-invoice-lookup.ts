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
