/**
 * Doctor Time Off CRUD.
 * GET  /api/doctor-time-off?doctorId=  — list blocks (admin or self)
 * POST /api/doctor-time-off            — create block (admin or self)
 *
 * DoctorTimeOff fields: starts_at (ISO), ends_at (ISO), reason (optional).
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
    if (!isAdminRole(role) && sessionUser.userId !== doctorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const timeOff = await prisma.doctorTimeOff.findMany({
      where: { user_id: doctorId },
      orderBy: { starts_at: "asc" },
    });

    return NextResponse.json({ timeOff });
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
      starts_at: string;
      ends_at: string;
      reason?: string;
    };

    const { doctorId, starts_at, ends_at, reason } = body;

    if (!doctorId || !starts_at || !ends_at) {
      return NextResponse.json({ error: "doctorId, starts_at, ends_at required" }, { status: 400 });
    }

    const startDate = new Date(starts_at);
    const endDate = new Date(ends_at);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      return NextResponse.json({ error: "starts_at must be before ends_at" }, { status: 400 });
    }

    const role = await getUserRole(sessionUser.userId);
    if (!isAdminRole(role) && sessionUser.userId !== doctorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const block = await prisma.doctorTimeOff.create({
      data: {
        user_id: doctorId,
        starts_at: startDate,
        ends_at: endDate,
        reason: reason?.trim() || null,
      },
    });

    notifyDoctorSettingsChangedByAdmin({
      actorUserId: sessionUser.userId,
      doctorUserId: doctorId,
      changeKind: "time_off",
      detail: "A time-off block was added to your schedule.",
    });

    void redis.invalidateAfterDoctorScheduleMutation(sessionUser.userId, doctorId);

    return NextResponse.json({ block }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
