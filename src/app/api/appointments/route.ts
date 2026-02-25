/**
 * Appointments API Route Handler (Prisma)
 * GET: List appointments (filtered by user, optional filters) | POST: Create appointment
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { PAGINATION, VALIDATION } from "@/lib/constants";
import { serializeAppointment } from "@/lib/serializers";
import { isValidDate, isValidAppointmentStatus } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const startDate = searchParams.get("start_date") ?? undefined;
    const endDate = searchParams.get("end_date") ?? undefined;
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") ?? PAGINATION.DEFAULT_LIMIT.toString(), 10), 1),
      PAGINATION.MAX_LIMIT
    );
    const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10), 0);

    const where: { user_id: string; status?: string; category_id?: string; start?: { gte?: Date }; end?: { lte?: Date } } = {
      user_id: sessionUser.userId,
    };
    if (status) where.status = status;
    if (category) where.category_id = category;
    if (startDate) where.start = { gte: new Date(startDate) };
    if (endDate) where.end = { lte: new Date(endDate) };

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        orderBy: { start: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.appointment.count({ where }),
    ]);

    return NextResponse.json({
      appointments: appointments.map(serializeAppointment),
      pagination: { limit, offset, total, count: appointments.length },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
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
    if (!body.title || !body.start || !body.end) {
      return NextResponse.json({ error: "Missing required fields: title, start, and end are required" }, { status: 400 });
    }
    if (body.title.length > VALIDATION.MAX_TITLE_LENGTH) {
      return NextResponse.json({ error: `Title must be less than ${VALIDATION.MAX_TITLE_LENGTH} characters` }, { status: 400 });
    }
    if (!isValidDate(body.start) || !isValidDate(body.end)) {
      return NextResponse.json({ error: "Invalid date format. Use ISO 8601 format." }, { status: 400 });
    }
    const startDate = new Date(body.start);
    const endDate = new Date(body.end);
    if (endDate <= startDate) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
    }
    if (body.status && !isValidAppointmentStatus(body.status)) {
      return NextResponse.json({ error: "Invalid status. Must be 'done', 'pending', or 'alert'" }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        title: body.title,
        start: startDate,
        end: endDate,
        location: body.location ?? null,
        patient_id: body.patient ?? null,
        category_id: body.category ?? null,
        notes: body.notes ?? null,
        status: body.status ?? null,
        attachements: body.attachements ?? [],
        user_id: sessionUser.userId,
      },
    });

    return NextResponse.json({ appointment: serializeAppointment(appointment) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
