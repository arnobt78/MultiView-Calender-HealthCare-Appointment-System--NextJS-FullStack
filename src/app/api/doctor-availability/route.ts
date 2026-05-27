/**
 * Doctor Availability CRUD — weekly recurring windows.
 * GET  /api/doctor-availability?doctorId=  — list windows (admin or self)
 * POST /api/doctor-availability            — create window (admin or self)
 *
 * DoctorAvailability fields: weekday 0–6, start_min 0–1439, end_min 0–1439, timezone (IANA).
 * On mutation, invalidation is handled client-side via invalidateDoctorSchedule.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";
import { notifyDoctorSettingsChangedByAdmin } from "@/lib/doctor-settings-notify";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    if (!doctorId) {
      return NextResponse.json({ error: "doctorId required" }, { status: 400 });
    }

    const role = await getUserRole(sessionUser.userId);
    // Admin sees any doctor; doctor sees own only
    if (!isAdminRole(role) && sessionUser.userId !== doctorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const availability = await prisma.doctorAvailability.findMany({
      where: { user_id: doctorId },
      orderBy: [{ weekday: "asc" }, { start_min: "asc" }],
    });

    return NextResponse.json({ availability });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as {
      doctorId: string;
      weekday: number;
      start_min: number;
      end_min: number;
      timezone: string;
    };

    const { doctorId, weekday, start_min, end_min, timezone } = body;

    if (!doctorId || !timezone) {
      return NextResponse.json({ error: "doctorId and timezone required" }, { status: 400 });
    }
    if (typeof weekday !== "number" || weekday < 0 || weekday > 6) {
      return NextResponse.json({ error: "weekday must be 0–6" }, { status: 400 });
    }
    if (
      typeof start_min !== "number" || typeof end_min !== "number" ||
      start_min < 0 || start_min > 1439 || end_min < 0 || end_min > 1439 ||
      start_min >= end_min
    ) {
      return NextResponse.json({ error: "start_min and end_min must be 0–1439 with start < end" }, { status: 400 });
    }

    const role = await getUserRole(sessionUser.userId);
    if (!isAdminRole(role) && sessionUser.userId !== doctorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const window = await prisma.doctorAvailability.create({
      data: { user_id: doctorId, weekday, start_min, end_min, timezone },
    });

    notifyDoctorSettingsChangedByAdmin({
      actorUserId: sessionUser.userId,
      doctorUserId: doctorId,
      changeKind: "weekly_schedule",
      detail: "A weekly availability window was added to your schedule.",
    });

    void redis.invalidateAfterDoctorScheduleMutation(sessionUser.userId, doctorId);

    return NextResponse.json({ window }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
