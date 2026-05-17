/**
 * Patient aggregate: appointments + invoices for this patient.
 *
 * Each appointment row adds denormalized labels for the control-panel table:
 * - `calendar_owner_*`: always the calendar owner (`Appointment.owner_id` in Prisma → `user_id` in JSON).
 * - `doctor_*`: B2 resolved treating / clinical contact (`resolveTreatingPhysicianUserId` → joined user row).
 * - `doctor_specialty`: clinical user's `specialty` for stacked badge in patient detail table.
 * - `category_label` / `category_color`: patient detail Related Appointments category column (color swatch).
 * - `appointment_type_name`: two-line Title column (type on row 1, patient name on row 2 in `PatientDetailScreen`).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { getUserRole } from "@/lib/rbac";
import { resolvePatientAccess } from "@/lib/patient-access";
import { rosterDoctorIdFromRequest } from "@/lib/patient-api-access";
import {
  serializePatient,
  serializeAppointment,
  serializeInvoice,
} from "@/lib/serializers";
import { patientDetailInclude } from "@/lib/patient-api-include";
import { resolveTreatingPhysicianUserId } from "@/lib/appointment-display-doctor";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const role = await getUserRole(sessionUser.userId);
    const rosterDoctorId = rosterDoctorIdFromRequest(req);
    const level = await resolvePatientAccess(
      { userId: sessionUser.userId, email: sessionUser.email, role },
      id,
      { rosterDoctorId }
    );
    if (level === "none") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const patientRaw = await prisma.patient.findUnique({
      where: { id },
      include: patientDetailInclude,
    });

    if (!patientRaw) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const appointmentsRaw = await prisma.appointment.findMany({
      where: { patient_id: id },
      orderBy: { start: "desc" },
      take: 50,
      include: {
        category: true,
        appointment_type: { select: { name: true } },
        owner: { select: { id: true, display_name: true, email: true, specialty: true } },
        treating_physician: { select: { id: true, display_name: true, email: true, specialty: true } },
      },
    });

    const appointmentIds = appointmentsRaw.map((a) => a.id);

    const invoicesRaw =
      appointmentIds.length === 0
        ? []
        : await prisma.invoice.findMany({
            where: { appointment_id: { in: appointmentIds } },
            orderBy: { created_at: "desc" },
          });

    const appointments = appointmentsRaw.map((a) => {
      const row = serializeAppointment(a);
      const clinicalId = resolveTreatingPhysicianUserId(row);
      const clinical =
        a.treating_physician_id && a.treating_physician?.id === clinicalId
          ? a.treating_physician
          : a.owner;
      return {
        ...row,
        category_label: a.category?.label ?? null,
        category_color: a.category?.color ?? null,
        appointment_type_name: a.appointment_type?.name ?? null,
        calendar_owner_id: a.owner?.id ?? null,
        calendar_owner_display: a.owner?.display_name ?? null,
        calendar_owner_email: a.owner?.email ?? null,
        doctor_id: clinical?.id ?? null,
        doctor_display: clinical?.display_name ?? null,
        doctor_email: clinical?.email ?? null,
        doctor_specialty: clinical?.specialty ?? null,
      };
    });

    const invoices = invoicesRaw.map(serializeInvoice);

    return NextResponse.json({
      patient: serializePatient(patientRaw),
      appointments,
      invoices,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
