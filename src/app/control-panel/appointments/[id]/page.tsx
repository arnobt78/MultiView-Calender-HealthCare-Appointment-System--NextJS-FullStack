/**
 * Admin appointment detail — control-panel shell.
 * Access: `resolveAppointmentAccess` (admin views all; mutate only when owner/assignee editor).
 */
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";
import { isValidUUID } from "@/lib/validation";
import { resolveAppointmentAccess } from "@/lib/appointment-access";
import { AppointmentDetailScreen } from "@/components/detail/AppointmentDetailScreen";
import { EntityUnavailableScreen } from "@/components/shared/EntityUnavailableScreen";
import { prefetchAppointmentDetailViewModel, prefetchInvoices, prefetchUsersList, prefetchGoogleCalendarStatus, prefetchDoctors } from "@/lib/server-prefetch";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Appointment — ${id.slice(0, 8)}` };
}

export default async function ControlPanelAppointmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const role = await getUserRole(sessionUser.userId);
  if (!isAdminRole(role)) notFound();

  const session = {
    userId: sessionUser.userId,
    email: sessionUser.email,
    role,
  };

  const { level, raw } = await resolveAppointmentAccess(session, id);
  if (level === "none" || !raw) {
    return <EntityUnavailableScreen kind="appointment" variant="control-panel" />;
  }

  const [initialDetail, initialDoctorUsers, initialAdminUsers, initialInvoices, initialGoogleCalendarStatus, initialDoctorsDirectory] =
    await Promise.all([
      prefetchAppointmentDetailViewModel(raw, role, level),
      prefetchUsersList({ role: "doctor", limit: 200 }),
      prefetchUsersList({ role: "admin", limit: 50 }),
      prefetchInvoices(sessionUser.userId, role, sessionUser.email),
      prefetchGoogleCalendarStatus(sessionUser.userId),
      prefetchDoctors(),
    ]);

  if (!initialDetail) {
    return <EntityUnavailableScreen kind="appointment" variant="control-panel" />;
  }

  return (
    <AppointmentDetailScreen
      backHref="/control-panel/appointment-management"
      variant="control-panel"
      initialDetail={initialDetail}
      initialDoctorUsers={initialDoctorUsers}
      initialAdminUsers={initialAdminUsers}
      initialInvoices={initialInvoices}
      initialGoogleCalendarStatus={initialGoogleCalendarStatus}
      initialDoctorsDirectory={initialDoctorsDirectory}
    />
  );
}
