/**
 * Doctor / patient appointment detail — dashboard shell (no control-panel sidebar).
 */
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";
import { isValidUUID } from "@/lib/validation";
import { resolveAppointmentAccess } from "@/lib/appointment-access";
import { appointmentDetailHref } from "@/lib/entity-routes";
import { AppointmentDetailScreen } from "@/components/detail/AppointmentDetailScreen";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Appointment — ${id.slice(0, 8)}` };
}

export default async function PortalAppointmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const role = await getUserRole(sessionUser.userId);

  /* Admins use the control-panel route exclusively. */
  if (isAdminRole(role)) {
    redirect(appointmentDetailHref(role, id));
  }

  const { level, raw } = await resolveAppointmentAccess(
    { userId: sessionUser.userId, email: sessionUser.email, role },
    id
  );

  if (level === "none" || !raw) notFound();

  const backHref = role === "patient" ? "/patient-portal" : "/doctor-portal";

  return (
    <AppointmentDetailScreen
      accessLevel={level}
      viewerRole={role}
      backHref={backHref}
      variant="portal"
      raw={raw}
    />
  );
}
