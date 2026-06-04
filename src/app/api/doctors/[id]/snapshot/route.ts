/**
 * Doctor aggregate: recent appointments where user is owner or treating physician.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { getUserRole } from "@/lib/rbac";
import { canViewDoctorPortalProfile } from "@/lib/doctor-access";
import { loadDoctorSnapshotData } from "@/lib/doctor-snapshot-data";

/** Per-request snapshot — literal required (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid doctor ID" }, { status: 400 });
    }

    const role = await getUserRole(sessionUser.userId);
    const canView = await canViewDoctorPortalProfile(
      { userId: sessionUser.userId, email: sessionUser.email, role },
      id
    );
    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const snapshot = await loadDoctorSnapshotData(id);
    if (!snapshot) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json(snapshot);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
