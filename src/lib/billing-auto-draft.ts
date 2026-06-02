/**
 * Auto-create draft invoice when a visit is marked done (staff only).
 */

import { prisma } from "@/lib/prisma";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";
import {
  assertAppointmentEligibleForNewInvoice,
} from "@/lib/billing-appointment-eligibility";
import {
  canCreateInvoiceForAppointment,
  resolveInvoiceBillingUserId,
  type InvoiceAccessSession,
} from "@/lib/invoice-access";
import { resolveInvoiceOrganizationId } from "@/lib/invoice-organization-resolve";
import {
  invalidateBillingRedisCaches,
  resolvePatientPortalUserIdForAppointment,
} from "@/lib/billing-cache";
import { resolveVisitFeeCents } from "@/lib/billing-visit-fee";
import { notifyPatientDraftInvoiceCreated } from "@/lib/billing-notify-patient";
import { format } from "date-fns";

export type MaybeAutoDraftResult =
  | { created: false; reason: string }
  | { created: true; invoiceId: string };

function buildAutoDraftDescription(opts: {
  title: string;
  start: Date;
  patientLabel: string;
  typeName: string | null;
}): string {
  const dateStr = format(opts.start, "yyyy-MM-dd");
  const typePart = opts.typeName ? ` — ${opts.typeName}` : "";
  return `Visit invoice — ${opts.title} — ${dateStr} — ${opts.patientLabel}${typePart}`;
}

/**
 * Called when appointment transitions to `done` — skips if blocking invoice exists or amount unknown.
 */
export async function maybeCreateDraftInvoiceForCompletedVisit(
  appointmentId: string,
  session: InvoiceAccessSession
): Promise<MaybeAutoDraftResult> {
  if (!isAdminRole(session.role) && !isDoctorRole(session.role)) {
    return { created: false, reason: "not_staff" };
  }

  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      id: true,
      title: true,
      start: true,
      status: true,
      owner_id: true,
      treating_physician_id: true,
      patient_id: true,
      patient: {
        select: { firstname: true, lastname: true, email: true },
      },
      appointment_type: { select: { name: true, price_cents: true } },
      owner: { select: { consultation_fee: true } },
      treating_physician: { select: { consultation_fee: true } },
    },
  });

  if (!appt || appt.status !== "done") {
    return { created: false, reason: "not_done" };
  }

  const canCreate = await canCreateInvoiceForAppointment(session, appointmentId);
  if (!canCreate) return { created: false, reason: "forbidden" };

  const eligibility = await assertAppointmentEligibleForNewInvoice(appointmentId);
  if (!eligibility.ok) return { created: false, reason: "blocking_invoice" };

  const billingUserId = await resolveInvoiceBillingUserId(
    appointmentId,
    session.userId
  );

  const feeDoctor = appt.treating_physician ?? appt.owner;
  const amountCents = resolveVisitFeeCents({
    typePriceCents: appt.appointment_type?.price_cents,
    doctorConsultationFeeCents: feeDoctor?.consultation_fee,
  });
  if (amountCents <= 0) {
    return { created: false, reason: "no_price" };
  }

  const patientLabel =
    [appt.patient?.firstname, appt.patient?.lastname].filter(Boolean).join(" ").trim() ||
    appt.patient?.email?.trim() ||
    "Patient";

  const orgResolved = await resolveInvoiceOrganizationId({
    sessionUserId: session.userId,
    role: session.role,
    appointmentId,
    billingUserId,
  });
  if (orgResolved.forbidden) {
    return { created: false, reason: "org_forbidden" };
  }

  const invoice = await prisma.invoice.create({
    data: {
      user_id: billingUserId,
      amount: amountCents,
      currency: "eur",
      description: buildAutoDraftDescription({
        title: appt.title,
        start: appt.start,
        patientLabel,
        typeName: appt.appointment_type?.name ?? null,
      }),
      appointment_id: appointmentId,
      organization_id: orgResolved.organizationId,
      status: "draft",
    },
    select: { id: true },
  });

  const patientPortalUserId =
    await resolvePatientPortalUserIdForAppointment(appointmentId);

  await invalidateBillingRedisCaches({
    invoiceUserId: billingUserId,
    appointmentId,
    patientPortalUserId,
  });

  notifyPatientDraftInvoiceCreated({
    invoiceId: invoice.id,
    patientId: appt.patient_id,
    patientEmail: appt.patient?.email ?? null,
    amountCents,
    appointmentTitle: appt.title,
    visitDate: appt.start,
  });

  return { created: true, invoiceId: invoice.id };
}
