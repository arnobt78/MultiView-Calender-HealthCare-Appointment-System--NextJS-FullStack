/**
 * GET /api/insights
 *
 * Role-based appointment analytics with scope controls:
 *   scope=personal|organization
 *   doctorId=uuid (admin drill-down — same metrics as that doctor's personal view)
 *
 * Delegates to getInsightsData() via resolveInsightsDataOptions() in insights-scope.ts.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getInsightsData } from "@/lib/insights-data";
import { fetchInsightsWithRedisCache } from "@/lib/insights/insights-redis-cache";
import { getUserRole, isDoctorRole, isStaffRole } from "@/lib/rbac";
import {
  parseInsightsQueryFromSearchParams,
  resolveInsightsDataOptions,
} from "@/lib/insights-scope";
import { isValidUUID } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    if (!isStaffRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const rawDoctorId = searchParams.get("doctorId")?.trim();
    if (rawDoctorId && !isValidUUID(rawDoctorId)) {
      return NextResponse.json({ error: "Invalid doctorId" }, { status: 400 });
    }

    let query = parseInsightsQueryFromSearchParams(searchParams, role);
    let filter = query;

    if (isDoctorRole(role)) {
      if (query.scope === "organization") {
        filter = { scope: "organization", period: query.period };
      } else {
        filter = { scope: "personal", period: query.period };
      }
      if (searchParams.get("doctorId")) {
        const requested = searchParams.get("doctorId")!.trim();
        if (requested !== sessionUser.userId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }

    if (isStaffRole(role) && filter.doctorId) {
      if (!isValidUUID(filter.doctorId)) {
        return NextResponse.json({ error: "Invalid doctorId" }, { status: 400 });
      }
      const doctorUser = await prisma.user.findUnique({
        where: { id: filter.doctorId },
        select: { role: true },
      });
      if (!doctorUser || doctorUser.role !== "doctor") {
        return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
      }
    }

    const dataOptions = resolveInsightsDataOptions(sessionUser.userId, filter, role);

    const { data, cacheHit } = await fetchInsightsWithRedisCache(
      sessionUser.userId,
      filter,
      () =>
        getInsightsData(sessionUser.userId, {
          ...dataOptions,
          period: filter.period,
        })
    );
    return NextResponse.json(data, {
      headers: cacheHit ? { "X-Cache": "HIT" } : undefined,
    });
  } catch (error: unknown) {
    console.error("Insights error:", error);
    return NextResponse.json({ error: "Failed to load insights" }, { status: 500 });
  }
}
