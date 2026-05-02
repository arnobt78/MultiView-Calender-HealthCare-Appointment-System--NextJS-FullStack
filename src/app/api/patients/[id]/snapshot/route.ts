/**
 * Patient aggregate: appointments for this patient, activities on those appointments, invoices linked by appointment_id.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import {
  serializePatient,
  serializeAppointment,
  serializeInvoice,
  serializeActivitySnapshot,
} from "@/lib/serializers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const patientRaw = await prisma.patient.findUnique({ where: { id } });
    if (!patientRaw) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const appointmentsRaw = await prisma.appointment.findMany({
      where: { patient_id: id },
      orderBy: { start: "desc" },
      take: 50,
      include: { category: true },
    });

    const appointmentIds = appointmentsRaw.map((a) => a.id);

    const [activitiesRaw, invoicesRaw] =
      appointmentIds.length === 0
        ? [[], []]
        : await Promise.all([
            prisma.activity.findMany({
              where: { appointment_id: { in: appointmentIds } },
              orderBy: { created_at: "desc" },
              take: 200,
              include: {
                created_by: { select: { display_name: true, email: true } },
              },
            }),
            prisma.invoice.findMany({
              where: { appointment_id: { in: appointmentIds } },
              orderBy: { created_at: "desc" },
            }),
          ]);

    const appointments = appointmentsRaw.map((a) => ({
      ...serializeAppointment(a),
      category_label: a.category?.label ?? null,
    }));

    const activities = activitiesRaw.map(serializeActivitySnapshot);
    const invoices = invoicesRaw.map(serializeInvoice);

    return NextResponse.json({
      patient: serializePatient(patientRaw),
      appointments,
      activities,
      invoices,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
