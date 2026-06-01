/**
 * Monthly Appointment Cleanup Cron (NOT scheduled in production)
 *
 * Hard-deletes appointments whose `end` is before the 1st of the current month (UTC).
 * Vercel schedule was removed from vercel.json `crons[]` (2026-06-01) so dashboard,
 * insights, revenue, and patient/doctor history stay complete — no soft-delete layer.
 *
 * Disabled entry is preserved in vercel.json `_disabledCrons` for re-enable docs.
 * Manual trigger only (requires CRON_SECRET in production):
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *     https://<your-host>/api/cron/cleanup-appointments
 *
 * GET /api/cron/cleanup-appointments
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret — same pattern as /api/cron/reminders.
    // Production always requires CRON_SECRET; dev skips the check when it is unset.
    const cronSecret = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;
    const isProd = process.env.NODE_ENV === "production";

    if (isProd && !expectedSecret) {
      console.error("CRON_SECRET is not set in production. Rejecting cleanup request.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (expectedSecret && cronSecret !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cutoff = midnight on the 1st of the current month (UTC).
    // Everything whose `end` is strictly before this date is considered past.
    const now = new Date();
    const cutoff = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));

    // Delete related records first to satisfy foreign-key constraints:
    //   AppointmentAssignee, Notification links → then Appointment itself.
    const expiredAppointments = await prisma.appointment.findMany({
      where: { end: { lt: cutoff } },
      select: { id: true },
    });

    const expiredIds = expiredAppointments.map((a) => a.id);

    if (expiredIds.length === 0) {
      return NextResponse.json({
        success: true,
        deleted: 0,
        cutoff: cutoff.toISOString(),
        message: "No expired appointments to clean up.",
      });
    }

    // Remove assignee rows linked to the expired appointments.
    await prisma.appointmentAssignee.deleteMany({
      where: { appointment_id: { in: expiredIds } },
    });

    // Nullify notification deep-links that pointed to deleted appointments
    // rather than deleting notifications (users may still want to read them).
    const staleLinks = expiredIds.flatMap((id) => [
      `/control-panel/appointments/${id}`,
      `/appointments/${id}`,
    ]);
    await prisma.notification.updateMany({
      where: { link: { in: staleLinks } },
      data: { link: "/dashboard" },
    });

    // Finally delete the appointments themselves.
    const { count } = await prisma.appointment.deleteMany({
      where: { id: { in: expiredIds } },
    });

    console.log(`[cleanup-appointments] Deleted ${count} expired appointments before ${cutoff.toISOString()}`);

    return NextResponse.json({
      success: true,
      deleted: count,
      cutoff: cutoff.toISOString(),
      timestamp: now.toISOString(),
    });
  } catch (error: unknown) {
    console.error("Cron cleanup-appointments error:", error);
    return NextResponse.json(
      { error: "Failed to run appointment cleanup" },
      { status: 500 }
    );
  }
}
