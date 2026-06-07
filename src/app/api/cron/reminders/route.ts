/**
 * Appointment Reminders Cron Endpoint
 *
 * Sends email/SMS reminders for appointments starting in the next 24 hours.
 * Vercel schedule: vercel.json → crons → `/api/cron/reminders` (daily 07:00 UTC).
 *
 * Dedupes via `reminder_sent_at`; excludes done/cancelled; notifies patients.
 *
 * GET /api/cron/reminders
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";
import { appointmentReminderTemplate } from "@/lib/email-templates";
import { format } from "date-fns";
import { appointmentNotificationLink } from "@/lib/entity-routes";
import { buildReminderCandidatesWhere } from "@/lib/cron-reminder-candidates";
import { sendBrevoSms } from "@/lib/brevo-sms";
import { resolveReminderSmsPhone } from "@/lib/reminder-recipient-phone";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const cronSecret = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;
    const isProd = process.env.NODE_ENV === "production";

    if (isProd && !expectedSecret) {
      console.error("CRON_SECRET is not set in production. Rejecting cron request.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (expectedSecret && cronSecret !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const retentionDays = Number(process.env.NOTIFICATION_RETENTION_DAYS ?? "30");
    const retentionCutoff = new Date(Date.now() - Math.max(retentionDays, 1) * 24 * 60 * 60 * 1000);
    const cleanup = await prisma.notification.deleteMany({
      where: {
        read: true,
        created_at: { lt: retentionCutoff },
      },
    });

    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingAppointments = await prisma.appointment.findMany({
      where: buildReminderCandidatesWhere({ now, in24Hours }),
      include: {
        owner: true,
        patient: true,
        assignees: {
          include: {
            user: true,
          },
        },
      },
    });

    let emailsSent = 0;
    let notificationsCreated = 0;
    let smsSent = 0;

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    for (const appt of upcomingAppointments) {
      const appointmentDate = format(new Date(appt.start), "dd.MM.yyyy");
      const appointmentTime = `${format(new Date(appt.start), "HH:mm")} – ${format(new Date(appt.end), "HH:mm")}`;
      let batchOk = true;

      const sendReminderTo = async (opts: {
        email?: string | null;
        name?: string | null;
        userId?: string | null;
        role?: string | null;
        phone?: string | null;
        dashboardUrl: string;
      }) => {
        if (opts.email) {
          try {
            const template = appointmentReminderTemplate({
              recipientName: opts.name || opts.email,
              appointmentTitle: appt.title,
              appointmentDate,
              appointmentTime,
              location: appt.location || undefined,
              dashboardUrl: opts.dashboardUrl,
            });
            await sendReminderEmail({
              to: opts.email,
              subject: template.subject,
              html: template.html,
            });
            emailsSent++;
          } catch (err: unknown) {
            batchOk = false;
            console.error(`Failed to send reminder to ${opts.email}:`, err);
          }
        }

        if (opts.userId) {
          try {
            await prisma.notification.create({
              data: {
                user_id: opts.userId,
                title: "Upcoming Appointment",
                message: `"${appt.title}" starts ${appointmentDate} at ${appointmentTime}`,
                type: "reminder",
                link: appointmentNotificationLink(opts.role ?? "doctor", appt.id),
              },
            });
            notificationsCreated++;
          } catch (err: unknown) {
            batchOk = false;
            console.error(`Failed to create notification for ${opts.userId}:`, err);
          }
        }

        const phone = opts.phone?.trim();
        if (phone) {
          const smsBody = `Reminder: "${appt.title}" on ${appointmentDate} at ${format(new Date(appt.start), "HH:mm")}.`;
          const sent = await sendBrevoSms({ to: phone, content: smsBody }).catch(() => false);
          if (sent) smsSent++;
        }
      };

      const ownerUrl = `${baseUrl}${appointmentNotificationLink(appt.owner?.role ?? "doctor", appt.id)}`;

      if (appt.owner?.email || appt.owner_id) {
        await sendReminderTo({
          email: appt.owner?.email,
          name: appt.owner?.display_name,
          userId: appt.owner_id,
          role: appt.owner?.role,
          phone: appt.owner?.phone,
          dashboardUrl: ownerUrl,
        });
      }

      const patientEmail = appt.patient?.email?.trim();
      if (patientEmail) {
        const patientUser = await prisma.user.findFirst({
          where: { email: patientEmail },
          select: { id: true, email: true, display_name: true, role: true, phone: true },
        });
        const patientName = appt.patient
          ? `${appt.patient.firstname} ${appt.patient.lastname}`.trim()
          : patientEmail;
        const patientUrl = `${baseUrl}${appointmentNotificationLink(
          patientUser?.role ?? "patient",
          appt.id
        )}`;
        await sendReminderTo({
          email: patientEmail,
          name: patientName,
          userId: patientUser?.id,
          role: patientUser?.role ?? "patient",
          phone: resolveReminderSmsPhone({
            patientUser: patientUser,
            patientRecord: appt.patient,
          }),
          dashboardUrl: patientUrl,
        });
      }

      for (const assignee of appt.assignees) {
        if (assignee.status !== "accepted") continue;
        const assigneeUrl = `${baseUrl}${appointmentNotificationLink(
          assignee.user?.role ?? "doctor",
          appt.id
        )}`;
        await sendReminderTo({
          email: assignee.user?.email,
          name: assignee.user?.display_name,
          userId: assignee.user_id,
          role: assignee.user?.role,
          phone: assignee.user?.phone,
          dashboardUrl: assigneeUrl,
        });
      }

      if (batchOk) {
        await prisma.appointment.update({
          where: { id: appt.id },
          data: { reminder_sent_at: now },
        });
      }
    }

    return NextResponse.json({
      success: true,
      appointmentsFound: upcomingAppointments.length,
      emailsSent,
      notificationsCreated,
      smsSent,
      notificationsCleaned: cleanup.count,
      retentionDays: Math.max(retentionDays, 1),
      timestamp: now.toISOString(),
    });
  } catch (error: unknown) {
    console.error("Cron reminders error:", error);
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}
