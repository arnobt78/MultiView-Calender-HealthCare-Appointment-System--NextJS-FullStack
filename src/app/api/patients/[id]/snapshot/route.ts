import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { getUserRole } from "@/lib/rbac";
import { resolvePatientAccess } from "@/lib/patient-access";
import { rosterDoctorIdFromRequest } from "@/lib/patient-api-access";
import { loadPatientSnapshotData } from "@/lib/patient-snapshot-data";

/** Per-request snapshot — literal required (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const role = await getUserRole(sessionUser.userId);
    const rosterDoctorId = rosterDoctorIdFromRequest(req);
    const level = await resolvePatientAccess(
      { userId: sessionUser.userId, email: sessionUser.email, role },
      id,
      { rosterDoctorId }
    );
    if (level === "none") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const snapshot = await loadPatientSnapshotData(id);
    if (!snapshot) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(snapshot);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
