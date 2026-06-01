import { prisma } from "@/lib/prisma";

/** Row shape for doctor detail assigned-patients table + `GET /api/doctors/[id]/assigned-patients`. */
export type DoctorAssignedPatientRow = {
  id: string;
  firstname: string;
  lastname: string;
  email: string | null;
  active: boolean;
  birth_date?: string | null;
};

export const DOCTOR_ASSIGNED_PATIENT_SELECT = {
  id: true,
  firstname: true,
  lastname: true,
  email: true,
  active: true,
  birth_date: true,
} as const;

export function serializeDoctorAssignedPatient(row: {
  id: string;
  firstname: string;
  lastname: string;
  email: string | null;
  active: boolean;
  birth_date: Date | null;
}): DoctorAssignedPatientRow {
  return {
    id: row.id,
    firstname: row.firstname,
    lastname: row.lastname,
    email: row.email,
    active: row.active,
    birth_date: row.birth_date?.toISOString() ?? null,
  };
}

/**
 * Primary roster + patients with visits (owner or treating) — matches revenue/appointment reality.
 * Shared by SSR page, API route, and prefetch.
 */
export async function fetchDoctorAssignedPatients(
  doctorId: string,
  take = 50
): Promise<DoctorAssignedPatientRow[]> {
  const [primaryRows, clinicalRows] = await Promise.all([
    prisma.patient.findMany({
      where: { primary_doctor_id: doctorId },
      select: DOCTOR_ASSIGNED_PATIENT_SELECT,
      orderBy: [{ firstname: "asc" }, { lastname: "asc" }],
      take,
    }),
    prisma.patient.findMany({
      where: {
        appointments: {
          some: {
            OR: [{ owner_id: doctorId }, { treating_physician_id: doctorId }],
          },
        },
      },
      select: DOCTOR_ASSIGNED_PATIENT_SELECT,
      orderBy: [{ firstname: "asc" }, { lastname: "asc" }],
      take,
    }),
  ]);

  const byId = new Map<string, DoctorAssignedPatientRow>();
  for (const row of [...primaryRows, ...clinicalRows]) {
    if (!byId.has(row.id)) {
      byId.set(row.id, serializeDoctorAssignedPatient(row));
    }
  }

  return [...byId.values()]
    .sort((a, b) =>
      `${a.firstname} ${a.lastname}`.localeCompare(`${b.firstname} ${b.lastname}`, undefined, {
        sensitivity: "base",
      })
    )
    .slice(0, take);
}
