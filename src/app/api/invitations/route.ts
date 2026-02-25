/**
 * Invitations API (Prisma)
 * POST: Create and send invitation (appointment or dashboard)
 * GET: List all invitations for current user
 */

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sendInvitationEmail } from "@/lib/email";
import { InvitationRequest } from "@/types/invitation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as InvitationRequest;
    const { type, email, resourceId, permission, invitedUserId } = body;

    if (!type || !email || !resourceId || !permission) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const token = uuidv4();

    if (type === "appointment") {
      await prisma.appointmentAssignee.create({
        data: {
          appointment_id: resourceId,
          user_id: invitedUserId ?? null,
          invited_email: email,
          status: "pending",
          invitation_token: token,
          permission,
          invited_by_id: sessionUser.userId,
        },
      });
    } else if (type === "dashboard") {
      await prisma.dashboardAccess.create({
        data: {
          owner_user_id: resourceId,
          invited_user_id: invitedUserId ?? null,
          invited_email: email,
          status: "pending",
          invitation_token: token,
          permission,
          invited_by_id: sessionUser.userId,
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid invitation type" }, { status: 400 });
    }

    const link = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/accept-invitation?token=${token}`;
    await sendInvitationEmail({
      to: email,
      subject: `You are invited to access a ${type}`,
      html: `<p>You have been invited to access a ${type} with ${permission} permission.<br />Click <a href="${link}">here</a> to accept the invitation.</p>`,
    });
    return NextResponse.json({ message: "Invitation sent", token });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = sessionUser.userId;
  const email = sessionUser.email ?? "";

  const [appointmentAssignees, dashboardInvitations] = await Promise.all([
    prisma.appointmentAssignee.findMany({
      where: {
        OR: [
          { user_id: userId },
          { invited_email: email },
          { invited_by_id: userId },
        ],
      },
      include: { appointment: { select: { title: true } } },
      orderBy: { created_at: "desc" },
      take: 100,
    }),
    prisma.dashboardAccess.findMany({
      where: {
        OR: [
          { invited_user_id: userId },
          { invited_email: email },
          { invited_by_id: userId },
        ],
      },
      orderBy: { created_at: "desc" },
    }),
  ]);

  const appointmentInvitations = appointmentAssignees.map((aa) => ({
    id: aa.id,
    created_at: aa.created_at?.toISOString?.(),
    appointment: aa.appointment_id,
    user: aa.user_id,
    user_type: aa.user_type,
    invited_email: aa.invited_email,
    status: aa.status,
    invitation_token: aa.invitation_token,
    permission: aa.permission,
    invited_by: aa.invited_by_id,
    appointment_title: aa.appointment?.title ?? "",
  }));

  const dashboardInvitationsSerialized = dashboardInvitations.map((d) => ({
    id: d.id,
    created_at: d.created_at?.toISOString?.(),
    owner_user_id: d.owner_user_id,
    invited_user_id: d.invited_user_id,
    invited_email: d.invited_email,
    status: d.status,
    invitation_token: d.invitation_token,
    permission: d.permission,
    invited_by: d.invited_by_id,
  }));

  return NextResponse.json({
    appointmentInvitations,
    dashboardInvitations: dashboardInvitationsSerialized,
  });
}
