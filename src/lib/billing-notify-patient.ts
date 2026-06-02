/**
 * Server-only patient draft-invoice notifications (email + in-app).
 * Import only from API routes / server libs — not from client components.
 */

import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { formatInvoiceMoney } from "@/lib/crud-notify-messages";

async function resolvePatientUserId(patientId: string | null): Promise<string | null> {
  if (!patientId) return null;
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { email: true },
  });
  if (!patient?.email) return null;
  const user = await prisma.user.findFirst({
    where: { email: patient.email },
    select: { id: true },
  });
  return user?.id ?? null;
}

/** Patient-facing draft invoice — in-app + best-effort email (fire-and-forget). */
export function notifyPatientDraftInvoiceCreated(opts: {
  invoiceId: string;
  patientId: string | null;
  patientEmail: string | null;
  amountCents: number;
  appointmentTitle: string;
  visitDate: Date;
}): void {
  void notifyPatientDraftInvoiceCreatedAsync(opts);
}

async function notifyPatientDraftInvoiceCreatedAsync(opts: {
  invoiceId: string;
  patientId: string | null;
  patientEmail: string | null;
  amountCents: number;
  appointmentTitle: string;
  visitDate: Date;
}): Promise<void> {
  const amountLabel = formatInvoiceMoney({
    amount: opts.amountCents,
    currency: "eur",
    unit: "cents",
  });
  const dateLabel = format(opts.visitDate, "dd.MM.yyyy");
  const title = "Visit invoice draft";
  const message = `A draft invoice (${amountLabel}) was created for "${opts.appointmentTitle}" on ${dateLabel}.`;
  const link = `/invoices/${opts.invoiceId}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const patientUserId = await resolvePatientUserId(opts.patientId);
  if (patientUserId) {
    await prisma.notification.create({
      data: {
        user_id: patientUserId,
        title,
        message,
        type: "invoice_draft",
        read: false,
        link,
      },
    });
  }

  const email = opts.patientEmail?.trim();
  if (!email) return;

  try {
    await sendEmail({
      to: email,
      subject: `HealthCal Pro — ${title}`,
      html: `<p>${message}</p><p><a href="${baseUrl}${link}">View invoice</a></p><p><a href="${baseUrl}/patient-portal">Patient portal</a></p>`,
    });
  } catch {
    /* email is best-effort; in-app notification may already exist */
  }
}
