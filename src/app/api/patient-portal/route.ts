/**
 * Patient Portal — Booking & History
 * 
 * GET /api/patient-portal/history — patient's appointment history
 * POST /api/patient-portal/book — self-book an appointment
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isValidUUID } from "@/lib/validation";
import { redis } from "@/lib/redis";
import { mapPortalAppointmentsFromRows, serializePatient, serializeAppointment } from "@/lib/serializers";
import { patientDetailInclude } from "@/lib/patient-api-include";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get patient record linked to this user's email
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    /**
     * Same include + serializer as GET /api/patients/:id so the portal profile card reads
     * `primary_doctor_display` / `primary_doctor_email` / `primary_doctor_id` — not a nested
     * Prisma-only `primary_doctor` object that diverges from SSR prefetch (`serializePatient`).
     */
    const patientRow = await prisma.patient.findFirst({
      where: { email: user.email },
      include: patientDetailInclude,
    });

    if (!patientRow) {
      return NextResponse.json({
        appointments: [],
        patient: null,
        userImage: user.image ?? null,
        message: "No patient record found for your email",
      });
    }

    const appointmentsRaw = await prisma.appointment.findMany({
      where: { patient_id: patientRow.id },
      include: { category: true, owner: { select: { display_name: true, email: true } }, treating_physician: { select: { display_name: true, email: true } } },
      orderBy: { start: "desc" },
    });

    // Same `appointments` map as `prefetchPortalData` — `owner` is calendar owner (`owner_id` / JSON `user_id`), not primary doctor.
    const appointments = mapPortalAppointmentsFromRows(appointmentsRaw);

    // Return userImage from the auth user row so the profile card can show the OAuth avatar
    return NextResponse.json({
      appointments,
      patient: serializePatient(patientRow),
      userImage: user.image ?? null,
    });
  } catch (error: unknown) {
    console.error("Patient portal error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as {
      title?: unknown; start?: unknown; end?: unknown; notes?: unknown; doctorId?: unknown;
    };
    const { title, start, end, notes, doctorId } = body;

    if (!title || typeof title !== "string" || !start || !end || !doctorId) {
      return NextResponse.json(
        { error: "title, start, end, and doctorId are required" },
        { status: 400 }
      );
    }

    // Validate doctorId is a UUID and points to a real user with doctor role.
    if (typeof doctorId !== "string" || !isValidUUID(doctorId)) {
      return NextResponse.json({ error: "Invalid doctorId" }, { status: 400 });
    }
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { id: true, role: true },
    });
    if (!doctor || doctor.role !== "doctor") {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Parse and validate dates before Prisma to avoid Invalid Date silently storing epoch.
    const startDate = new Date(String(start));
    const endDate = new Date(String(end));
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid start or end date" }, { status: 400 });
    }
    if (endDate <= startDate) {
      return NextResponse.json({ error: "end must be after start" }, { status: 400 });
    }

    // Find patient record
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.userId },
    });
    const patient = user
      ? await prisma.patient.findFirst({ where: { email: user.email } })
      : null;

    const appointment = await prisma.appointment.create({
      data: {
        title,
        start: startDate,
        end: endDate,
        notes: typeof notes === "string" ? notes : null,
        owner_id: doctorId, // B3 Prisma field; DB column remains `user_id`
        treating_physician_id: doctorId, // B2: portal booking — same doctor until product allows decoupling
        patient_id: patient?.id || null,
        status: "pending",
      },
    });

    // Create notification for the doctor
    try {
      await prisma.notification.create({
        data: {
          user_id: doctorId,
          title: "New Patient Booking",
          message: `${user?.display_name || user?.email || "A patient"} booked "${title}"`,
          type: "info",
          // Deep-link doctor to the booked appointment.
          link: `/appointments/${appointment.id}`,
        },
      });
    } catch {
      // Non-critical, don't fail the booking
    }

    // Bust the doctor's server-side Redis overview cache so their dashboard
    // reflects the new booking immediately on next load (non-critical, fire-and-forget).
    void redis.invalidateDashboardOverview(doctorId);

    return NextResponse.json({ appointment: serializeAppointment(appointment) }, { status: 201 });
  } catch (error: unknown) {
    console.error("Patient booking error:", error);
    return NextResponse.json({ error: "Failed to book appointment" }, { status: 500 });
  }
}
