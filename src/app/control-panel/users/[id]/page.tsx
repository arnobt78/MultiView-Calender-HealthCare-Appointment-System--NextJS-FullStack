/**
 * Admin user detail — SSR prefetch owned appointments + client screen.
 */
export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { userDetailInclude } from "@/lib/user-api-include";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { getUserRole } from "@/lib/rbac";
import { serializeUser } from "@/lib/serializers";
import { AdminUserDetailScreen } from "@/components/control-panel/AdminUserDetailScreen";
import { loadAdminUserOwnedAppointments } from "@/lib/admin-user-owned-appointments";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const u = await prisma.user.findUnique({
    where: { id },
    select: { display_name: true, email: true },
  });
  return { title: u?.display_name ?? u?.email ?? `User — ${id.slice(0, 8)}` };
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const callerRole = await getUserRole(sessionUser.userId);
  if (id !== sessionUser.userId && callerRole !== "admin") notFound();

  const raw = await prisma.user.findUnique({
    where: { id },
    include: userDetailInclude,
  });
  if (!raw) notFound();

  if (raw.role === "doctor") {
    redirect(`/control-panel/doctors/${id}`);
  }

  if (raw.role !== "admin") {
    notFound();
  }

  const ownedAppointments = await loadAdminUserOwnedAppointments(id, 20);

  return (
    <AdminUserDetailScreen
      userId={id}
      canAdminEdit={callerRole === "admin"}
      listBackHref="/control-panel/user-admin-management"
      scrollShell="control-panel"
      initialUser={serializeUser(raw)}
      appointmentCount={ownedAppointments.totalCount}
      emailVerified={raw.email_verified}
      initialAppointments={ownedAppointments.appointments}
    />
  );
}
