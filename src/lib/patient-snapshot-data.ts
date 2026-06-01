import { prisma } from "@/lib/prisma";
import { patientDetailInclude } from "@/lib/patient-api-include";
import {
  appointmentSnapshotInclude,
  mapAppointmentToSnapshotRow,
  type AppointmentSnapshotPrismaRow,
} from "@/lib/appointment-snapshot-row";
import { serializeInvoice, serializePatient } from "@/lib/serializers";
import type { Patient, PatientSnapshot } from "@/types/types";

/**
 * Shared Prisma load for patient snapshot (GET /api/patients/:id/snapshot + SSR prefetch).
 * `appointmentTotalCount` / `invoiceTotalCount` are full totals — table rows are capped at 50.
 */
export async function loadPatientSnapshotData(patientId: string): Promise<PatientSnapshot | null> {
  const patientRaw = await prisma.patient.findUnique({
    where: { id: patientId },
    include: patientDetailInclude,
  });
  if (!patientRaw) return null;

  const [appointmentsRaw, appointmentTotalCount] = await Promise.all([
    prisma.appointment.findMany({
      where: { patient_id: patientId },
      orderBy: { start: "desc" },
      take: 50,
      include: appointmentSnapshotInclude,
    }),
    prisma.appointment.count({ where: { patient_id: patientId } }),
  ]);

  const appointmentIds = appointmentsRaw.map((a) => a.id);

  const invoicesRaw =
    appointmentIds.length === 0
      ? []
      : await prisma.invoice.findMany({
          where: { appointment_id: { in: appointmentIds } },
          orderBy: { created_at: "desc" },
          include: { payments: { select: { id: true, status: true, amount: true, created_at: true, stripe_payment_id: true } } },
        });

  const invoiceTotalCount =
    appointmentIds.length === 0
      ? 0
      : await prisma.invoice.count({
          where: { appointment_id: { in: appointmentIds } },
        });

  return {
    patient: serializePatient(patientRaw) as Patient,
    appointments: appointmentsRaw.map((a) =>
      mapAppointmentToSnapshotRow(a as AppointmentSnapshotPrismaRow)
    ),
    invoices: invoicesRaw.map(serializeInvoice),
    appointmentTotalCount,
    invoiceTotalCount,
  };
}
