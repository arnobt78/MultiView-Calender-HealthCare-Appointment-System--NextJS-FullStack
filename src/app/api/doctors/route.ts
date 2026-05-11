/**
 * GET /api/doctors
 *
 * Returns all users with role = "doctor", including:
 *   - specialty, bio, image
 *   - Mon–Sun availability windows (from DoctorAvailability)
 *   - Count of assigned patients (where primary_doctor_id = user.id)
 *
 * Used by the /services page and DoctorManagement.
 * Accessible to all authenticated roles.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctors = await prisma.user.findMany({
      where: { role: "doctor" },
      select: {
        id: true,
        email: true,
        display_name: true,
        image: true,
        specialty: true,
        bio: true,
        created_at: true,
        doctor_availabilities: {
          select: { weekday: true, start_min: true, end_min: true, timezone: true },
          orderBy: { weekday: "asc" },
        },
        appointment_types_owned: {
          where: { user_id: { not: null } },
          select: { id: true, name: true, duration_minutes: true, description: true },
        },
        // Count patients assigned to this doctor
        patients_primary_doctor: {
          select: { id: true },
        },
      },
      orderBy: { display_name: "asc" },
    });

    const serialized = doctors.map((d) => ({
      id: d.id,
      email: d.email,
      display_name: d.display_name,
      image: d.image,
      specialty: d.specialty,
      bio: d.bio,
      created_at: d.created_at.toISOString(),
      availabilities: d.doctor_availabilities,
      appointment_types: d.appointment_types_owned,
      patient_count: d.patients_primary_doctor.length,
    }));

    return NextResponse.json({ doctors: serialized });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
