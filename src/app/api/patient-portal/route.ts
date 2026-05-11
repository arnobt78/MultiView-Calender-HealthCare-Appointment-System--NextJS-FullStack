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

    // Find patient by email, joining primary_doctor for display in the profile card
    const patient = await prisma.patient.findFirst({
      where: { email: user.email },
      include: {
        primary_doctor: { select: { display_name: true, email: true } },
      },
    });

    if (!patient) {
      return NextResponse.json({
        appointments: [],
        patient: null,
        userImage: user.image ?? null,
        message: "No patient record found for your email",
      });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patient_id: patient.id },
      include: { category: true, owner: { select: { display_name: true, email: true } } },
      orderBy: { start: "desc" },
    });

    // Return userImage from the auth user row so the profile card can show the OAuth avatar
    return NextResponse.json({ appointments, patient, userImage: user.image ?? null });
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
        user_id: doctorId, // Doctor owns the appointment
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
          link: `/control-panel/appointments/${appointment.id}`,
        },
      });
    } catch {
      // Non-critical, don't fail the booking
    }

    // Bust the doctor's server-side Redis overview cache so their dashboard
    // reflects the new booking immediately on next load (non-critical, fire-and-forget).
    void redis.invalidateDashboardOverview(doctorId);

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error: unknown) {
    console.error("Patient booking error:", error);
    return NextResponse.json({ error: "Failed to book appointment" }, { status: 500 });
  }
}
