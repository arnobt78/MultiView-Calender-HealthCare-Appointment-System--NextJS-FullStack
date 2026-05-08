/**
 * Appointment Reminders Cron Endpoint
 * 
 * Sends email reminders for appointments starting in the next 24 hours.
 * Can be triggered by:
 * - Vercel Cron (vercel.json → cron)
 * - External cron service (e.g. cron-job.org)
 * - Manual trigger via GET request with CRON_SECRET header
 * 
 * GET /api/cron/reminders
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";
import { appointmentReminderTemplate } from "@/lib/email-templates";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret.
    // In production: fail-closed — always require a configured CRON_SECRET.
    // In development: skip check when CRON_SECRET is unset (local convenience).
    const cronSecret = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;
    const isProd = process.env.NODE_ENV === "production";

    if (isProd && !expectedSecret) {
      // Misconfigured production deployment — reject all calls.
      console.error("CRON_SECRET is not set in production. Rejecting cron request.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (expectedSecret && cronSecret !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /*
     * Storage retention policy for notification table.
     * Keeps DB growth controlled without removing unread items.
     * Override via NOTIFICATION_RETENTION_DAYS (default 30).
     */
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

    // Find appointments starting within the next 24 hours
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        start: {
          gte: now,
          lte: in24Hours,
        },
        status: {
          not: "done",
        },
      },
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

    // Explicit priority: NEXT_PUBLIC_APP_URL → VERCEL_URL → localhost.
    // Previously used `||` + `?:` in one expression which caused operator-precedence
    // ambiguity: a truthy NEXT_PUBLIC_APP_URL still picked the VERCEL_URL branch,
    // producing `https://undefined` when VERCEL_URL was unset.
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    for (const appt of upcomingAppointments) {
      const appointmentDate = format(new Date(appt.start), "dd.MM.yyyy");
      const appointmentTime = `${format(new Date(appt.start), "HH:mm")} – ${format(new Date(appt.end), "HH:mm")}`;

      // Send reminder to owner
      if (appt.owner?.email) {
        try {
          const template = appointmentReminderTemplate({
            recipientName: appt.owner.display_name || appt.owner.email,
            appointmentTitle: appt.title,
            appointmentDate,
            appointmentTime,
            location: appt.location || undefined,
            dashboardUrl: `${baseUrl}/`,
          });

          await sendReminderEmail({
            to: appt.owner.email,
            subject: template.subject,
            html: template.html,
          });
          emailsSent++;
        } catch (err) {
          console.error(`Failed to send reminder to ${appt.owner.email}:`, err);
        }
      }

      // Create in-app notification for owner
      try {
        await prisma.notification.create({
          data: {
            user_id: appt.user_id,
            title: "Upcoming Appointment",
            message: `"${appt.title}" starts ${appointmentDate} at ${appointmentTime}`,
            type: "reminder",
            // Deep-link reminder to the exact appointment detail.
            link: `/control-panel/appointments/${appt.id}`,
          },
        });
        notificationsCreated++;
      } catch (err) {
        console.error(`Failed to create notification for ${appt.user_id}:`, err);
      }

      // Send reminders to assignees with accepted status
      for (const assignee of appt.assignees) {
        if (assignee.status === "accepted" && assignee.user?.email) {
          try {
            const template = appointmentReminderTemplate({
              recipientName: assignee.user.display_name || assignee.user.email,
              appointmentTitle: appt.title,
              appointmentDate,
              appointmentTime,
              location: appt.location || undefined,
              dashboardUrl: `${baseUrl}/`,
            });

            await sendReminderEmail({
              to: assignee.user.email,
              subject: template.subject,
              html: template.html,
            });
            emailsSent++;
          } catch (err) {
            console.error(`Failed to send reminder to assignee ${assignee.user.email}:`, err);
          }
        }

        // Create in-app notification for assignee
        if (assignee.user_id) {
          try {
            await prisma.notification.create({
              data: {
                user_id: assignee.user_id,
                title: "Upcoming Appointment",
                message: `"${appt.title}" starts ${appointmentDate} at ${appointmentTime}`,
                type: "reminder",
                // Deep-link reminder to the exact appointment detail.
                link: `/control-panel/appointments/${appt.id}`,
              },
            });
            notificationsCreated++;
          } catch (err) {
            console.error(`Failed to create notification for assignee ${assignee.user_id}:`, err);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      appointmentsFound: upcomingAppointments.length,
      emailsSent,
      notificationsCreated,
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
