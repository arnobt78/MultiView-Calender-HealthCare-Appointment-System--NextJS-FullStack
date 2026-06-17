/**
 * Client filters for invoice list tables — hub + entity detail embedded tables.
 */
import type { Invoice } from "@/hooks/usePayments";
import { resolveInvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import type { InvoiceStatusFilter } from "@/lib/invoice-management-filters";
import { getInvoiceListSearchBlob } from "@/lib/invoice-list-display";

/** Invoices linked to a single appointment row. */
export function filterInvoicesForAppointment(
  invoices: readonly Invoice[],
  appointmentId: string
): Invoice[] {
  if (!appointmentId) return [];
  return invoices.filter(
    (inv) =>
      inv.appointment_id === appointmentId ||
      inv.visit_summary?.appointment_id === appointmentId
  );
}

/** Invoices for visits where `visit_summary.patient_id` matches the chart patient. */
export function filterInvoicesForPatient(
  invoices: readonly Invoice[],
  patientId: string
): Invoice[] {
  if (!patientId) return [];
  return invoices.filter((inv) => inv.visit_summary?.patient_id === patientId);
}

export function filterInvoicesByStatus(
  list: readonly Invoice[],
  status: InvoiceStatusFilter
): Invoice[] {
  if (status === "all") return [...list];
  return list.filter((inv) => resolveInvoiceDisplayStatus(inv) === status);
}

export function filterInvoicesBySearch(
  list: readonly Invoice[],
  query: string
): Invoice[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...list];
  return list.filter((inv) => getInvoiceListSearchBlob(inv).includes(q));
}

/** Status then search — same pipeline as CP invoice-management toolbar. */
export function filterInvoicesForToolbar(
  list: readonly Invoice[],
  opts: { status: InvoiceStatusFilter; search: string }
): Invoice[] {
  return filterInvoicesBySearch(filterInvoicesByStatus(list, opts.status), opts.search);
}
