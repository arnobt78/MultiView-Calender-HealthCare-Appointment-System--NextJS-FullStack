/**
 * Shared appointment PUT/PATCH write helpers — cancel RBAC, status fields, notify fan-out.
 */

import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AppointmentAccessSession } from "@/lib/appointment-access";
import { resolveAppointmentAccess } from "@/lib/appointment-access";
import {
  canCancelAppointment,
  type AppointmentCancelRow,
} from "@/lib/appointment-cancel-access";
import {
  notifyAppointmentCancelled,
  notifyAppointmentStatusChanged,
} from "@/lib/appointment-notify";

export type AppointmentWriteAccessRow = AppointmentCancelRow & {
  status: string | null;
};

export type AppointmentWriteAccessError = {
  status: 404 | 409;
  message: string;
};

/** Load row needed for cancel vs mutate access checks. */
export async function loadAppointmentAccessRow(
  appointmentId: string,
  client: PrismaClient = prisma
): Promise<AppointmentWriteAccessRow | null> {
  return client.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      status: true,
      owner_id: true,
      treating_physician_id: true,
      assignees: {
        select: {
          user_id: true,
          invited_email: true,
          status: true,
          permission: true,
        },
      },
    },
  });
}

export function isCancelStatusRequest(body: { status?: unknown }): boolean {
  return body.status === "cancelled";
}

/** Returns null when allowed; otherwise HTTP error payload for route handlers. */
export async function assertAppointmentWriteAccess(
  session: AppointmentAccessSession,
  appointmentId: string,
  body: { status?: unknown },
  accessRow: AppointmentWriteAccessRow
): Promise<AppointmentWriteAccessError | null> {
  if (isCancelStatusRequest(body)) {
    if (
      !canCancelAppointment(session, {
        owner_id: accessRow.owner_id,
        treating_physician_id: accessRow.treating_physician_id,
        assignees: accessRow.assignees,
      })
    ) {
      return { status: 404, message: "Appointment not found or unauthorized" };
    }
    if (accessRow.status === "done" || accessRow.status === "cancelled") {
      return {
        status: 409,
        message: "Cannot cancel a completed or already cancelled appointment",
      };
    }
    return null;
  }

  const { level } = await resolveAppointmentAccess(session, appointmentId);
  if (level !== "mutate") {
    return { status: 404, message: "Appointment not found or unauthorized" };
  }
  return null;
}

/** Apply cancel audit fields when status transitions to cancelled. */
export function applyAppointmentStatusFields(
  data: Record<string, unknown>,
  body: { status?: unknown },
  actorUserId: string
): void {
  if (body.status === undefined) return;
  data.status = body.status ?? null;
  if (body.status === "cancelled") {
    data.cancelled_at = new Date();
    data.cancelled_by_id = actorUserId;
  }
}

/** Reschedule clears reminder dedupe so cron can fire again for the new window. */
export function applyReminderSentAtClearOnStart(
  data: Record<string, unknown>,
  body: { start?: unknown }
): void {
  if (body.start !== undefined) {
    data.reminder_sent_at = null;
  }
}

/** Multi-party notify after successful status write — fire-and-forget. */
export function fireAppointmentStatusNotifications(opts: {
  appointmentId: string;
  actorUserId: string;
  previousStatus?: string | null;
  newStatus: string | null | undefined;
  requestedStatus?: unknown;
}): void {
  const { appointmentId, actorUserId, previousStatus, newStatus, requestedStatus } = opts;
  if (requestedStatus === undefined || !newStatus || newStatus === previousStatus) return;

  if (newStatus === "cancelled") {
    notifyAppointmentCancelled({ appointmentId, actorUserId });
  } else {
    notifyAppointmentStatusChanged({
      appointmentId,
      actorUserId,
      previousStatus,
      newStatus,
    });
  }
}
