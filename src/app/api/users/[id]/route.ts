/**
 * GET  /api/users/[id] — Single user detail.
 * PATCH /api/users/[id] — Update user role / display_name / image (admin operation).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { serializeUser } from "@/lib/serializers";
import { redis } from "@/lib/redis";
import { getUserRole } from "@/lib/rbac";

type RouteContext = { params: Promise<{ id: string }> };

const USER_SELECT = {
  id: true,
  email: true,
  display_name: true,
  role: true,
  image: true,
  created_at: true,
} as const;

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    if (!isValidUUID(id)) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

    // Allow self-lookup always; admin may look up any user.
    // All other callers are restricted to their own record to prevent email/role enumeration.
    const callerRole = await getUserRole(sessionUser.userId);
    const isSelf = id === sessionUser.userId;
    if (!isSelf && callerRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id }, select: USER_SELECT });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user: serializeUser(user) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    if (!isValidUUID(id)) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

    const body = await req.json() as { role?: unknown; display_name?: unknown; image?: unknown };

    // Type-narrow each field before use — body comes from JSON so values are `unknown`.
    const role = typeof body.role === "string" ? body.role : undefined;
    const display_name = typeof body.display_name === "string" ? body.display_name.trim() : undefined;
    const image = typeof body.image === "string" ? body.image : undefined;

    const ALLOWED_ROLES = ["admin", "doctor", "secretary", "patient"];
    if (role !== undefined && !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const callerRole = await getUserRole(sessionUser.userId);
    const isSelf = id === sessionUser.userId;
    const isAdmin = callerRole === "admin";

    // Role changes require admin privilege — prevents privilege escalation.
    if (role !== undefined && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: only admins may change roles" }, { status: 403 });
    }

    // Profile field updates are allowed for self or admin only.
    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: can only update your own profile" }, { status: 403 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(role !== undefined && { role }),
        ...(display_name !== undefined && { display_name }),
        ...(image !== undefined && { image }),
      },
      select: USER_SELECT,
    });

    /*
     * Bust the server-side Redis overview cache when a user's role is changed.
     * The overview counts doctors (role = "doctor"); a role promotion/demotion
     * must be reflected immediately in the dashboard card.
     */
    if (role !== undefined) {
      void redis.invalidateDashboardOverview(sessionUser.userId);
    }

    return NextResponse.json({ user: serializeUser(user) });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
