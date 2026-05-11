/**
 * Appointment Assignees API (Prisma)
 *
 * GET /api/appointment-assignees
 *   - Without appointment_id: returns all assignee rows for every appointment the
 *     current user owns or has been accepted onto. Used by useAppointments to build
 *     the full assignee list for the calendar in a single round-trip.
 *   - With ?appointment_id=<id>: returns assignees for that single appointment after
 *     verifying the caller owns it or is an accepted assignee on it.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

function serializeAssignee(a: {
  id: string;
  created_at: Date;
  appointment_id: string;
  user_id: string | null;
  user_type: string | null;
  invited_email: string | null;
  status: string | null;
  permission: string | null;
  invited_by_id: string | null;
}) {
  return {
    id: a.id,
    created_at: a.created_at?.toISOString?.(),
    appointment: a.appointment_id,
    user: a.user_id,
    user_type: a.user_type,
    invited_email: a.invited_email,
    status: a.status,
    // invitation_token is intentionally omitted — it is a secret used only in email links.
    permission: a.permission,
    invited_by: a.invited_by_id,
  };
}

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get("appointment_id");

    if (appointmentId) {
      // Per-appointment fetch: verify the caller owns or has accepted access to this appointment.
      const accessible = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          OR: [
            { user_id: sessionUser.userId },
            {
              assignees: {
                some: {
                  OR: [
                    { user_id: sessionUser.userId },
                    { invited_email: sessionUser.email },
                  ],
                  status: "accepted",
                },
              },
            },
          ],
        },
        select: { id: true },
      });

      if (!accessible) {
        return NextResponse.json({ error: "Appointment not found or forbidden" }, { status: 403 });
      }

      const assignees = await prisma.appointmentAssignee.findMany({
        where: { appointment_id: appointmentId },
        orderBy: { created_at: "desc" },
      });

      return NextResponse.json({ assignees: assignees.map(serializeAssignee) });
    }

    // Global fetch (no appointment_id): return all assignees across every appointment
    // the current user owns OR is an accepted participant on. This powers the calendar
    // hook (useAppointments) which joins assignees client-side for each appointment row.
    const accessibleAppointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { user_id: sessionUser.userId },
          {
            assignees: {
              some: {
                OR: [
                  { user_id: sessionUser.userId },
                  { invited_email: sessionUser.email },
                ],
                status: "accepted",
              },
            },
          },
        ],
      },
      select: { id: true },
    });

    const appointmentIds = accessibleAppointments.map((a) => a.id);

    const assignees =
      appointmentIds.length > 0
        ? await prisma.appointmentAssignee.findMany({
            where: { appointment_id: { in: appointmentIds } },
            orderBy: { created_at: "desc" },
          })
        : [];

    return NextResponse.json({ assignees: assignees.map(serializeAssignee) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error fetching appointment assignees:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
