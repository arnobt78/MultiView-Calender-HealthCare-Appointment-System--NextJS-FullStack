/**
 * SSR load for admin user detail — appointments owned by this admin (calendar owner).
 */
import { prisma } from "@/lib/prisma";
import {
  appointmentSnapshotInclude,
  mapAppointmentToSnapshotRow,
  type AppointmentSnapshotPrismaRow,
} from "@/lib/appointment-snapshot-row";
import type { AppointmentSnapshotRow } from "@/types/types";

export type AdminUserOwnedAppointmentsPayload = {
  appointments: AppointmentSnapshotRow[];
  totalCount: number;
};

export async function loadAdminUserOwnedAppointments(
  adminId: string,
  take = 20
): Promise<AdminUserOwnedAppointmentsPayload> {
  const where = { owner_id: adminId };

  const [appointmentsRaw, totalCount] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { start: "desc" },
      take,
      include: appointmentSnapshotInclude,
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    appointments: appointmentsRaw.map((a) =>
      mapAppointmentToSnapshotRow(a as AppointmentSnapshotPrismaRow)
    ),
    totalCount,
  };
}
