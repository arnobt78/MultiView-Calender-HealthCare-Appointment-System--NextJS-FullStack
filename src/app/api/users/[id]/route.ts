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
import { getUserRole, isDoctorRole } from "@/lib/rbac";
import { USER_API_SELECT } from "@/lib/user-api-select";
import { userDetailInclude } from "@/lib/user-api-include";

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

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
      // Doctors may read admin rows for portal `/admins/:id` + snapshot hydration.
      if (!isDoctorRole(callerRole)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const targetRole = await prisma.user.findUnique({
        where: { id },
        select: { role: true },
      });
      if (targetRole?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const user = await prisma.user.findUnique({ where: { id }, include: userDetailInclude });
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

    const body = await req.json() as {
      role?: unknown;
      display_name?: unknown;
      image?: unknown;
      specialty?: unknown;
      bio?: unknown;
      phone?: unknown;
      license_number?: unknown;
      department?: unknown;
      consultation_fee?: unknown;
      office_location?: unknown;
      languages_spoken?: unknown;
      years_of_experience?: unknown;
      is_active?: unknown;
    };

    // Type-narrow each field before use — body comes from JSON so values are `unknown`.
    const role = typeof body.role === "string" ? body.role : undefined;
    const display_name = typeof body.display_name === "string" ? body.display_name.trim() : undefined;
    const image = typeof body.image === "string" ? body.image : undefined;
    // specialty / bio — allow null to clear the field
    const specialty = body.specialty === null ? null : typeof body.specialty === "string" ? body.specialty.trim() || null : undefined;
    const bio = body.bio === null ? null : typeof body.bio === "string" ? body.bio.trim() || null : undefined;
    const phone = body.phone === null ? null : typeof body.phone === "string" ? body.phone.trim() || null : undefined;
    const license_number =
      body.license_number === null
        ? null
        : typeof body.license_number === "string"
          ? body.license_number.trim() || null
          : undefined;
    const department =
      body.department === null
        ? null
        : typeof body.department === "string"
          ? body.department.trim() || null
          : undefined;
    const office_location =
      body.office_location === null
        ? null
        : typeof body.office_location === "string"
          ? body.office_location.trim() || null
          : undefined;
    const consultation_fee =
      body.consultation_fee === null
        ? null
        : typeof body.consultation_fee === "number" && Number.isFinite(body.consultation_fee)
          ? Math.round(body.consultation_fee)
          : undefined;
    const years_of_experience =
      body.years_of_experience === null
        ? null
        : typeof body.years_of_experience === "number" && Number.isFinite(body.years_of_experience)
          ? Math.round(body.years_of_experience)
          : undefined;
    const languages_spoken = Array.isArray(body.languages_spoken)
      ? body.languages_spoken.filter((l): l is string => typeof l === "string")
      : undefined;
    const is_active =
      typeof body.is_active === "boolean" ? body.is_active : undefined;

    const ALLOWED_ROLES = ["admin", "doctor", "patient"];
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

    // is_active toggles require admin — prevents self-deactivation lockout on demo accounts.
    if (is_active !== undefined && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: only admins may change active status" }, { status: 403 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        updated_by_id: sessionUser.userId,
        ...(role !== undefined && { role }),
        ...(display_name !== undefined && { display_name }),
        ...(image !== undefined && { image }),
        ...(specialty !== undefined && { specialty }),
        ...(bio !== undefined && { bio }),
        ...(phone !== undefined && { phone }),
        ...(license_number !== undefined && { license_number }),
        ...(department !== undefined && { department }),
        ...(consultation_fee !== undefined && { consultation_fee }),
        ...(office_location !== undefined && { office_location }),
        ...(languages_spoken !== undefined && { languages_spoken }),
        ...(years_of_experience !== undefined && { years_of_experience }),
        ...(is_active !== undefined && {
          is_active,
          active_since: is_active ? new Date() : null,
        }),
      },
      include: userDetailInclude,
    });

    /*
     * Bust the server-side Redis overview cache when a user's role or active status changes.
     */
    if (role !== undefined || is_active !== undefined) {
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
