/**
 * Doctor / patient appointment detail — dashboard shell (no control-panel sidebar).
 */
export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";
import { isValidUUID } from "@/lib/validation";
import { resolveAppointmentAccess } from "@/lib/appointment-access";
import { appointmentDetailHref } from "@/lib/entity-routes";
import { canClientFetchAdminUsersList } from "@/lib/user-list-access";
import { AppointmentDetailScreen } from "@/components/detail/AppointmentDetailScreen";
import { prefetchAppointmentDetailViewModel, prefetchInvoices, prefetchUsersList } from "@/lib/server-prefetch";

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

  if (isAdminRole(role)) {
    redirect(appointmentDetailHref(role, id));
  }

  const session = {
    userId: sessionUser.userId,
    email: sessionUser.email,
    role,
  };

  const { level, raw } = await resolveAppointmentAccess(session, id);
  if (level === "none" || !raw) notFound();

  const [initialDetail, initialDoctorUsers, initialAdminUsers, initialInvoices] =
    await Promise.all([
      prefetchAppointmentDetailViewModel(raw, role, level),
      prefetchUsersList({ role: "doctor", limit: 200 }),
      canClientFetchAdminUsersList(role)
        ? prefetchUsersList({ role: "admin", limit: 50 })
        : Promise.resolve(null),
      prefetchInvoices(sessionUser.userId, role, sessionUser.email),
    ]);

  if (!initialDetail) notFound();

  const backHref = role === "patient" ? "/patient-portal" : "/doctor-portal";

  return (
    <AppointmentDetailScreen
      backHref={backHref}
      variant="portal"
      initialDetail={initialDetail}
      initialDoctorUsers={initialDoctorUsers}
      initialAdminUsers={initialAdminUsers}
      initialInvoices={initialInvoices}
    />
  );
}
