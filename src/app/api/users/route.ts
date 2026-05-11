/**
 * Users list for Control Panel (Prisma)
 * GET: List users (id, email, display_name, role, image, created_at).
 * Query: role=doctor | roles=admin,secretary (comma-separated; roles wins when non-empty).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { PAGINATION } from "@/lib/constants";
import { serializeUser } from "@/lib/serializers";
import { getUserRole, isPatientRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const callerRole = await getUserRole(sessionUser.userId);

    if (isPatientRole(callerRole)) {
      // Patients may only query the doctor list — needed for the "Book Appointment" dialog
      // in the patient portal. All other user enumeration is staff-only.
      const { searchParams: sp } = new URL(req.url);
      const roleParam = sp.get("role");
      const rolesParam = sp.get("roles");
      const isDoctorOnlyQuery =
        (roleParam === "doctor" && !rolesParam) ||
        (!roleParam && rolesParam === "doctor");
      if (!isDoctorOnlyQuery) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") ?? undefined;
    const rolesCsv = searchParams.get("roles") ?? "";
    const rolesList = rolesCsv.split(",").map((r) => r.trim()).filter(Boolean);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") ?? String(PAGINATION.DEFAULT_LIMIT), 10), 1),
      PAGINATION.MAX_LIMIT
    );
    const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10), 0);

    const where =
      rolesList.length > 0 ? { role: { in: rolesList } } : role ? { role } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, display_name: true, role: true, image: true, created_at: true },
        orderBy: [{ display_name: { sort: "asc", nulls: "last" } }, { email: "asc" }],
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map(serializeUser),
      pagination: { limit, offset, total, count: users.length },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
