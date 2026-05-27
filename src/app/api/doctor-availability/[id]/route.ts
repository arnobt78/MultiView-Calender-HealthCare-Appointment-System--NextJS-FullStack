/**
 * DELETE /api/doctor-availability/[id] — remove a weekly availability window.
 * PATCH  /api/doctor-availability/[id] — update weekday/start/end/timezone (inline edit).
 * Admin may mutate any; doctor may mutate own windows only.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";
import { zodBadRequest } from "@/lib/schemas/parse";
import { notifyDoctorSettingsChangedByAdmin } from "@/lib/doctor-settings-notify";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

const patchAvailabilitySchema = z
  .object({
    weekday: z.number().int().min(0).max(6).optional(),
    start_min: z.number().int().min(0).max(1439).optional(),
    end_min: z.number().int().min(0).max(1439).optional(),
    timezone: z.string().trim().min(1).max(64).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "At least one field required" })
  .refine(
    (data) => {
      if (data.start_min == null || data.end_min == null) return true;
      return data.start_min < data.end_min;
    },
    { message: "start_min must be before end_min" }
  );

async function assertCanMutateWindow(sessionUserId: string, ownerUserId: string) {
  const role = await getUserRole(sessionUserId);
  if (!isAdminRole(role) && sessionUserId !== ownerUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.doctorAvailability.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const forbidden = await assertCanMutateWindow(sessionUser.userId, existing.user_id);
    if (forbidden) return forbidden;

    const body = await request.json();
    const parsed = patchAvailabilitySchema.safeParse(body);
    if (!parsed.success) return zodBadRequest(parsed.error);

    const nextStart = parsed.data.start_min ?? existing.start_min;
    const nextEnd = parsed.data.end_min ?? existing.end_min;
    if (nextStart >= nextEnd) {
      return NextResponse.json({ error: "start_min must be before end_min" }, { status: 400 });
    }

    const window = await prisma.doctorAvailability.update({
      where: { id },
      data: parsed.data,
    });

    notifyDoctorSettingsChangedByAdmin({
      actorUserId: sessionUser.userId,
      doctorUserId: existing.user_id,
      changeKind: "weekly_schedule",
      detail: "A weekly availability window on your schedule was updated.",
    });

    void redis.invalidateAfterDoctorScheduleMutation(sessionUser.userId, existing.user_id);

    return NextResponse.json({ availability: window });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.doctorAvailability.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const forbidden = await assertCanMutateWindow(sessionUser.userId, existing.user_id);
    if (forbidden) return forbidden;

    await prisma.doctorAvailability.delete({ where: { id } });

    notifyDoctorSettingsChangedByAdmin({
      actorUserId: sessionUser.userId,
      doctorUserId: existing.user_id,
      changeKind: "weekly_schedule",
      detail: "A weekly availability window was removed from your schedule.",
    });

    void redis.invalidateAfterDoctorScheduleMutation(sessionUser.userId, existing.user_id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
