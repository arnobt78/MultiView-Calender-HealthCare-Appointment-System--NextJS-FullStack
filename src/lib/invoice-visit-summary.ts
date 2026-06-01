/**
 * Linked visit metadata for invoice list + detail (doctor, patient, when, where).
 */

import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import type { InvoiceVisitSummary } from "@/lib/billing-types";

export const invoiceAppointmentVisitInclude = {
  category: { select: { label: true, color: true } },
  appointment_type: { select: { name: true } },
  patient: {
    select: { id: true, firstname: true, lastname: true, email: true },
  },
  owner: {
    select: { id: true, display_name: true, email: true, specialty: true },
  },
  treating_physician: {
    select: { id: true, display_name: true, email: true, specialty: true },
  },
} as const;

type VisitApptRow = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location: string | null;
  is_telehealth: boolean;
  category: { label: string | null; color: string | null } | null;
  appointment_type: { name: string | null } | null;
  patient: {
    id: string;
    firstname: string;
    lastname: string;
    email: string | null;
  } | null;
  owner: {
    id: string;
    display_name: string | null;
    email: string;
    specialty: string | null;
  } | null;
  treating_physician: {
    id: string;
    display_name: string | null;
    email: string;
    specialty: string | null;
  } | null;
};

function staffLabel(
  u: { display_name: string | null; email: string } | null | undefined
): string | null {
  if (!u) return null;
  return (u.display_name?.trim() || u.email) ?? null;
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

  const locationLabel = row.is_telehealth
    ? "Video call (telehealth)"
    : row.location?.trim() || "—";

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
    category_label: row.category?.label ?? row.appointment_type?.name ?? null,
    category_color: row.category?.color ?? null,
    treating_physician_id: row.treating_physician?.id ?? null,
    treating_physician_label: staffLabel(row.treating_physician),
    treating_physician_specialty: row.treating_physician?.specialty ?? null,
    calendar_owner_id: row.owner?.id ?? null,
    calendar_owner_label: staffLabel(row.owner),
    calendar_owner_specialty: row.owner?.specialty ?? null,
  };
}

/** One-line subtitle for invoice list rows. */
export function formatInvoiceVisitSummaryLine(summary: InvoiceVisitSummary): string {
  const parts = [
    summary.when_label,
    summary.patient_label,
    summary.treating_physician_label
      ? `Dr. ${summary.treating_physician_label}`
      : null,
    summary.title,
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
