/**
 * GET /api/doctors/[id]/assigned-patients — primary-doctor roster for CP doctor detail.
 * Invalidated via `invalidateDoctorAssignedPatients` on patient CRUD.
 */
import { NextResponse } from "next/server";
import { fetchDoctorAssignedPatients } from "@/lib/doctor-assigned-patients";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";
import { isValidUUID } from "@/lib/validation";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid doctor id" }, { status: 400 });
    }

    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    if (!isAdminRole(role) && sessionUser.userId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const patients = await fetchDoctorAssignedPatients(id);
    return NextResponse.json({ patients });
  } catch (e) {
    console.error("GET /api/doctors/[id]/assigned-patients", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
