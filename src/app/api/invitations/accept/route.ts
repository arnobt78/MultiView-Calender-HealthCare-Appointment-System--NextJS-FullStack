/**
 * POST /api/invitations/accept
 *
 * Accepts a pending invitation (appointment or dashboard) identified by `token`.
 *
 * Security: userId is derived exclusively from the verified server-side session —
 * it is NOT trusted from the request body, preventing an attacker who knows a
 * token from binding the invite to an arbitrary user account.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    // Require an authenticated session — reject anonymous callers.
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as { token?: unknown };
    const token = typeof body.token === "string" ? body.token.trim() : null;

    if (!token) {
      return NextResponse.json({ error: "Missing invitation token" }, { status: 400 });
    }

    // Use the session userId — never the client-supplied one.
    const userId = session.userId;

    const appointmentUpdated = await prisma.appointmentAssignee.updateMany({
      where: { invitation_token: token, status: "pending" },
      data: { status: "accepted", user_id: userId },
    });

    if (appointmentUpdated.count > 0) {
      return NextResponse.json({ message: "Appointment invitation accepted" });
    }

    const dashboardUpdated = await prisma.dashboardAccess.updateMany({
      where: { invitation_token: token, status: "pending" },
      data: { status: "accepted", invited_user_id: userId },
    });

    if (dashboardUpdated.count > 0) {
      return NextResponse.json({ message: "Dashboard invitation accepted" });
    }

    return NextResponse.json({ error: "Invalid or already accepted invitation" }, { status: 404 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
