/**
 * Visit-level billing freeze (REQ-0111). Paid-cancel refund UI lives in appointment-cancel-refund.ts.
 */

/** Staff billing mutate is frozen when the linked visit is cancelled. */
export function isVisitBillingFrozen(
  appointmentStatus: string | null | undefined
): boolean {
  return appointmentStatus === "cancelled";
}

/** Linked visit status from invoice visit_summary (list + detail). */
export function linkedAppointmentStatusFromInvoice(invoice: {
  visit_summary?: { appointment_status?: string | null } | null;
}): string | null {
  return invoice.visit_summary?.appointment_status ?? null;
}

/** Portal invoice card shell — muted when linked visit is cancelled (matches timeline cards). */
export function invoicePortalCardVisitToneClass(
  appointmentStatus: string | null | undefined
): string | undefined {
  if (appointmentStatus === "cancelled") {
    return "opacity-75 border-slate-200/80 bg-slate-50/40";
  }
  return undefined;
}
