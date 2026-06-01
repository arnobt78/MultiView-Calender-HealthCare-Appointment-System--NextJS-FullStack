/**
 * In-app notifications for billing events — SSE subscriber invalidates invoice caches.
 */

import { prisma } from "@/lib/prisma";

export const BILLING_NOTIFICATION_TYPES = [
  "invoice_paid",
  "invoice_failed",
  "invoice_refunded",
] as const;

export type BillingNotificationType = (typeof BILLING_NOTIFICATION_TYPES)[number];

export function isBillingNotificationType(
  type: string
): type is BillingNotificationType {
  return (BILLING_NOTIFICATION_TYPES as readonly string[]).includes(type);
}

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

/** Fire-and-forget rows for doctor + patient after webhook or manual payment. */
export async function notifyBillingStatusChange(opts: {
  invoiceId: string;
  event: "paid" | "failed" | "refunded";
  patientId?: string | null;
  appointmentId?: string | null;
  invoiceOwnerUserId: string;
}): Promise<void> {
  const typeMap = {
    paid: "invoice_paid",
    failed: "invoice_failed",
    refunded: "invoice_refunded",
  } as const;
  const type = typeMap[opts.event];
  const title =
    opts.event === "paid"
      ? "Invoice paid"
      : opts.event === "failed"
        ? "Payment failed"
        : "Invoice refunded";
  const message = `Invoice #${opts.invoiceId.slice(0, 8)} — ${opts.event}.`;

  const recipientIds = new Set<string>();
  recipientIds.add(opts.invoiceOwnerUserId);

  const patientUserId = await resolvePatientUserId(opts.patientId ?? null);
  if (patientUserId) recipientIds.add(patientUserId);

  await Promise.all(
    [...recipientIds].map((user_id) =>
      prisma.notification.create({
        data: {
          user_id,
          title,
          message,
          type,
          read: false,
          link: null,
        },
      })
    )
  );
}
