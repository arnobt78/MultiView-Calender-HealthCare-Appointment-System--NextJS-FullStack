/**
 * Patients API Route Handler (Prisma)
 * GET: List all patients | POST: Create a patient
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { serializePatient } from "@/lib/serializers";
import { patientDetailInclude, patientUserPick } from "@/lib/patient-api-include";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Light join: primary doctor label only (list + filters) — avoids N+1 client fetches
    const patients = await prisma.patient.findMany({
      orderBy: { created_at: "desc" },
      include: { primary_doctor: patientUserPick },
    });

    return NextResponse.json({
      patients: patients.map(serializePatient),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error fetching patients:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.firstname?.trim() || !body.lastname?.trim()) {
      return NextResponse.json({ error: "firstname and lastname are required" }, { status: 400 });
    }

    const clinical =
      body.clinical_profile != null &&
      typeof body.clinical_profile === "object" &&
      !Array.isArray(body.clinical_profile)
        ? (body.clinical_profile as object)
        : undefined;

    const primaryDoctorId =
      body.primary_doctor_id && isValidUUID(String(body.primary_doctor_id))
        ? String(body.primary_doctor_id)
        : null;

    const patient = await prisma.patient.create({
      data: {
        firstname: body.firstname.trim(),
        lastname: body.lastname.trim(),
        birth_date: body.birth_date ? new Date(body.birth_date) : null,
        care_level: body.care_level != null ? Number(body.care_level) : null,
        pronoun: body.pronoun ?? null,
        email: body.email ?? null,
        active: body.active !== false,
        active_since: body.active_since ? new Date(body.active_since) : null,
        created_by_id: sessionUser.userId,
        updated_by_id: sessionUser.userId,
        primary_doctor_id: primaryDoctorId,
        ...(clinical !== undefined ? { clinical_profile: clinical } : {}),
      },
      include: patientDetailInclude,
    });

    /*
     * Bust the server-side Redis overview cache so the new patient
     * is counted in the dashboard's "Total Patients" card immediately.
     */
    void redis.invalidateDashboardOverview(sessionUser.userId);

    return NextResponse.json({ patient: serializePatient(patient) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
