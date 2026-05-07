import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest, context: RouteContext) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid dashboard invitation ID" }, { status: 400 });
  }

  // Only return permission for rows the caller is party to (owner, invitee, or inviter).
  const access = await prisma.dashboardAccess.findFirst({
    where: {
      id,
      OR: [
        { owner_user_id: sessionUser.userId },
        { invited_user_id: sessionUser.userId },
        { invited_by_id: sessionUser.userId },
        { invited_email: sessionUser.email },
      ],
    },
    select: { permission: true, id: true },
  });
  if (!access) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ permission: access.permission ?? "read", id: access.id });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id || !UUID_RE.test(id)) {
      return NextResponse.json({ error: "Invalid dashboard invitation ID" }, { status: 400 });
    }

    // Scope deletion to rows the caller owns or created — prevents arbitrary row removal.
    const result = await prisma.dashboardAccess.deleteMany({
      where: {
        id,
        OR: [
          { owner_user_id: sessionUser.userId },
          { invited_by_id: sessionUser.userId },
        ],
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
