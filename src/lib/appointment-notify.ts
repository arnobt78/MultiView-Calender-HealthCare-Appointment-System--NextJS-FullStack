/**
 * Multi-party in-app + email notifications for appointment cancel / status change.
 * Fire-and-forget — never blocks API responses.
 */

import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  appointmentCancelledTemplate,
  appointmentStatusChangedTemplate,
} from "@/lib/email-templates";
import { appointmentNotificationLink } from "@/lib/entity-routes";
import { resolveAppointmentStatusMeta } from "@/lib/appointment-status-display";

type Recipient = {
  userId?: string | null;
  email?: string | null;
  name?: string | null;
  role?: string | null;
};

function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

function pushRecipient(map: Map<string, Recipient>, r: Recipient): void {
  const email = r.email?.trim().toLowerCase();
  const key = r.userId ?? email;
  if (!key) return;
  if (map.has(key)) return;
  map.set(key, {
    userId: r.userId ?? undefined,
    email: email ?? undefined,
    name: r.name ?? undefined,
    role: r.role ?? undefined,
  });
}

async function loadAppointmentNotifyContext(appointmentId: string) {
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      id: true,
      title: true,
      start: true,
      end: true,
      location: true,
      status: true,
      owner_id: true,
      owner: { select: { id: true, email: true, display_name: true, role: true } },
      treating_physician: {
        select: { id: true, email: true, display_name: true, role: true },
      },
      patient: { select: { email: true, firstname: true, lastname: true } },
      assignees: {
        where: { status: "accepted" },
        select: {
          user_id: true,
          user: { select: { id: true, email: true, display_name: true, role: true } },
        },
      },
    },
  });
}

async function collectRecipients(
  appointmentId: string,
  actorUserId: string
): Promise<{ appt: NonNullable<Awaited<ReturnType<typeof loadAppointmentNotifyContext>>>; recipients: Recipient[] } | null> {
  const appt = await loadAppointmentNotifyContext(appointmentId);
  if (!appt) return null;

  const map = new Map<string, Recipient>();

  if (appt.owner) {
    pushRecipient(map, {
      userId: appt.owner.id,
      email: appt.owner.email,
      name: appt.owner.display_name,
      role: appt.owner.role,
    });
  }

  if (appt.treating_physician) {
    pushRecipient(map, {
      userId: appt.treating_physician.id,
      email: appt.treating_physician.email,
      name: appt.treating_physician.display_name,
      role: appt.treating_physician.role,
    });
  }

  for (const row of appt.assignees) {
    if (row.user) {
      pushRecipient(map, {
        userId: row.user.id,
        email: row.user.email,
        name: row.user.display_name,
        role: row.user.role,
      });
    }
  }

  const patientEmail = appt.patient?.email?.trim();
  if (patientEmail) {
    const patientUser = await prisma.user.findFirst({
      where: { email: patientEmail },
      select: { id: true, email: true, display_name: true, role: true },
    });
    if (patientUser) {
      pushRecipient(map, {
        userId: patientUser.id,
        email: patientUser.email,
        name: patientUser.display_name,
        role: patientUser.role,
      });
    } else {
      pushRecipient(map, {
        email: patientEmail,
        name: appt.patient
          ? `${appt.patient.firstname} ${appt.patient.lastname}`.trim()
          : undefined,
        role: "patient",
      });
    }
  }

  // Always include actor if not already present (staff self-audit).
  if (actorUserId) {
    const actor = await prisma.user.findUnique({
      where: { id: actorUserId },
      select: { id: true, email: true, display_name: true, role: true },
    });
    if (actor) {
      pushRecipient(map, {
        userId: actor.id,
        email: actor.email,
        name: actor.display_name,
        role: actor.role,
      });
    }
  }

  return { appt, recipients: [...map.values()] };
}

async function notifyRecipients(opts: {
  appointmentId: string;
  actorUserId: string;
  title: string;
  message: string;
  emailSubject: string;
  emailHtml: (recipientName: string, detailUrl: string) => string;
}): Promise<void> {
  const ctx = await collectRecipients(opts.appointmentId, opts.actorUserId);
  if (!ctx) return;

  const dateLabel = format(new Date(ctx.appt.start), "dd.MM.yyyy");
  const timeLabel = `${format(new Date(ctx.appt.start), "HH:mm")} – ${format(new Date(ctx.appt.end), "HH:mm")}`;
  const enrichedMessage = `${opts.message} — ${dateLabel} ${timeLabel}`;

  for (const r of ctx.recipients) {
    const role = r.role ?? "doctor";
    const link = appointmentNotificationLink(role, ctx.appt.id);
    const detailUrl = `${baseUrl()}${link}`;

    if (r.userId) {
      try {
        await prisma.notification.create({
          data: {
            user_id: r.userId,
            title: opts.title,
            message: enrichedMessage,
            type: "status_update",
            link,
          },
        });
      } catch {
        /* non-critical */
      }
    }

    if (r.email) {
      try {
        await sendEmail({
          to: r.email,
          subject: opts.emailSubject,
          html: opts.emailHtml(r.name ?? r.email, detailUrl),
        });
      } catch {
        /* best-effort */
      }
    }
  }
}

export function notifyAppointmentCancelled(opts: {
  appointmentId: string;
  actorUserId: string;
}): void {
  void notifyAppointmentCancelledAsync(opts);
}

async function notifyAppointmentCancelledAsync(opts: {
  appointmentId: string;
  actorUserId: string;
}): Promise<void> {
  const ctx = await loadAppointmentNotifyContext(opts.appointmentId);
  if (!ctx) return;

  const title = "Appointment cancelled";
  const message = `"${ctx.title}" was cancelled`;

  await notifyRecipients({
    appointmentId: opts.appointmentId,
    actorUserId: opts.actorUserId,
    title,
    message,
    emailSubject: `HealthCal Pro — ${title}`,
    emailHtml: (recipientName, detailUrl) =>
      appointmentCancelledTemplate({
        recipientName,
        appointmentTitle: ctx.title,
        appointmentDate: format(new Date(ctx.start), "dd.MM.yyyy"),
        appointmentTime: `${format(new Date(ctx.start), "HH:mm")} – ${format(new Date(ctx.end), "HH:mm")}`,
        location: ctx.location ?? undefined,
        detailUrl,
      }).html,
  });
}

export function notifyAppointmentStatusChanged(opts: {
  appointmentId: string;
  actorUserId: string;
  previousStatus?: string | null;
  newStatus: string;
}): void {
  void notifyAppointmentStatusChangedAsync(opts);
}

async function notifyAppointmentStatusChangedAsync(opts: {
  appointmentId: string;
  actorUserId: string;
  previousStatus?: string | null;
  newStatus: string;
}): Promise<void> {
  if (opts.newStatus === "cancelled") {
    await notifyAppointmentCancelledAsync({
      appointmentId: opts.appointmentId,
      actorUserId: opts.actorUserId,
    });
    return;
  }

  const ctx = await loadAppointmentNotifyContext(opts.appointmentId);
  if (!ctx) return;

  const label = resolveAppointmentStatusMeta(opts.newStatus).label;
  const title = "Appointment status updated";
  const message = `"${ctx.title}" is now ${label}`;

  await notifyRecipients({
    appointmentId: opts.appointmentId,
    actorUserId: opts.actorUserId,
    title,
    message,
    emailSubject: `HealthCal Pro — ${title}`,
    emailHtml: (recipientName, detailUrl) =>
      appointmentStatusChangedTemplate({
        recipientName,
        appointmentTitle: ctx.title,
        statusLabel: label,
        appointmentDate: format(new Date(ctx.start), "dd.MM.yyyy"),
        appointmentTime: `${format(new Date(ctx.start), "HH:mm")} – ${format(new Date(ctx.end), "HH:mm")}`,
        detailUrl,
      }).html,
  });
}
