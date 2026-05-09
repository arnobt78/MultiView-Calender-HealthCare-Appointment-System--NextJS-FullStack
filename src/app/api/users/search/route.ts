import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isPatientRole } from "@/lib/rbac";
import { PAGINATION, VALIDATION } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query") || "";
    const rawLimit = Number.parseInt(searchParams.get("limit") ?? PAGINATION.DEFAULT_LIMIT.toString(), 10);

    if (searchQuery.length < VALIDATION.MIN_SEARCH_QUERY_LENGTH) {
      return NextResponse.json({
        error: `Search query must be at least ${VALIDATION.MIN_SEARCH_QUERY_LENGTH} characters`,
      }, { status: 400 });
    }
    if (searchQuery.length > VALIDATION.MAX_SEARCH_QUERY_LENGTH) {
      return NextResponse.json({
        error: `Search query too long (max ${VALIDATION.MAX_SEARCH_QUERY_LENGTH} characters)`,
      }, { status: 400 });
    }

    // Patients must not enumerate the global user directory.
    const callerRole = await getUserRole(sessionUser.userId);
    if (isPatientRole(callerRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Guard against NaN from parseInt on non-numeric query strings.
    const safeLimit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), PAGINATION.MAX_SEARCH_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchQuery);

    let users;
    if (isUUID) {
      users = await prisma.user.findMany({
        where: { id: searchQuery, email_verified: true },
        select: { id: true, email: true, display_name: true },
        take: safeLimit,
      });
    } else {
      users = await prisma.user.findMany({
        where: {
          email_verified: true,
          OR: [
            { email: { contains: searchQuery, mode: "insensitive" } },
            { display_name: { contains: searchQuery, mode: "insensitive" } },
          ],
        },
        select: { id: true, email: true, display_name: true },
        orderBy: [{ display_name: { sort: "asc", nulls: "last" } }, { email: "asc" }],
        take: safeLimit,
      });
    }

    return NextResponse.json({
      users,
      count: users.length,
      limit: safeLimit,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
