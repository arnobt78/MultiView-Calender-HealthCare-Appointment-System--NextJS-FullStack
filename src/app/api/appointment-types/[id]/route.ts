/**
 * PATCH /api/appointment-types/[id] — update a doctor-owned row or a **global** row (`user_id` null, admin only).
 * DELETE /api/appointment-types/[id] — same RBAC split (doctor self for owned rows; admin for any row).
 *
 * RBAC: global templates — **admin only**. Doctor-owned — admin or owning doctor. After mutations, clients
 * should run `invalidateAppointmentTypeDerived` so slots + doctors directory refetch.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { getUserRole, isAdminRole, isDoctorRole } from "@/lib/rbac";
import { notifyDoctorSettingsChangedByAdmin } from "@/lib/doctor-settings-notify";

type PatchBody = {
  name?: unknown;
  description?: unknown;
  duration_minutes?: unknown;
  buffer_before_minutes?: unknown;
  buffer_after_minutes?: unknown;
  slot_interval_minutes?: unknown;
  minimum_notice_minutes?: unknown;
  /** Doctor-owned rows only — soft-hide from booking without DELETE. */
  is_active?: unknown;
};

function numOrUndef(v: unknown, min: number, max: number): number | undefined {
  if (v === undefined) return undefined;
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isFinite(n) || n < min || n > max) return undefined;
  return Math.floor(n);
}

function strOrUndef(v: unknown): string | undefined {
  if (v === undefined) return undefined;
  if (v === null) return "";
  if (typeof v !== "string") return undefined;
  return v;
}

/** `typeUserId` null = global template — only admins may change or remove those rows from the API. */
async function canMutateType(sessionUserId: string, role: string | null, typeUserId: string | null) {
  if (typeUserId == null) return isAdminRole(role);
  if (isAdminRole(role)) return true;
  if (isDoctorRole(role) && sessionUserId === typeUserId) return true;
  return false;
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const role = await getUserRole(sessionUser.userId);
    const existing = await prisma.appointmentType.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!(await canMutateType(sessionUser.userId, role, existing.user_id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as PatchBody;
    const name = strOrUndef(body.name);
    const duration_minutes = numOrUndef(body.duration_minutes, 5, 12 * 60);
    const buffer_before_minutes = numOrUndef(body.buffer_before_minutes, 0, 240);
    const buffer_after_minutes = numOrUndef(body.buffer_after_minutes, 0, 240);
    const slot_interval_minutes = numOrUndef(body.slot_interval_minutes, 5, 12 * 60);
    const minimum_notice_minutes = numOrUndef(body.minimum_notice_minutes, 0, 7 * 24 * 60);

    const data: {
      name?: string;
      description?: string | null;
      duration_minutes?: number;
      buffer_before_minutes?: number;
      buffer_after_minutes?: number;
      slot_interval_minutes?: number;
      minimum_notice_minutes?: number;
      is_active?: boolean;
    } = {};
    if (name !== undefined) {
      const trimmed = name.trim();
      if (!trimmed) return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
      data.name = trimmed;
    }
    if (body.description !== undefined) {
      if (body.description === null) {
        data.description = null;
      } else if (typeof body.description === "string") {
        data.description = body.description.trim() || null;
      } else {
        return NextResponse.json({ error: "description must be a string or null" }, { status: 400 });
      }
    }
    if (duration_minutes !== undefined) data.duration_minutes = duration_minutes;
    if (buffer_before_minutes !== undefined) data.buffer_before_minutes = buffer_before_minutes;
    if (buffer_after_minutes !== undefined) data.buffer_after_minutes = buffer_after_minutes;
    if (slot_interval_minutes !== undefined) data.slot_interval_minutes = slot_interval_minutes;
    if (minimum_notice_minutes !== undefined) data.minimum_notice_minutes = minimum_notice_minutes;

    if (body.is_active !== undefined) {
      if (typeof body.is_active !== "boolean") {
        return NextResponse.json({ error: "is_active must be a boolean" }, { status: 400 });
      }
      if (existing.user_id == null) {
        return NextResponse.json(
          { error: "Use admin global tools to deactivate organization templates" },
          { status: 400 }
        );
      }
      data.is_active = body.is_active;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const type = await prisma.appointmentType.update({
      where: { id },
      data,
    });

    if (existing.user_id) {
      notifyDoctorSettingsChangedByAdmin({
        actorUserId: sessionUser.userId,
        doctorUserId: existing.user_id,
        changeKind: "visit_type",
        detail: `An administrator updated appointment type "${type.name}".`,
      });
    }

    return NextResponse.json({ type });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const role = await getUserRole(sessionUser.userId);
    const existing = await prisma.appointmentType.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!(await canMutateType(sessionUser.userId, role, existing.user_id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.appointmentType.delete({ where: { id } });

    if (existing.user_id) {
      notifyDoctorSettingsChangedByAdmin({
        actorUserId: sessionUser.userId,
        doctorUserId: existing.user_id,
        changeKind: "visit_type",
        detail: `An administrator removed appointment type "${existing.name}" from your profile.`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
