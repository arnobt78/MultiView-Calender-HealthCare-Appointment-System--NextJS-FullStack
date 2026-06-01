/**
 * GET /api/billing/appointment-options — recent visits for invoice create picker (admin | doctor).
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole, isDoctorRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PAGINATION } from "@/lib/constants";
import { isValidUUID } from "@/lib/validation";

export const dynamic = "force-dynamic";

const PICKER_LIMIT = 40;

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";

    if (!isAdminRole(role) && !isDoctorRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchFilter =
      search.length > 0
        ? isValidUUID(search)
          ? { id: search }
          : {
              title: { contains: search, mode: "insensitive" as const },
            }
        : {};

    const where = isAdminRole(role)
      ? searchFilter
      : {
          AND: [
            searchFilter,
            {
              OR: [
                { owner_id: sessionUser.userId },
                { treating_physician_id: sessionUser.userId },
              ],
            },
          ],
        };

    const rows = await prisma.appointment.findMany({
      where,
      orderBy: { start: "desc" },
      take: Math.min(PICKER_LIMIT, PAGINATION.MAX_LIMIT),
      select: {
        id: true,
        title: true,
        start: true,
        end: true,
        owner_id: true,
        patient: { select: { firstname: true, lastname: true, email: true } },
      },
    });

    const options = rows.map((row) => ({
      id: row.id,
      title: row.title,
      start: row.start.toISOString(),
      end: row.end.toISOString(),
      owner_id: row.owner_id,
      patient_label:
        [row.patient?.firstname, row.patient?.lastname].filter(Boolean).join(" ").trim() ||
        row.patient?.email?.trim() ||
        "Patient",
    }));

    return NextResponse.json({ options });
  } catch (error: unknown) {
    console.error("billing/appointment-options error:", error);
    return NextResponse.json({ error: "Failed to load appointments" }, { status: 500 });
  }
}
