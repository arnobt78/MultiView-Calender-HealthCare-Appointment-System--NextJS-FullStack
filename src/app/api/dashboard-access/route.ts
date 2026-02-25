/**
 * Dashboard Access API (Prisma)
 * GET: List dashboard access where user is owner, invited user, or invited by email
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

function serializeDashboardAccess(d: {
  id: string;
  created_at: Date;
  owner_user_id: string;
  invited_user_id: string | null;
  invited_email: string | null;
  status: string | null;
  invitation_token: string | null;
  permission: string | null;
  invited_by_id: string | null;
}) {
  return {
    ...d,
    created_at: d.created_at?.toISOString?.(),
    invited_by: d.invited_by_id,
  };
}

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;

    const where: {
      OR: Array<
        | { owner_user_id: string }
        | { invited_user_id: string }
        | { invited_email: string }
      >;
      status?: string;
    } = {
      OR: [
        { owner_user_id: sessionUser.userId },
        { invited_user_id: sessionUser.userId },
        { invited_email: sessionUser.email ?? "" },
      ],
    };
    if (status) where.status = status;

    const records = await prisma.dashboardAccess.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      dashboard_access: records.map(serializeDashboardAccess),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error fetching dashboard access:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
