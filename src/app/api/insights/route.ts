/**
 * GET /api/insights
 *
 * Returns appointment analytics for the current user.
 * Role-based scoping:
 *   - doctor role: data filtered to own appointments (owner_id = userId)
 *   - admin/secretary: global data across all appointments (full picture)
 *   - ?scope=own query param forces own-scope regardless of role (admin viewing own stats)
 *
 * Delegates to getInsightsData() which accepts an optional `ownOnly` flag.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getInsightsData } from "@/lib/insights-data";
import { getUserRole, isDoctorRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scopeParam = searchParams.get("scope");

    const role = await getUserRole(sessionUser.userId);
    // Doctors always see their own data; other roles see global unless scope=own is passed
    const ownOnly = isDoctorRole(role) || scopeParam === "own";

    const data = await getInsightsData(sessionUser.userId, { ownOnly });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Insights error:", error);
    return NextResponse.json({ error: "Failed to load insights" }, { status: 500 });
  }
}
