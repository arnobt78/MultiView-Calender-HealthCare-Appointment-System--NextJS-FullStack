/**
 * Patient Portal — Booking & History
 * 
 * GET /api/patient-portal/history — patient's appointment history
 * POST /api/patient-portal/book — self-book an appointment
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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

    // Find patient by email match
    const patient = await prisma.patient.findFirst({
      where: { email: user.email },
    });

    if (!patient) {
      return NextResponse.json({
        appointments: [],
        message: "No patient record found for your email",
      });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patient_id: patient.id },
      include: { category: true, owner: { select: { display_name: true, email: true } } },
      orderBy: { start: "desc" },
    });

    return NextResponse.json({ appointments, patient });
  } catch (error) {
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

    const { title, start, end, notes, doctorId } = await request.json();

    if (!title || !start || !end || !doctorId) {
      return NextResponse.json(
        { error: "title, start, end, and doctorId are required" },
        { status: 400 }
      );
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
        start: new Date(start),
        end: new Date(end),
        notes: notes || null,
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
          link: "/",
        },
      });
    } catch {
      // Non-critical, don't fail the booking
    }

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error("Patient booking error:", error);
    return NextResponse.json({ error: "Failed to book appointment" }, { status: 500 });
  }
}
