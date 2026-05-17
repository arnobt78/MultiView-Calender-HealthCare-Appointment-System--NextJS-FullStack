/**
 * Admin patient detail — control-panel shell only.
 */
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { PatientDetailScreen } from "@/components/control-panel/PatientDetailScreen";
import { prefetchPatient, prefetchPatientSnapshot } from "@/lib/server-prefetch";
import { getUserRole, isAdminRole, isDoctorRole, isPatientRole } from "@/lib/rbac";
import { patientDetailHref } from "@/lib/entity-routes";
import { resolvePatientAccess } from "@/lib/patient-access";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  let title = `Patient — ${id.slice(0, 8)}`;
  if (isValidUUID(id)) {
    const session = await getSessionUser();
    if (session) {
      const role = await getUserRole(session.userId);
      const where = isPatientRole(role) ? { id, email: session.email } : { id };
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

export default async function ControlPanelPatientDetailPage({ params }: PageProps) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const role = await getUserRole(sessionUser.userId);

  if (isDoctorRole(role) || isPatientRole(role)) {
    redirect(patientDetailHref(role, id));
  }

  if (!isAdminRole(role)) notFound();

  const [initialPatient, initialSnapshot] = await Promise.all([
    prefetchPatient(id),
    prefetchPatientSnapshot(id),
  ]);

  if (!initialPatient) notFound();

  const accessLevel = await resolvePatientAccess(
    { userId: sessionUser.userId, email: sessionUser.email, role },
    id
  );

  return (
    <PatientDetailScreen
      patientId={id}
      accessLevel={accessLevel}
      viewerRole={role}
      listBackHref="/control-panel/patient-management"
      initialPatient={initialPatient}
      initialSnapshot={initialSnapshot}
    />
  );
}
