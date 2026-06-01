/**
 * GET /api/billing/appointment-options — visits for invoice create (admin | doctor).
 * Default: only visits without a blocking invoice. Admin `includeBilled=1` adds disabled rows.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole, isDoctorRole } from "@/lib/rbac";
import { fetchBillingAppointmentOptions } from "@/lib/billing-appointment-options-load";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    if (!isAdminRole(role) && !isDoctorRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
    const includeBilled = req.nextUrl.searchParams.get("includeBilled") === "1";

    const options = await fetchBillingAppointmentOptions({
      sessionUserId: sessionUser.userId,
      role,
      search,
      includeBilled,
    });

    return NextResponse.json({ options });
  } catch (error: unknown) {
    console.error("billing/appointment-options error:", error);
    return NextResponse.json({ error: "Failed to load appointments" }, { status: 500 });
  }
}
