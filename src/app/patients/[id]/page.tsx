/**
 * Doctor / patient chart — `/patients/:id` (no control-panel chrome).
 * SSR seeds patient + snapshot + doctor directory (snapshot table portraits).
 */
export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";
import { isValidUUID } from "@/lib/validation";
import { resolvePatientAccess } from "@/lib/patient-access";
import { patientDetailHref } from "@/lib/entity-routes";
import { PatientDetailScreen } from "@/components/control-panel/PatientDetailScreen";
import {
  prefetchDoctors,
  prefetchPatient,
  prefetchPatientSnapshot,
  prefetchUsersList,
} from "@/lib/server-prefetch";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fromDoctor?: string }>;
};

export default async function PortalPatientDetailPage({ params, searchParams }: PageProps) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const { fromDoctor } = await searchParams;
  const rosterDoctorId =
    fromDoctor && isValidUUID(fromDoctor) ? fromDoctor : null;

  const role = await getUserRole(sessionUser.userId);
  if (isAdminRole(role)) {
    redirect(patientDetailHref(role, id));
  }

  const accessLevel = await resolvePatientAccess(
    { userId: sessionUser.userId, email: sessionUser.email, role },
    id,
    { rosterDoctorId }
  );
  if (accessLevel === "none") notFound();

  const [initialPatient, initialSnapshot, initialDoctors, initialDoctorUsers, initialAdminUsers] =
    await Promise.all([
      prefetchPatient(id),
      prefetchPatientSnapshot(id),
      prefetchDoctors(),
      prefetchUsersList({ role: "doctor", limit: 200 }),
      prefetchUsersList({ role: "admin", limit: 50 }),
    ]);

  if (!initialPatient) notFound();

  const listBackHref = role === "patient" ? "/patient-portal" : "/doctor-portal";

  return (
    <PatientDetailScreen
      patientId={id}
      accessLevel={accessLevel}
      viewerRole={role}
      listBackHref={listBackHref}
      initialPatient={initialPatient}
      initialSnapshot={initialSnapshot}
      initialDoctors={initialDoctors}
      initialDoctorUsers={initialDoctorUsers}
      initialAdminUsers={initialAdminUsers}
    />
  );
}
