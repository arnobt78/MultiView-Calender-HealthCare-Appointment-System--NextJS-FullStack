/**
 * Display helpers for invoice visit picker rows — shared by picker cards + summary.
 */

import type { InvoiceAppointmentOptionRow, InvoiceVisitSummary } from "@/lib/billing-types";

export type InvoiceVisitDisplaySource = Pick<
  InvoiceAppointmentOptionRow,
  | "title"
  | "patient_label"
  | "when_label"
  | "location_label"
  | "is_telehealth"
  | "appointment_type_name"
  | "category_label"
  | "treating_physician_label"
  | "calendar_owner_label"
>;

/** Subtitle line under visit title in picker rows. */
export function formatInvoiceVisitPickerMeta(
  source: InvoiceVisitDisplaySource
): string {
  const parts = [
    source.when_label,
    source.appointment_type_name,
    source.category_label,
    source.treating_physician_label ? `Dr. ${source.treating_physician_label}` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

/** Map visit summary (edit mode) to picker display shape. */
export function invoiceVisitSummaryToDisplay(
  summary: InvoiceVisitSummary
): InvoiceVisitDisplaySource & {
  patient_id: string | null;
  patient_email: string | null;
  patient_birth_date: string | null;
  patient_care_level: number | null;
  category_id: string | null;
  category_color: string | null;
  category_icon: string | null;
  treating_physician_specialty: string | null;
  calendar_owner_specialty: string | null;
} {
  return {
    title: summary.title,
    patient_label: summary.patient_label ?? "Patient",
    when_label: summary.when_label,
    location_label: summary.location_label,
    is_telehealth: summary.is_telehealth,
    appointment_type_name: summary.category_label,
    category_label: summary.category_label,
    treating_physician_label: summary.treating_physician_label,
    calendar_owner_label: summary.calendar_owner_label,
    patient_id: summary.patient_id,
    patient_email: summary.patient_email ?? null,
    patient_birth_date: summary.patient_birth_date ?? null,
    patient_care_level: summary.patient_care_level ?? null,
    category_id: summary.category_id,
    category_color: summary.category_color,
    category_icon: summary.category_icon,
    treating_physician_specialty: summary.treating_physician_specialty,
    calendar_owner_specialty: summary.calendar_owner_specialty,
  };
}
