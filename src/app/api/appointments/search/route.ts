import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
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

    // Guard against NaN from parseInt on non-numeric input.
    const safeLimit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), PAGINATION.MAX_SEARCH_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;

    let appointments;
    if (isValidUUID(searchQuery)) {
      appointments = await prisma.appointment.findMany({
        where: { owner_id: sessionUser.userId, id: searchQuery },
        select: { id: true, title: true, start: true, end: true, status: true },
        take: safeLimit,
      });
    } else {
      appointments = await prisma.appointment.findMany({
        where: {
          owner_id: sessionUser.userId,
          title: { contains: searchQuery, mode: "insensitive" },
        },
        select: { id: true, title: true, start: true, end: true, status: true },
        orderBy: { start: "desc" },
        take: safeLimit,
      });
    }

    const rows = appointments.map((a) => ({
      id: a.id,
      title: a.title,
      start: a.start?.toISOString?.(),
      end: a.end?.toISOString?.(),
      status: a.status,
    }));

    return NextResponse.json({
      appointments: rows,
      count: rows.length,
      limit: safeLimit,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
