/**
 * Patient detail — Server Component.
 *
 * Pre-fetches the full patient record and snapshot (appointments, activities,
 * invoices) so PatientDetailScreen receives them as initialPatient / initialSnapshot
 * props and seeds the TanStack Query cache on first render — the detail view
 * renders instantly with real data, no loading flash.
 */
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { PatientDetailScreen } from "@/components/control-panel/PatientDetailScreen";
import {
  prefetchPatient,
  prefetchPatientSnapshot,
} from "@/lib/server-prefetch";
import type { Patient, PatientSnapshot } from "@/types/types";
import { getUserRole, isPatientRole } from "@/lib/rbac";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  let title = `Patient — ${id.slice(0, 8)}`;
  if (isValidUUID(id)) {
    const session = await getSessionUser();
    if (session) {
      const role = await getUserRole(session.userId);
      // Patient role: only expose name in title if it matches their own record.
      const where = isPatientRole(role)
        ? { id, email: session.email }
        : { id };
      const p = await prisma.patient.findFirst({
        where,
        select: { firstname: true, lastname: true },
      });
      if (p) {
        const n = `${p.firstname} ${p.lastname}`.trim();
        if (n) title = n;
      }
    }
  }
  return { title };
}

export default async function PatientDetailPage({ params }: PageProps) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const role = await getUserRole(sessionUser.userId);

  /*
   * Role-scoped server prefetch:
   * - Staff (admin/doctor/secretary): any patient record.
   * - Patient role: only allowed to see their own record (matched by email).
   *   If they request another patient's ID they get a 404.
   */
  const [initialPatient, initialSnapshot] = await Promise.all([
    prefetchPatient(id),
    prefetchPatientSnapshot(id),
  ]);

  // For patient role, verify the returned record belongs to the session user.
  if (!initialPatient || (isPatientRole(role) && initialPatient.email !== sessionUser.email)) {
    notFound();
  }

  return (
    <PatientDetailScreen
      patientId={id}
      initialPatient={initialPatient}
      initialSnapshot={initialSnapshot}
    />
  );
}
