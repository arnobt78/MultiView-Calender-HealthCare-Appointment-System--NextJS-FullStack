/**
 * Shared load for GET /api/billing/appointment-options — API route + SSR prefetch.
 * Rich visit rows reuse `mapAppointmentToInvoiceVisitSummary` for picker card parity.
 */

import { prisma } from "@/lib/prisma";
import { PAGINATION } from "@/lib/constants";
import { isValidUUID } from "@/lib/validation";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";
import {
  mapLatestInvoicesByAppointmentId,
  resolveAppointmentBillingSummary,
} from "@/lib/billing-appointment-eligibility";
import { resolveVisitFeeCents } from "@/lib/billing-visit-fee";
import {
  invoiceAppointmentVisitInclude,
  mapAppointmentToInvoiceVisitSummary,
} from "@/lib/invoice-visit-summary";

const PICKER_LIMIT = 40;

export type FetchBillingAppointmentOptionsInput = {
  sessionUserId: string;
  role: string | null;
  search?: string;
  /** Admin-only: include visits with blocking invoices (disabled rows). */
  includeBilled?: boolean;
};

export async function fetchBillingAppointmentOptions(
  input: FetchBillingAppointmentOptionsInput
): Promise<InvoiceAppointmentOptionRow[]> {
  const { sessionUserId, role } = input;
  const search = input.search?.trim() ?? "";
  const includeBilled = Boolean(isAdminRole(role) && input.includeBilled);

  if (!isAdminRole(role) && !isDoctorRole(role)) {
    return [];
  }

  const searchFilter =
    search.length > 0
      ? isValidUUID(search)
        ? { id: search }
        : { title: { contains: search, mode: "insensitive" as const } }
      : {};

  const where = isAdminRole(role)
    ? searchFilter
    : {
        AND: [
          searchFilter,
          {
            OR: [
              { owner_id: sessionUserId },
              { treating_physician_id: sessionUserId },
            ],
          },
        ],
      };

  const rows = await prisma.appointment.findMany({
    where,
    orderBy: { start: "desc" },
    take: Math.min(PICKER_LIMIT, PAGINATION.MAX_LIMIT),
    select: {
      id: true,
      title: true,
      start: true,
      end: true,
      location: true,
      is_telehealth: true,
      owner_id: true,
      treating_physician_id: true,
      category: invoiceAppointmentVisitInclude.category,
      appointment_type: {
        select: { name: true, price_cents: true },
      },
      patient: {
        select: {
          ...invoiceAppointmentVisitInclude.patient.select,
          clinical_profile: true,
        },
      },
      owner: {
        select: {
          ...invoiceAppointmentVisitInclude.owner.select,
          consultation_fee: true,
        },
      },
      treating_physician: {
        select: {
          ...invoiceAppointmentVisitInclude.treating_physician.select,
          consultation_fee: true,
        },
      },
    },
  });

  const apptIds = rows.map((r) => r.id);
  const invoiceRows =
    apptIds.length > 0
      ? await prisma.invoice.findMany({
          where: { appointment_id: { in: apptIds } },
          orderBy: { created_at: "desc" },
          select: {
            id: true,
            appointment_id: true,
            status: true,
            amount: true,
            currency: true,
            created_at: true,
            payments: { select: { status: true } },
          },
        })
      : [];

  const latestByAppt = mapLatestInvoicesByAppointmentId(invoiceRows);
  const options: InvoiceAppointmentOptionRow[] = [];

  for (const row of rows) {
    const latest = latestByAppt.get(row.id) ?? null;
    const billing = resolveAppointmentBillingSummary(latest);
    if (!billing.eligible && !includeBilled) continue;

    const feeDoctor = row.treating_physician ?? row.owner;
    const visitFeeCents = resolveVisitFeeCents({
      typePriceCents: row.appointment_type?.price_cents,
      doctorConsultationFeeCents: feeDoctor?.consultation_fee ?? null,
    });
    const suggestedAmountCents =
      billing.eligible && visitFeeCents > 0 ? visitFeeCents : null;

    const visitSummary = mapAppointmentToInvoiceVisitSummary(row);
    const clinicalProfile = row.patient?.clinical_profile;
    const patientClinicalProfile =
      clinicalProfile &&
      typeof clinicalProfile === "object" &&
      !Array.isArray(clinicalProfile)
        ? (clinicalProfile as { image_url?: string })
        : null;

    options.push({
      id: row.id,
      title: row.title,
      start: row.start.toISOString(),
      end: row.end.toISOString(),
      owner_id: row.owner_id,
      patient_label: visitSummary.patient_label ?? "Patient",
      eligible: billing.eligible,
      block_reason: billing.blockReason,
      invoice_id: billing.invoiceId,
      invoice_status: billing.invoiceStatus,
      display_status: billing.displayStatus,
      amount_cents: billing.amountCents,
      currency: billing.currency,
      suggested_amount_cents: suggestedAmountCents,
      patient_id: visitSummary.patient_id,
      patient_email: visitSummary.patient_email,
      patient_birth_date: visitSummary.patient_birth_date,
      patient_care_level: visitSummary.patient_care_level,
      patient_clinical_profile: patientClinicalProfile,
      when_label: visitSummary.when_label,
      location_label: visitSummary.location_label,
      is_telehealth: visitSummary.is_telehealth,
      appointment_type_name: row.appointment_type?.name ?? null,
      category_id: visitSummary.category_id,
      category_label: visitSummary.category_label,
      category_color: visitSummary.category_color,
      category_icon: visitSummary.category_icon,
      treating_physician_id: visitSummary.treating_physician_id,
      treating_physician_label: visitSummary.treating_physician_label,
      treating_physician_specialty: visitSummary.treating_physician_specialty,
      calendar_owner_id: visitSummary.calendar_owner_id,
      calendar_owner_label: visitSummary.calendar_owner_label,
      calendar_owner_specialty: visitSummary.calendar_owner_specialty,
    });
  }

  return options;
}
