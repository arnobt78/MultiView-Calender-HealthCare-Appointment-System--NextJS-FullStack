/**
 * Map dashboard calendar `FullAppointment` → invoice create picker row.
 * Seeds `queryKeys.billing.appointmentOptions(id)` so Create Invoice from calendar
 * surfaces (month hover, side panel, list) skip fetch skeleton / visit-not-found flash.
 */
import type { QueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import type { FullAppointment } from "@/hooks/useAppointments";
import type { Invoice } from "@/hooks/usePayments";
import type { OwnerUserSummary } from "@/hooks/useOwnerUserSummaries";
import {
  mapLatestInvoicesByAppointmentId,
  resolveAppointmentBillingSummary,
} from "@/lib/billing-appointment-eligibility";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";
import { resolveAppointmentDisplayLocation } from "@/lib/appointment-visit-location";
import { resolveVisitFeeCents } from "@/lib/billing-visit-fee";
import { resolveTreatingPhysicianUserId } from "@/lib/appointment-display-doctor";
import {
  formatClinicianNameEmailLabel,
  portalClinicianDisplayLabel,
} from "@/lib/portal-appointment";
import type { PortalAppointmentClinicianUser } from "@/lib/serializers";
import { queryKeys } from "@/lib/query-keys";

export type BillingOptionClinicianLookup = {
  queryClient?: QueryClient;
  currentUser?: OwnerUserSummary | null;
};

function formatCalendarWhenLabel(start: string, end: string): string | undefined {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return undefined;
  return `${format(startDate, "dd.MM.yyyy")} · ${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")}`;
}

function mapLinkedInvoicesToLatest(linkedInvoices: readonly Invoice[]) {
  if (linkedInvoices.length === 0) return null;
  const rows = linkedInvoices.map((inv) => ({
    id: inv.id,
    status: inv.status,
    amount: inv.amount,
    currency: inv.currency,
    payments: inv.payments ?? [],
    appointment_id: inv.appointment_id ?? null,
    created_at: new Date(inv.created_at),
  }));
  return mapLatestInvoicesByAppointmentId(rows).values().next().value ?? null;
}

function readOwnerUserFromLookup(
  userId: string | null | undefined,
  lookup: BillingOptionClinicianLookup
): OwnerUserSummary | null {
  if (!userId) return null;
  if (lookup.currentUser?.id === userId) return lookup.currentUser;
  if (!lookup.queryClient) return null;
  return (
    lookup.queryClient.getQueryData<OwnerUserSummary | null>(
      queryKeys.users.search(userId)
    ) ?? null
  );
}

function clinicianFieldsFromSources(
  userId: string | null | undefined,
  portalClinician: PortalAppointmentClinicianUser | null | undefined,
  lookup: BillingOptionClinicianLookup
): {
  label: string;
  email: string | null;
  specialty: string | null;
  image: string | null;
  role: string | null;
} {
  if (portalClinician) {
    return {
      label: portalClinicianDisplayLabel(portalClinician),
      email: portalClinician.email ?? null,
      specialty: portalClinician.specialty ?? null,
      image: portalClinician.image ?? null,
      role: portalClinician.role ?? null,
    };
  }
  const summary = readOwnerUserFromLookup(userId, lookup);
  return {
    label: summary
      ? formatClinicianNameEmailLabel(summary.display_name, summary.email)
      : "--",
    email: summary?.email ?? null,
    specialty: summary?.specialty ?? null,
    image: summary?.image ?? null,
    role: null,
  };
}

/** Build create invoice picker row from warm appointments.all cache — parity with detail SSR seed. */
export function mapFullAppointmentToBillingOption(
  appt: FullAppointment,
  linkedInvoices: readonly Invoice[] = [],
  lookup: BillingOptionClinicianLookup = {}
): InvoiceAppointmentOptionRow {
  const patient = appt.patient_data;
  const category = appt.category_data;
  const billing = resolveAppointmentBillingSummary(mapLinkedInvoicesToLatest(linkedInvoices));

  const patientLabel = patient
    ? `${patient.firstname} ${patient.lastname}`.trim() || patient.email || "Patient"
    : "Patient";

  const typePriceCents = appt.appointment_type_price_cents ?? null;
  const doctorFeeCents = appt.doctor_consultation_fee_cents ?? null;
  const visitFeeCents = resolveVisitFeeCents({
    typePriceCents,
    doctorConsultationFeeCents: doctorFeeCents,
  });

  const calendarOwnerId = appt.user_id;
  const treatingPhysicianId = resolveTreatingPhysicianUserId(appt);

  const owner = clinicianFieldsFromSources(calendarOwnerId, appt.portal_owner, lookup);
  const treating = clinicianFieldsFromSources(
    treatingPhysicianId,
    appt.portal_treating_physician,
    lookup
  );

  return {
    id: appt.id,
    title: appt.title,
    start: appt.start,
    end: appt.end,
    owner_id: calendarOwnerId,
    patient_label: patientLabel,
    eligible: billing.eligible,
    block_reason: billing.blockReason,
    invoice_id: billing.invoiceId,
    invoice_status: billing.invoiceStatus,
    display_status: billing.displayStatus,
    amount_cents: billing.amountCents,
    currency: billing.currency,
    suggested_amount_cents: billing.eligible ? visitFeeCents : null,
    appointment_type_price_cents: typePriceCents,
    doctor_consultation_fee_cents: doctorFeeCents,
    patient_id: patient?.id ?? appt.patient ?? null,
    patient_email: patient?.email ?? null,
    patient_birth_date: patient?.birth_date ?? null,
    patient_care_level: patient?.care_level ?? null,
    patient_clinical_profile: patient?.clinical_profile ?? null,
    when_label: formatCalendarWhenLabel(appt.start, appt.end),
    location_label: resolveAppointmentDisplayLocation({
      location: appt.location,
      is_telehealth: appt.is_telehealth,
    }),
    is_telehealth: appt.is_telehealth,
    appointment_type_name: appt.appointment_type_name ?? null,
    category_id: category?.id ?? appt.category ?? null,
    category_label: category?.label ?? null,
    category_color: category?.color ?? null,
    category_icon: category?.icon ?? null,
    treating_physician_id: treatingPhysicianId,
    treating_physician_label: treating.label,
    treating_physician_email: treating.email,
    treating_physician_specialty: treating.specialty,
    treating_physician_image: treating.image,
    treating_physician_role: treating.role,
    calendar_owner_id: calendarOwnerId,
    calendar_owner_label: owner.label,
    calendar_owner_email: owner.email,
    calendar_owner_specialty: owner.specialty,
    calendar_owner_image: owner.image,
    calendar_owner_role: owner.role,
    duration_minutes: appt.duration_minutes ?? null,
    appointment_type_duration_minutes: appt.appointment_type_duration_minutes ?? null,
  };
}
