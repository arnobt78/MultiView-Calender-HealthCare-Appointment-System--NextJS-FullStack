/**
 * GET /api/admin-portal — admin role only. Delegates to shared admin-portal-load.
 */

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";
import { fetchAdminPortalData } from "@/lib/admin-portal-load";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    if (!isAdminRole(role)) {
      return NextResponse.json({ error: "Forbidden — admin role required" }, { status: 403 });
    }

    const data = await fetchAdminPortalData();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
