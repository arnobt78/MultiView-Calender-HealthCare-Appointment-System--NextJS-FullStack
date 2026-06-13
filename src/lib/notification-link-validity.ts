/**
 * Batch-resolve whether notification deep-links still point at existing entities.
 * Used by GET /api/notifications, SSE stream, and SSR prefetch — two IN queries max.
 */

import { prisma } from "@/lib/prisma";
import { parseNotificationLinkTarget } from "@/lib/notification-link";
import { serializeNotificationRow } from "@/lib/serialize-notification-row";
import type { Notification } from "@/types/notification";

export type NotificationRowWithLink = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: Date;
  link: string | null;
};

export type EnrichedNotificationRow = NotificationRowWithLink & {
  link_valid: boolean;
};

/** True when UI may render a navigable View / Open link control. */
export function resolveNotificationLinkValid(
  link: string | null | undefined,
  existingAppointmentIds: ReadonlySet<string>,
  existingInvoiceIds: ReadonlySet<string>,
  existingPatientIds: ReadonlySet<string>
): boolean {
  const trimmed = link?.trim();
  if (!trimmed) return false;

  const target = parseNotificationLinkTarget(trimmed);

  switch (target.kind) {
    case "appointment":
      return Boolean(target.id && existingAppointmentIds.has(target.id));
    case "invoice":
      return Boolean(target.id && existingInvoiceIds.has(target.id));
    case "patient":
      return Boolean(target.id && existingPatientIds.has(target.id));
    case "static":
      return true;
    case "unknown":
      return true;
    default:
      return false;
  }
}

/** Attach `link_valid` to each row using batched existence checks. */
export async function enrichNotificationsWithLinkValidity(
  rows: NotificationRowWithLink[]
): Promise<EnrichedNotificationRow[]> {
  if (!rows.length) return [];

  const appointmentIds = new Set<string>();
  const invoiceIds = new Set<string>();
  const patientIds = new Set<string>();

  for (const row of rows) {
    const target = parseNotificationLinkTarget(row.link);
    if (target.kind === "appointment" && target.id) appointmentIds.add(target.id);
    if (target.kind === "invoice" && target.id) invoiceIds.add(target.id);
    if (target.kind === "patient" && target.id) patientIds.add(target.id);
  }

  const [appointments, invoices, patients] = await Promise.all([
    appointmentIds.size
      ? prisma.appointment.findMany({
          where: { id: { in: [...appointmentIds] } },
          select: { id: true },
        })
      : Promise.resolve([]),
    invoiceIds.size
      ? prisma.invoice.findMany({
          where: { id: { in: [...invoiceIds] } },
          select: { id: true },
        })
      : Promise.resolve([]),
    patientIds.size
      ? prisma.patient.findMany({
          where: { id: { in: [...patientIds] } },
          select: { id: true },
        })
      : Promise.resolve([]),
  ]);

  const existingAppointments = new Set(appointments.map((a) => a.id));
  const existingInvoices = new Set(invoices.map((i) => i.id));
  const existingPatients = new Set(patients.map((p) => p.id));

  return rows.map((row) => ({
    ...row,
    link_valid: resolveNotificationLinkValid(
      row.link,
      existingAppointments,
      existingInvoices,
      existingPatients
    ),
  }));
}

/** Shared list path for GET /api/notifications, SSE batches, and SSR prefetch. */
export async function listEnrichedNotificationsForUser(userId: string): Promise<{
  notifications: Notification[];
  total: number;
  unreadCount: number;
}> {
  const [rows, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: [{ read: "asc" }, { created_at: "desc" }],
      take: 50,
    }),
    prisma.notification.count({ where: { user_id: userId } }),
    prisma.notification.count({
      where: { user_id: userId, read: false },
    }),
  ]);

  const enriched = await enrichNotificationsWithLinkValidity(rows);

  return {
    notifications: enriched.map(serializeNotificationRow),
    total,
    unreadCount,
  };
}
