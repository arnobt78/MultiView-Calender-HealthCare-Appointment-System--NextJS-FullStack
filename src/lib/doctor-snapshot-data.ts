import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { USER_API_SELECT } from "@/lib/user-api-select";
import {
  appointmentSnapshotInclude,
  mapAppointmentToSnapshotRow,
  type AppointmentSnapshotPrismaRow,
} from "@/lib/appointment-snapshot-row";
import { serializeUser } from "@/lib/serializers";
import type { DoctorSnapshot, User } from "@/types/types";

/** Visits where this doctor owns the calendar row or is the treating physician. */
export const doctorSnapshotAppointmentWhere = (doctorId: string): Prisma.AppointmentWhereInput => ({
  OR: [{ owner_id: doctorId }, { treating_physician_id: doctorId }],
});

/**
 * Shared Prisma load for doctor snapshot (GET /api/doctors/:id/snapshot + SSR prefetch).
 * Aligns with staff calendar scope (owner + treating); assignee-only rows are excluded.
 */
export async function loadDoctorSnapshotData(doctorId: string): Promise<DoctorSnapshot | null> {
  const doctorRow = await prisma.user.findFirst({
    where: { id: doctorId, role: "doctor" },
    select: USER_API_SELECT,
  });
  if (!doctorRow) return null;

  const where = doctorSnapshotAppointmentWhere(doctorId);

  const [appointmentsRaw, totalCount] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { start: "desc" },
      take: 50,
      include: appointmentSnapshotInclude,
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    doctor: serializeUser(doctorRow) as User,
    appointments: appointmentsRaw.map((a) =>
      mapAppointmentToSnapshotRow(a as AppointmentSnapshotPrismaRow)
    ),
    totalCount,
  };
}
