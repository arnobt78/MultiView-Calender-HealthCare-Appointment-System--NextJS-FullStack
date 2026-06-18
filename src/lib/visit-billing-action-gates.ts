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
