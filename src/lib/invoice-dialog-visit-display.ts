/**
 * Normalized linked-visit display for invoice create/edit dialog — picker + summary parity.
 */

import {
  formatAppointmentTypeDurationLabel,
  resolveAppointmentTypeDurationMinutes,
  resolveAppointmentTypeDisplayName,
} from "@/lib/appointment-type-display";
import type { VisitFeeInput } from "@/lib/appointment-visit-fee-display";
import type {
  InvoiceAppointmentOptionRow,
  InvoiceVisitSummary,
} from "@/lib/billing-types";
import {
  invoiceAppointmentOptionToMetaInput,
  invoiceVisitSummaryToMetaInput,
  type InvoiceVisitMetaInput,
} from "@/lib/invoice-visit-meta-line";
import {
  invoiceCalendarOwnerDoctorFromSummary,
  invoiceTreatingDoctorFromSummary,
} from "@/lib/invoice-visit-doctor";
import {
  invoiceVisitSummaryToPatientPortrait,
  type InvoiceVisitPatientPortrait,
} from "@/lib/invoice-visit-patient-portrait";

export type InvoiceDialogVisitDoctor = {
  id: string;
  name: string;
  email: string | null;
  image: string | null;
  specialty: string | null;
  role: string | null;
};

export type InvoiceDialogVisitDisplay = {
  patientPortrait: InvoiceVisitPatientPortrait | null;
  patientLabel: string;
  patientCareLevel: number | null;
  birthDate: string | null;
  isTelehealth: boolean;
  title: string;
  appointmentTypeName: string | null;
  typeDurationLabel: string | null;
  visitMeta: InvoiceVisitMetaInput;
  categoryLabel: string | null;
  categoryColor: string | null;
  categoryIcon: string | null;
  treating: InvoiceDialogVisitDoctor | null;
  owner: InvoiceDialogVisitDoctor | null;
  visitFeeInput: VisitFeeInput | null;
};

function doctorFromSummaryFields(
  id: string | null | undefined,
  label: string | null | undefined,
  email: string | null | undefined,
  image: string | null | undefined,
  specialty: string | null | undefined,
  role: string | null | undefined
): InvoiceDialogVisitDoctor | null {
  if (!id || !label?.trim()) return null;
  return {
    id,
    name: label,
    email: email ?? null,
    image: image ?? null,
    specialty: specialty ?? null,
    role: role ?? null,
  };
}

function mapSummaryDoctor(
  doctor: ReturnType<typeof invoiceTreatingDoctorFromSummary>,
  role: string | null | undefined
): InvoiceDialogVisitDoctor | null {
  if (!doctor) return null;
  return {
    id: doctor.id,
    name: doctor.display_name ?? "",
    email: doctor.email ?? null,
    image: doctor.image ?? null,
    specialty: doctor.specialty ?? null,
    role: role ?? null,
  };
}

export function invoiceVisitSummaryToDialogDisplay(
  summary: InvoiceVisitSummary
): InvoiceDialogVisitDisplay {
  const patientPortrait = invoiceVisitSummaryToPatientPortrait(summary);
  const typeName = resolveAppointmentTypeDisplayName(summary);
  const typeDurationLabel = formatAppointmentTypeDurationLabel(
    resolveAppointmentTypeDurationMinutes(summary)
  );

  const treatingSummary = invoiceTreatingDoctorFromSummary(summary);
  const ownerSummary = invoiceCalendarOwnerDoctorFromSummary(summary);

  return {
    patientPortrait,
    patientLabel: summary.patient_label ?? "Patient",
    patientCareLevel: summary.patient_care_level ?? null,
    birthDate: summary.patient_birth_date ?? null,
    isTelehealth: summary.is_telehealth,
    title: summary.title,
    appointmentTypeName: typeName,
    typeDurationLabel,
    visitMeta: invoiceVisitSummaryToMetaInput(summary),
    categoryLabel: summary.category_label,
    categoryColor: summary.category_color,
    categoryIcon: summary.category_icon,
    treating: mapSummaryDoctor(treatingSummary, summary.treating_physician_role),
    owner: mapSummaryDoctor(ownerSummary, summary.calendar_owner_role),
    visitFeeInput: {
      typePriceCents: summary.appointment_type_price_cents,
      doctorConsultationFeeCents: summary.doctor_consultation_fee_cents,
    },
  };
}

export function invoiceAppointmentOptionToDialogDisplay(
  option: InvoiceAppointmentOptionRow
): InvoiceDialogVisitDisplay {
  const typeSource = {
    appointment_type_name: option.appointment_type_name,
    title: option.title,
    duration_minutes: option.duration_minutes,
    appointment_type_duration_minutes: option.appointment_type_duration_minutes,
  };
  const typeName = resolveAppointmentTypeDisplayName(typeSource);
  const typeDurationLabel = formatAppointmentTypeDurationLabel(
    resolveAppointmentTypeDurationMinutes(typeSource)
  );

  const treating = doctorFromSummaryFields(
    option.treating_physician_id,
    option.treating_physician_label,
    option.treating_physician_email,
    option.treating_physician_image,
    option.treating_physician_specialty,
    option.treating_physician_role
  );
  const owner = doctorFromSummaryFields(
    option.calendar_owner_id,
    option.calendar_owner_label,
    option.calendar_owner_email,
    option.calendar_owner_image,
    option.calendar_owner_specialty,
    option.calendar_owner_role
  );
  const distinctOwner =
    owner && treating && owner.id === treating.id ? null : owner;

  return {
    patientPortrait: option.patient_id
      ? {
          id: option.patient_id,
          email: option.patient_email ?? null,
          clinical_profile: option.patient_clinical_profile ?? null,
          birth_date: option.patient_birth_date ?? null,
          firstname: option.patient_label.split(" ")[0],
          lastname: option.patient_label.split(" ").slice(1).join(" "),
        }
      : null,
    patientLabel: option.patient_label,
    patientCareLevel: option.patient_care_level ?? null,
    birthDate: option.patient_birth_date ?? null,
    isTelehealth: option.is_telehealth ?? false,
    title: option.title,
    appointmentTypeName: typeName,
    typeDurationLabel,
    visitMeta: invoiceAppointmentOptionToMetaInput(option),
    categoryLabel: option.category_label ?? null,
    categoryColor: option.category_color ?? null,
    categoryIcon: option.category_icon ?? null,
    treating,
    owner: distinctOwner,
    visitFeeInput: {
      typePriceCents: option.appointment_type_price_cents,
      doctorConsultationFeeCents: option.doctor_consultation_fee_cents,
    },
  };
}
