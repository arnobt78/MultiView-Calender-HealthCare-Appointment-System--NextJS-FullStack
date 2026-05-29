/**
 * GET /api/appointment-types?doctorId=<uuid>
 *
 * Returns appointment types for a specific doctor: their own types (user_id = doctorId)
 * plus any global types (user_id = null) shared across all doctors.
 * Global types include an `is_enabled` flag derived from DoctorAppointmentTypeConfig.
 * Absence of a config row = enabled by default.
 *
 * Used by:
 *   - Patient portal booking wizard (`filterBookableTypesForDoctorFromApi` in `doctor-bookable-types.ts`)
 *   - Doctor portal appointment type manager (shows all with checkbox state)
 *   - Admin/staff appointment dialog (doctor's available types)
 *
 * POST /api/appointment-types
 *
 * Creates a **doctor-owned** row (`user_id` = doctor). Admins may create for any doctor id;
 * a doctor may only create types for themselves. React clients must call `invalidateAppointmentTypeDerived`
 * after success so `queryKeys.appointmentTypes`, slot math, and `/api/doctors` caches stay aligned.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchAppointmentTypesForDoctorManager } from "@/lib/appointment-types-for-doctor-query";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { notifyDoctorSettingsChangedByAdmin } from "@/lib/doctor-settings-notify";
import {
  DEFAULT_DOCTOR_OWNED_TYPE_BUFFER_MINUTES,
  DEFAULT_DOCTOR_OWNED_TYPE_SLOT_INTERVAL_MINUTES,
} from "@/lib/constants-appointment-type";
import { getUserRole, isAdminRole, isDoctorRole } from "@/lib/rbac";

function numField(v: unknown, min: number, max: number, fallback: number): number {
  if (v === undefined) return fallback;
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isFinite(n) || n < min || n > max) return fallback;
  return Math.floor(n);
}

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId") ?? "";

    if (!isValidUUID(doctorId)) {
      return NextResponse.json({ error: "doctorId must be a valid UUID" }, { status: 400 });
    }

    const types = await fetchAppointmentTypesForDoctorManager(doctorId);
    return NextResponse.json({ types });
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

    const role = await getUserRole(sessionUser.userId);
    if (!isAdminRole(role) && !isDoctorRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const user_id = typeof body.user_id === "string" ? body.user_id : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const durationRaw =
      typeof body.duration_minutes === "number"
        ? body.duration_minutes
        : typeof body.duration_minutes === "string"
          ? Number(body.duration_minutes)
          : NaN;

    if (!isValidUUID(user_id)) {
      return NextResponse.json({ error: "user_id must be a valid doctor UUID" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!Number.isFinite(durationRaw) || durationRaw < 5 || durationRaw > 12 * 60) {
      return NextResponse.json({ error: "duration_minutes must be between 5 and 720" }, { status: 400 });
    }

    if (isDoctorRole(role) && !isAdminRole(role) && sessionUser.userId !== user_id) {
      return NextResponse.json({ error: "Doctors may only create types for their own user id" }, { status: 403 });
    }

    const target = await prisma.user.findUnique({
      where: { id: user_id },
      select: { id: true, role: true },
    });
    if (!target || target.role !== "doctor") {
      return NextResponse.json({ error: "user_id must reference a user with role doctor" }, { status: 400 });
    }

    let description: string | null = null;
    if ("description" in body) {
      if (body.description === null) {
        description = null;
      } else if (typeof body.description === "string") {
        description = body.description.trim() || null;
      } else {
        return NextResponse.json({ error: "description must be a string or null" }, { status: 400 });
      }
    }

    const isTelehealth =
      typeof body.is_telehealth === "boolean" ? body.is_telehealth : false;
    const color =
      typeof body.color === "string" && body.color.trim() ? body.color.trim() : null;
    const icon =
      typeof body.icon === "string" && body.icon.trim() ? body.icon.trim() : null;

    const type = await prisma.appointmentType.create({
      data: {
        user_id,
        name,
        description,
        duration_minutes: Math.floor(durationRaw),
        buffer_before_minutes: numField(
          body.buffer_before_minutes,
          0,
          240,
          DEFAULT_DOCTOR_OWNED_TYPE_BUFFER_MINUTES
        ),
        buffer_after_minutes: numField(
          body.buffer_after_minutes,
          0,
          240,
          DEFAULT_DOCTOR_OWNED_TYPE_BUFFER_MINUTES
        ),
        slot_interval_minutes: numField(
          body.slot_interval_minutes,
          5,
          12 * 60,
          DEFAULT_DOCTOR_OWNED_TYPE_SLOT_INTERVAL_MINUTES
        ),
        minimum_notice_minutes: numField(body.minimum_notice_minutes, 0, 7 * 24 * 60, 60),
        is_telehealth: isTelehealth,
        color,
        icon,
      },
    });

    notifyDoctorSettingsChangedByAdmin({
      actorUserId: sessionUser.userId,
      doctorUserId: user_id,
      changeKind: "visit_type",
      detail: `An administrator added appointment type "${name}" to your profile.`,
    });

    return NextResponse.json({ type }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
