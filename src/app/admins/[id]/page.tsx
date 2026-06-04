/**
 * Portal admin account profile — `/admins/:id` (doctor viewers only).
 * Linked from doctor detail Related Appointments when calendar owner role is admin.
 */
export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { getUserRole, isAdminRole, isDoctorRole, isPatientRole } from "@/lib/rbac";
import { USER_API_SELECT } from "@/lib/user-api-select";
import { serializeUser } from "@/lib/serializers";
import { canViewAdminPortalProfile } from "@/lib/admin-portal-profile-access";
import { PortalAdminDetailScreen } from "@/components/detail/PortalAdminDetailScreen";

type PageProps = { params: Promise<{ id: string }> };

export default async function PortalAdminDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const role = await getUserRole(sessionUser.userId);
  if (isAdminRole(role)) redirect(`/control-panel/users/${id}`);
  if (isPatientRole(role)) notFound();
  if (!isDoctorRole(role)) notFound();

  const canView = await canViewAdminPortalProfile(
    { userId: sessionUser.userId, role },
    id
  );
  if (!canView) notFound();

  const raw = await prisma.user.findFirst({
    where: { id, role: "admin" },
    select: {
      ...USER_API_SELECT,
      email_verified: true,
    },
  });
  if (!raw) notFound();

  const appointmentCount = await prisma.appointment.count({ where: { owner_id: id } });
  const initialUser = serializeUser(raw);

  return (
    <PortalAdminDetailScreen
      userId={id}
      backHref="/services"
      initialUser={initialUser}
      appointmentCount={appointmentCount}
      emailVerified={Boolean(raw.email_verified)}
    />
  );
}
