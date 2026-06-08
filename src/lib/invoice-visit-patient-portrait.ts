/**
 * Patient portrait input for invoice visit rows — demo avatars, clinical_profile, robohash.
 */

import type { InvoiceVisitSummary } from "@/lib/billing-types";
import type { Patient } from "@/types/types";

export type InvoiceVisitPatientPortrait = Pick<
  Patient,
  "id" | "email" | "clinical_profile" | "birth_date"
> & {
  firstname?: string;
  lastname?: string;
};

/** Build PatientPortraitAvatar input from invoice visit_summary (shared list + detail). */
export function invoiceVisitSummaryToPatientPortrait(
  summary: InvoiceVisitSummary | null | undefined
): InvoiceVisitPatientPortrait | null {
  if (!summary?.patient_id) return null;
  return {
    id: summary.patient_id,
    email: summary.patient_email ?? null,
    clinical_profile: summary.patient_clinical_profile ?? null,
    birth_date: summary.patient_birth_date ?? null,
    firstname: summary.patient_label?.split(" ")[0],
    lastname: summary.patient_label?.split(" ").slice(1).join(" "),
  };
}
