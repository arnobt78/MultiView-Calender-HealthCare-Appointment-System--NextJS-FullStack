/**
 * Canonical doctor invoice scope — shared by server Prisma queries, client cache patch,
 * and CP invoice-management doctor filter.
 *
 * Match doctor D when any of:
 *   - invoice.user_id === D (issuer / billing owner)
 *   - visit_summary.treating_physician_id === D
 *   - visit_summary.calendar_owner_id === D (from appointment.owner_id in visit attach)
 *
 * Organisation membership alone does NOT match — use org scope for that.
 */

import type { Prisma } from "@prisma/client";
import type { InvoiceRow } from "@/lib/billing-types";

/** Prisma list/aggregate filter — issuer OR linked visit owner/treating physician. */
export function buildPrismaDoctorInvoiceWhere(doctorId: string): Prisma.InvoiceWhereInput {
  const id = doctorId.trim();
  return {
    OR: [
      { user_id: id },
      {
        appointment: {
          OR: [{ owner_id: id }, { treating_physician_id: id }],
        },
      },
    ],
  };
}

export function invoiceMatchesDoctorScope(
  invoice: { visit_summary?: InvoiceRow["visit_summary"] | null; user_id?: string | null },
  doctorId: string
): boolean {
  const id = doctorId.trim();
  if (!id) return false;
  if (invoice.user_id === id) return true;
  const summary = invoice.visit_summary;
  if (!summary) return false;
  if (summary.treating_physician_id === id) return true;
  if (summary.calendar_owner_id === id) return true;
  return false;
}

/** Unique doctor user ids tied to an invoice row — for scoped cache patch + invalidation. */
export function resolveDoctorIdsFromInvoice(
  invoice: { visit_summary?: InvoiceRow["visit_summary"] | null; user_id?: string | null }
): string[] {
  const ids = new Set<string>();
  if (invoice.user_id?.trim()) ids.add(invoice.user_id.trim());
  const summary = invoice.visit_summary;
  if (summary?.treating_physician_id?.trim()) {
    ids.add(summary.treating_physician_id.trim());
  }
  if (summary?.calendar_owner_id?.trim()) {
    ids.add(summary.calendar_owner_id.trim());
  }
  return [...ids];
}

export function filterInvoicesByDoctorScope(
  invoices: ReadonlyArray<InvoiceRow>,
  doctorId: string
): InvoiceRow[] {
  const id = doctorId.trim();
  if (!id) return [...invoices];
  return invoices.filter((inv) => invoiceMatchesDoctorScope(inv, id));
}
