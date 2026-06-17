import { prisma } from "@/lib/prisma";
import { patientDetailInclude } from "@/lib/patient-api-include";
import {
  appointmentSnapshotInclude,
  mapAppointmentToSnapshotRow,
  type AppointmentSnapshotPrismaRow,
} from "@/lib/appointment-snapshot-row";
import { serializePatient } from "@/lib/serializers";
import type { Patient, PatientSnapshot } from "@/types/types";

/**
 * Shared Prisma load for patient snapshot (GET /api/patients/:id/snapshot + SSR prefetch).
 * Appointment rows capped at 50; `appointmentTotalCount` / `invoiceTotalCount` are full totals.
 * Invoice rows are not loaded here — UI uses `queryKeys.invoices.all` + patient filter (C46).
 */
export async function loadPatientSnapshotData(patientId: string): Promise<PatientSnapshot | null> {
  const patientRaw = await prisma.patient.findUnique({
    where: { id: patientId },
    include: patientDetailInclude,
  });
  if (!patientRaw) return null;

  const [appointmentsRaw, appointmentTotalCount, invoiceTotalCount] = await Promise.all([
    prisma.appointment.findMany({
      where: { patient_id: patientId },
      orderBy: { start: "desc" },
      take: 50,
      include: appointmentSnapshotInclude,
    }),
    prisma.appointment.count({ where: { patient_id: patientId } }),
    prisma.invoice.count({
      where: { appointment: { patient_id: patientId } },
    }),
  ]);

  return {
    patient: serializePatient(patientRaw) as Patient,
    appointments: appointmentsRaw.map((a) =>
      mapAppointmentToSnapshotRow(a as AppointmentSnapshotPrismaRow)
    ),
    invoices: [],
    appointmentTotalCount,
    invoiceTotalCount,
  };
}
