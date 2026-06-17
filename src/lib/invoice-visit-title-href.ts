import {
  appointmentDetailHref,
  invoiceDetailHref,
  type EntityRole,
} from "@/lib/entity-routes";

/** Invoice row shape for visit title link — appointment detail when visit exists. */
export type InvoiceVisitTitleSource = {
  id: string;
  appointment_id?: string | null;
  visit_summary?: { appointment_id?: string | null } | null;
};

/**
 * Description-column visit title — opens appointment detail when linked;
 * invoice number column still uses invoiceDetailHref.
 */
export function resolveInvoiceVisitTitleHref(
  invoice: InvoiceVisitTitleSource,
  viewerRole: EntityRole
): string {
  const appointmentId =
    invoice.appointment_id?.trim() ||
    invoice.visit_summary?.appointment_id?.trim() ||
    null;
  if (appointmentId) {
    return appointmentDetailHref(viewerRole, appointmentId);
  }
  return invoiceDetailHref(viewerRole, invoice.id);
}
