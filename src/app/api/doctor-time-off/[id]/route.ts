/**
 * DELETE /api/doctor-time-off/[id] — remove a time-off block.
 * PATCH  /api/doctor-time-off/[id] — update starts_at / ends_at / reason (inline edit).
 * Admin may mutate any; doctor may mutate own blocks only.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";
import { zodBadRequest } from "@/lib/schemas/parse";
import { notifyDoctorSettingsChangedByAdmin } from "@/lib/doctor-settings-notify";

export const dynamic = "force-dynamic";

const patchTimeOffSchema = z
  .object({
    starts_at: z.string().min(1).optional(),
    ends_at: z.string().min(1).optional(),
    reason: z.string().trim().max(500).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "At least one field required" });

async function assertCanMutateBlock(sessionUserId: string, ownerUserId: string) {
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
    const existing = await prisma.doctorTimeOff.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const forbidden = await assertCanMutateBlock(sessionUser.userId, existing.user_id);
    if (forbidden) return forbidden;

    const body = await request.json();
    const parsed = patchTimeOffSchema.safeParse(body);
    if (!parsed.success) return zodBadRequest(parsed.error);

    const nextStart =
      parsed.data.starts_at != null ? new Date(parsed.data.starts_at) : existing.starts_at;
    const nextEnd =
      parsed.data.ends_at != null ? new Date(parsed.data.ends_at) : existing.ends_at;
    if (Number.isNaN(nextStart.getTime()) || Number.isNaN(nextEnd.getTime()) || nextStart >= nextEnd) {
      return NextResponse.json({ error: "starts_at must be before ends_at" }, { status: 400 });
    }

    const block = await prisma.doctorTimeOff.update({
      where: { id },
      data: {
        ...(parsed.data.starts_at != null ? { starts_at: nextStart } : {}),
        ...(parsed.data.ends_at != null ? { ends_at: nextEnd } : {}),
        ...(parsed.data.reason !== undefined ? { reason: parsed.data.reason } : {}),
      },
    });

    notifyDoctorSettingsChangedByAdmin({
      actorUserId: sessionUser.userId,
      doctorUserId: existing.user_id,
      changeKind: "time_off",
      detail: "A time-off block on your schedule was updated.",
    });

    return NextResponse.json({ block });
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

    const existing = await prisma.doctorTimeOff.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const forbidden = await assertCanMutateBlock(sessionUser.userId, existing.user_id);
    if (forbidden) return forbidden;

    await prisma.doctorTimeOff.delete({ where: { id } });

    notifyDoctorSettingsChangedByAdmin({
      actorUserId: sessionUser.userId,
      doctorUserId: existing.user_id,
      changeKind: "time_off",
      detail: "A time-off block was removed from your schedule.",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
