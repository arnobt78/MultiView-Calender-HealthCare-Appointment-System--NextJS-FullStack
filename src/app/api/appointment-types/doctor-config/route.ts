/**
 * POST /api/appointment-types/doctor-config
 *
 * Upserts a DoctorAppointmentTypeConfig row — toggles whether a doctor has
 * enabled or disabled a global appointment type for their booking calendar.
 *
 * Body: { doctor_id: UUID, appointment_type_id: UUID, is_enabled: boolean }
 *
 * RBAC: doctors may only update their own config; admins may update any doctor.
 * After a successful upsert, clients must call invalidateAppointmentTypeDerived()
 * so the slot picker and patient booking wizard reflect the new state.
 *
 * GET /api/appointment-types/doctor-config?doctorId=<uuid>
 *
 * Returns all config rows for a given doctor (used by the doctor portal manager
 * to populate checkbox states without a full appointment-types refetch).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { getUserRole, isAdminRole, isDoctorRole } from "@/lib/rbac";
import { notifyDoctorSettingsChangedByAdmin } from "@/lib/doctor-settings-notify";

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

    const role = await getUserRole(sessionUser.userId);

    // Doctors may only see their own configs; admins can see any doctor's config
    if (isDoctorRole(role) && !isAdminRole(role) && sessionUser.userId !== doctorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const configs = await prisma.doctorAppointmentTypeConfig.findMany({
      where: { doctor_id: doctorId },
      select: {
        id: true,
        doctor_id: true,
        appointment_type_id: true,
        is_enabled: true,
        created_at: true,
      },
    });

    return NextResponse.json({
      configs: configs.map((c) => ({
        ...c,
        created_at: c.created_at.toISOString(),
      })),
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

    const role = await getUserRole(sessionUser.userId);
    if (!isAdminRole(role) && !isDoctorRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const doctorId = typeof body.doctor_id === "string" ? body.doctor_id : "";
    const typeId =
      typeof body.appointment_type_id === "string" ? body.appointment_type_id : "";
    const isEnabled =
      typeof body.is_enabled === "boolean" ? body.is_enabled : true;

    if (!isValidUUID(doctorId)) {
      return NextResponse.json({ error: "doctor_id must be a valid UUID" }, { status: 400 });
    }
    if (!isValidUUID(typeId)) {
      return NextResponse.json({ error: "appointment_type_id must be a valid UUID" }, { status: 400 });
    }

    // Doctors may only modify their own config; admins may modify any
    if (isDoctorRole(role) && !isAdminRole(role) && sessionUser.userId !== doctorId) {
      return NextResponse.json({ error: "Doctors may only configure their own types" }, { status: 403 });
    }

    // Verify the target is a doctor account
    const targetUser = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { role: true },
    });
    if (!targetUser || targetUser.role !== "doctor") {
      return NextResponse.json({ error: "doctor_id must reference a doctor account" }, { status: 400 });
    }

    // Verify the appointment type exists and is global (user_id = null)
    const apptType = await prisma.appointmentType.findUnique({
      where: { id: typeId },
      select: { user_id: true },
    });
    if (!apptType) {
      return NextResponse.json({ error: "Appointment type not found" }, { status: 404 });
    }

    // Upsert: create or update the config row
    const config = await prisma.doctorAppointmentTypeConfig.upsert({
      where: {
        doctor_id_appointment_type_id: { doctor_id: doctorId, appointment_type_id: typeId },
      },
      create: { doctor_id: doctorId, appointment_type_id: typeId, is_enabled: isEnabled },
      update: { is_enabled: isEnabled },
    });

    notifyDoctorSettingsChangedByAdmin({
      actorUserId: sessionUser.userId,
      doctorUserId: doctorId,
      changeKind: "global_visit_toggle",
      detail: `Organization-wide appointment type access was ${isEnabled ? "enabled" : "disabled"} for your calendar.`,
    });

    return NextResponse.json({
      config: {
        id: config.id,
        doctor_id: config.doctor_id,
        appointment_type_id: config.appointment_type_id,
        is_enabled: config.is_enabled,
        created_at: config.created_at.toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
