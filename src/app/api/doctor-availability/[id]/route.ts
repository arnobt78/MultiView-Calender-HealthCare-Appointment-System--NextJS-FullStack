/**
 * DELETE /api/doctor-availability/[id] — remove a weekly availability window.
 * Admin may delete any; doctor may delete own windows only.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.doctorAvailability.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const role = await getUserRole(sessionUser.userId);
    if (!isAdminRole(role) && sessionUser.userId !== existing.user_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.doctorAvailability.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
