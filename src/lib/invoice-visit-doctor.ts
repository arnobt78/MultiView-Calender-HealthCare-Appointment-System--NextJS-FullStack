/**
 * Map InvoiceVisitSummary physician fields → DoctorIdentityRow / DoctorAvatar input.
 */

import type { InvoiceVisitSummary } from "@/lib/billing-types";
import type { DoctorIdentityDoctor } from "@/components/shared/doctor-display/DoctorIdentityRow";

/** Treating physician from visit summary (avatar + robohash seed email). */
export function invoiceTreatingDoctorFromSummary(
  summary: InvoiceVisitSummary | null | undefined
): DoctorIdentityDoctor | null {
  if (!summary?.treating_physician_id || !summary.treating_physician_label?.trim()) {
    return null;
  }
  return {
    id: summary.treating_physician_id,
    display_name: summary.treating_physician_label,
    email: summary.treating_physician_email ?? null,
    specialty: summary.treating_physician_specialty,
    image: summary.treating_physician_image ?? null,
  };
}

/** Calendar owner from visit summary (shown even when same person as treating). */
export function invoiceCalendarOwnerDoctorFromSummary(
  summary: InvoiceVisitSummary | null | undefined
): DoctorIdentityDoctor | null {
  if (!summary?.calendar_owner_id || !summary.calendar_owner_label?.trim()) {
    return null;
  }
  return {
    id: summary.calendar_owner_id,
    display_name: summary.calendar_owner_label,
    email: summary.calendar_owner_email ?? null,
    specialty: summary.calendar_owner_specialty,
    image: summary.calendar_owner_image ?? null,
  };
}
