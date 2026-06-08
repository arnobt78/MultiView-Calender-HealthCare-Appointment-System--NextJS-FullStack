/**
 * Linked visit metadata for invoice list + detail (doctor, patient, when, where).
 */

import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { resolveAppointmentVisitLocationLabel } from "@/lib/appointment-visit-location";
import type { InvoiceVisitSummary } from "@/lib/billing-types";

export const invoiceAppointmentVisitInclude = {
  category: { select: { id: true, label: true, color: true, icon: true } },
  appointment_type: {
    select: { name: true, duration_minutes: true, price_cents: true },
  },
  patient: {
    select: {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
      birth_date: true,
      care_level: true,
      clinical_profile: true,
    },
  },
  owner: {
    select: {
      id: true,
      display_name: true,
      email: true,
      specialty: true,
      image: true,
      role: true,
      consultation_fee: true,
    },
  },
  treating_physician: {
    select: {
      id: true,
      display_name: true,
      email: true,
      specialty: true,
      image: true,
      role: true,
      consultation_fee: true,
    },
  },
} as const;

type VisitApptRow = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location: string | null;
  is_telehealth: boolean;
  category: {
    id: string;
    label: string | null;
    color: string | null;
    icon: string | null;
  } | null;
  duration_minutes?: number | null;
  appointment_type?: {
    name: string | null;
    duration_minutes?: number | null;
    price_cents?: number | null;
  } | null;
  patient: {
    id: string;
    firstname: string;
    lastname: string;
    email: string | null;
    birth_date: Date | null;
    care_level: number | null;
    clinical_profile: unknown;
  } | null;
  owner: {
    id: string;
    display_name: string | null;
    email: string;
    specialty: string | null;
    image: string | null;
    role: string | null;
    consultation_fee: number | null;
  } | null;
  treating_physician: {
    id: string;
    display_name: string | null;
    email: string;
    specialty: string | null;
    image: string | null;
    role: string | null;
    consultation_fee: number | null;
  } | null;
};

function staffLabel(
  u: { display_name: string | null; email: string } | null | undefined
): string | null {
  if (!u) return null;
  return (u.display_name?.trim() || u.email) ?? null;
}

/** Extract portrait URL from patient `clinical_profile` JSON for linked visit rows. */
function resolvePatientClinicalProfileImage(
  clinicalProfile: unknown
): { image_url?: string } | null {
  if (!clinicalProfile || typeof clinicalProfile !== "object" || Array.isArray(clinicalProfile)) {
    return null;
  }
  const imageUrl = (clinicalProfile as { image_url?: string }).image_url?.trim();
  return imageUrl ? { image_url: imageUrl } : null;
}

export function mapAppointmentToInvoiceVisitSummary(
  row: VisitApptRow
): InvoiceVisitSummary {
  const patientName = row.patient
    ? [row.patient.firstname, row.patient.lastname].filter(Boolean).join(" ").trim() ||
      row.patient.email?.trim() ||
      "Patient"
    : null;

  const whenLabel = `${format(row.start, "EEE, dd MMM yyyy")} · ${format(row.start, "HH:mm")} – ${format(row.end, "HH:mm")}`;

  const locationLabel =
    resolveAppointmentVisitLocationLabel(
      { location: row.location, is_telehealth: row.is_telehealth },
      { telehealthPlaceholder: "Video call (telehealth)" }
    ) ?? "—";

  return {
    appointment_id: row.id,
    title: row.title,
    start_iso: row.start.toISOString(),
    end_iso: row.end.toISOString(),
    when_label: whenLabel,
    location_label: locationLabel,
    is_telehealth: row.is_telehealth,
    patient_id: row.patient?.id ?? null,
    patient_label: patientName,
    patient_email: row.patient?.email ?? null,
    patient_birth_date: row.patient?.birth_date?.toISOString() ?? null,
    patient_clinical_profile: resolvePatientClinicalProfileImage(row.patient?.clinical_profile),
    patient_care_level: row.patient?.care_level ?? null,
    appointment_type_name: row.appointment_type?.name ?? null,
    duration_minutes: row.duration_minutes ?? null,
    appointment_type_duration_minutes: row.appointment_type?.duration_minutes ?? null,
    category_id: row.category?.id ?? null,
    category_label: row.category?.label ?? row.appointment_type?.name ?? null,
    category_color: row.category?.color ?? null,
    category_icon: row.category?.icon ?? null,
    treating_physician_id: row.treating_physician?.id ?? null,
    treating_physician_label: staffLabel(row.treating_physician),
    treating_physician_email: row.treating_physician?.email ?? null,
    treating_physician_specialty: row.treating_physician?.specialty ?? null,
    treating_physician_image: row.treating_physician?.image?.trim() || null,
    treating_physician_role: row.treating_physician?.role ?? null,
    calendar_owner_id: row.owner?.id ?? null,
    calendar_owner_label: staffLabel(row.owner),
    calendar_owner_email: row.owner?.email ?? null,
    calendar_owner_specialty: row.owner?.specialty ?? null,
    calendar_owner_image: row.owner?.image?.trim() || null,
    calendar_owner_role: row.owner?.role ?? null,
    appointment_type_price_cents: row.appointment_type?.price_cents ?? null,
    doctor_consultation_fee_cents:
      (row.treating_physician ?? row.owner)?.consultation_fee ?? null,
  };
}

/** One-line subtitle — when/patient/doctor only (title lives on row link). */
export function formatInvoiceVisitSummaryLine(summary: InvoiceVisitSummary): string {
  const parts = [
    summary.when_label,
    summary.patient_label,
    summary.treating_physician_label
      ? `Dr. ${summary.treating_physician_label}`
      : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

/** Batch-load visit summaries for invoice list responses (no N+1). */
export async function attachVisitSummariesToInvoices<
  T extends { appointment_id?: string | null },
>(invoices: T[]): Promise<(T & { visit_summary?: InvoiceVisitSummary })[]> {
  const ids = [
    ...new Set(
      invoices
        .map((i) => i.appointment_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    ),
  ];
  if (ids.length === 0) return invoices;

  const appts = await prisma.appointment.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      start: true,
      end: true,
      location: true,
      duration_minutes: true,
      is_telehealth: true,
      category: invoiceAppointmentVisitInclude.category,
      appointment_type: invoiceAppointmentVisitInclude.appointment_type,
      patient: invoiceAppointmentVisitInclude.patient,
      owner: invoiceAppointmentVisitInclude.owner,
      treating_physician: invoiceAppointmentVisitInclude.treating_physician,
    },
  });

  const byId = new Map(
    appts.map((a) => [a.id, mapAppointmentToInvoiceVisitSummary(a as VisitApptRow)])
  );

  return invoices.map((inv) => {
    const aid = inv.appointment_id;
    if (!aid) return inv;
    const visit_summary = byId.get(aid);
    return visit_summary ? { ...inv, visit_summary } : inv;
  });
}

/** Batch issuer display for invoice list cards (billing `user_id`). */
export async function attachInvoiceIssuerLabels<
  T extends { user_id: string },
>(invoices: T[]): Promise<
  (T & {
    issuer_label: string | null;
    issuer_image: string | null;
    issuer_email: string | null;
    issuer_role: string | null;
  })[]
> {
  const userIds = [...new Set(invoices.map((i) => i.user_id).filter(Boolean))];
  if (userIds.length === 0) {
    return invoices.map((inv) => ({
      ...inv,
      issuer_label: null,
      issuer_image: null,
      issuer_email: null,
      issuer_role: null,
    }));
  }

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, display_name: true, email: true, image: true, role: true },
  });
  const byId = new Map(
    users.map((u) => [
      u.id,
      {
        label: (u.display_name?.trim() || u.email?.trim() || null) as string | null,
        image: u.image ?? null,
        email: u.email?.trim() ?? null,
        role: u.role ?? null,
      },
    ])
  );

  return invoices.map((inv) => {
    const issuer = byId.get(inv.user_id);
    return {
      ...inv,
      issuer_label: issuer?.label ?? null,
      issuer_image: issuer?.image ?? null,
      issuer_email: issuer?.email ?? null,
      issuer_role: issuer?.role ?? null,
    };
  });
}

export async function loadInvoiceVisitSummary(
  appointmentId: string
): Promise<InvoiceVisitSummary | null> {
  const row = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      id: true,
      title: true,
      start: true,
      end: true,
      location: true,
      duration_minutes: true,
      is_telehealth: true,
      category: invoiceAppointmentVisitInclude.category,
      appointment_type: invoiceAppointmentVisitInclude.appointment_type,
      patient: invoiceAppointmentVisitInclude.patient,
      owner: invoiceAppointmentVisitInclude.owner,
      treating_physician: invoiceAppointmentVisitInclude.treating_physician,
    },
  });
  if (!row) return null;
  return mapAppointmentToInvoiceVisitSummary(row as VisitApptRow);
}
