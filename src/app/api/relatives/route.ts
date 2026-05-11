/**
 * Relatives API Route Handler (Prisma)
 * GET: List all relatives | POST: Create a relative
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { serializeRelative } from "@/lib/serializers";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Relative records are linked to a patient, not directly to a user.
    // Restrict list access to admin/staff to prevent cross-patient data leakage.
    const { isStaffRole, getUserRole } = await import("@/lib/rbac");
    const callerRole = await getUserRole(sessionUser.userId);
    if (!isStaffRole(callerRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const relatives = await prisma.relative.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      relatives: relatives.map(serializeRelative),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error fetching relatives:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only staff (admin/doctor/secretary) can create relative records.
    const { isStaffRole, getUserRole } = await import("@/lib/rbac");
    const callerRole = await getUserRole(sessionUser.userId);
    if (!isStaffRole(callerRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.firstname || typeof body.firstname !== "string" || body.firstname.trim() === "") {
      return NextResponse.json({ error: "firstname is required" }, { status: 400 });
    }
    if (!body.lastname || typeof body.lastname !== "string" || body.lastname.trim() === "") {
      return NextResponse.json({ error: "lastname is required" }, { status: 400 });
    }

    const relative = await prisma.relative.create({
      data: {
        firstname: body.firstname.trim(),
        lastname: body.lastname.trim(),
        pronoun: body.pronoun ?? null,
        notes: body.notes ?? null,
        relationship: typeof body.relationship === "string" ? body.relationship.trim() || null : null,
        phone: typeof body.phone === "string" ? body.phone.trim() || null : null,
        email: typeof body.email === "string" ? body.email.trim() || null : null,
        date_of_birth: body.date_of_birth ? new Date(body.date_of_birth) : null,
        is_emergency_contact: Boolean(body.is_emergency_contact),
        patient_id: typeof body.patient_id === "string" && body.patient_id ? body.patient_id : null,
      },
    });

    return NextResponse.json({ relative: serializeRelative(relative) }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
