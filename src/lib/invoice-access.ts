/**
 * Invoice RBAC — list scope in invoices-scope.ts; per-row access here (REST + SSR + UI).
 */

import { prisma } from "@/lib/prisma";
import { isValidUUID } from "@/lib/validation";
import { isAdminRole, isDoctorRole, isPatientRole } from "@/lib/rbac";
import { canPatientPayInvoiceStatus } from "@/lib/billing-status";
import { userCanViewOrganizationInvoices } from "@/lib/organization-invoice-access";
import type { InvoiceAccessLevel } from "@/lib/billing-types";

export type InvoiceAccessSession = {
  userId: string;
  email: string;
  role: string | null;
};

type InvoiceAccessRow = {
  id: string;
  user_id: string;
  appointment_id: string | null;
  organization_id: string | null;
  status: string;
};

async function loadInvoiceAccessRow(
  invoiceId: string
): Promise<InvoiceAccessRow | null> {
  return prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      id: true,
      user_id: true,
      appointment_id: true,
      organization_id: true,
      status: true,
    },
  });
}

async function orgMemberCanViewInvoice(
  userId: string,
  row: InvoiceAccessRow
): Promise<boolean> {
  if (!row.organization_id) return false;
  return userCanViewOrganizationInvoices(userId, row.organization_id);
}

/** Patient chart id when invoice is tied to an appointment on that chart. */
export async function resolvePatientIdForInvoice(
  invoiceId: string
): Promise<string | null> {
  const row = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { appointment_id: true },
  });
  if (!row?.appointment_id) return null;
  const appt = await prisma.appointment.findUnique({
    where: { id: row.appointment_id },
    select: { patient_id: true },
  });
  return appt?.patient_id ?? null;
}

async function patientOwnsInvoiceAppointment(
  email: string,
  appointmentId: string | null
): Promise<boolean> {
  if (!appointmentId) return false;
  const patient = await prisma.patient.findFirst({
    where: { email },
    select: { id: true },
  });
  if (!patient) return false;
  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, patient_id: patient.id },
    select: { id: true },
  });
  return appt != null;
}

async function doctorCanMutateLinkedInvoice(
  doctorId: string,
  row: InvoiceAccessRow
): Promise<boolean> {
  if (row.user_id === doctorId) return true;
  if (!row.appointment_id) return false;
  const appt = await prisma.appointment.findUnique({
    where: { id: row.appointment_id },
    select: { owner_id: true, treating_physician_id: true },
  });
  if (!appt) return false;
  return appt.owner_id === doctorId || appt.treating_physician_id === doctorId;
}

async function doctorIsLinkedToInvoice(
  doctorId: string,
  row: InvoiceAccessRow
): Promise<boolean> {
  if (row.user_id === doctorId) return true;
  if (!row.appointment_id) return false;
  const appt = await prisma.appointment.findFirst({
    where: {
      id: row.appointment_id,
      OR: [{ owner_id: doctorId }, { treating_physician_id: doctorId }],
    },
    select: { id: true },
  });
  return appt != null;
}

/**
 * Billing owner on create — treating physician first (patient-facing doctor), else calendar owner.
 */
export async function resolveInvoiceBillingUserId(
  appointmentId: string | null,
  fallbackUserId: string
): Promise<string> {
  if (!appointmentId) return fallbackUserId;
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { owner_id: true, treating_physician_id: true },
  });
  if (!appt) return fallbackUserId;
  return appt.treating_physician_id ?? appt.owner_id ?? fallbackUserId;
}

/** Doctor may create invoice when linked to a visit they own or treat. */
export async function doctorCanCreateInvoiceForAppointment(
  doctorId: string,
  appointmentId: string
): Promise<boolean> {
  const appt = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      OR: [{ owner_id: doctorId }, { treating_physician_id: doctorId }],
    },
    select: { id: true },
  });
  return appt != null;
}

/** Admin may attach any appointment; doctor only own/treating visits. */
export async function canCreateInvoiceForAppointment(
  session: InvoiceAccessSession,
  appointmentId: string | null
): Promise<boolean> {
  if (isPatientRole(session.role)) return false;
  if (!appointmentId) return isAdminRole(session.role) || isDoctorRole(session.role);
  if (isAdminRole(session.role)) {
    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { id: true },
    });
    return appt != null;
  }
  if (isDoctorRole(session.role)) {
    return doctorCanCreateInvoiceForAppointment(session.userId, appointmentId);
  }
  return false;
}

export async function resolveInvoiceAccess(
  session: InvoiceAccessSession,
  invoiceId: string
): Promise<InvoiceAccessLevel> {
  if (!isValidUUID(invoiceId)) return "none";

  const row = await loadInvoiceAccessRow(invoiceId);
  if (!row) return "none";

  const { role, userId, email } = session;

  if (isAdminRole(role)) return "admin";

  if (isPatientRole(role)) {
    const owns = await patientOwnsInvoiceAppointment(email, row.appointment_id);
    if (!owns) return "none";
    if (canPatientPayInvoiceStatus(row.status)) return "pay";
    return "view";
  }

  if (isDoctorRole(role)) {
    const linked =
      (await doctorIsLinkedToInvoice(userId, row)) ||
      (await orgMemberCanViewInvoice(userId, row));
    if (!linked) return "none";
    if (row.status === "paid" || row.status === "cancelled" || row.status === "refunded") {
      return "view";
    }
    // Issuer or calendar owner / treating physician on linked visit — draft/sent/overdue mutate.
    if (await doctorCanMutateLinkedInvoice(userId, row)) return "mutate";
    return "view";
  }

  return "none";
}

export function accessLevelAllows(
  level: InvoiceAccessLevel,
  required: "view" | "mutate" | "pay" | "admin"
): boolean {
  if (level === "none") return false;
  if (required === "view") {
    return level === "view" || level === "mutate" || level === "pay" || level === "admin";
  }
  if (required === "pay") return level === "pay" || level === "admin";
  if (required === "mutate") return level === "mutate" || level === "admin";
  if (required === "admin") return level === "admin";
  return false;
}

export async function assertInvoiceAccess(
  session: InvoiceAccessSession,
  invoiceId: string,
  required: "view" | "mutate" | "pay" | "admin"
): Promise<InvoiceAccessLevel> {
  const level = await resolveInvoiceAccess(session, invoiceId);
  if (!accessLevelAllows(level, required)) return "none";
  return level;
}
