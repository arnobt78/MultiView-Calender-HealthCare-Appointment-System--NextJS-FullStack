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
    // Verify cron secret (optional security layer)
    const cronSecret = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;
    
    if (expectedSecret && cronSecret !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000";

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
            link: "/",
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
                link: "/",
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
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Cron reminders error:", error);
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}
