/**
 * Admin/staff user detail — doctors redirect to `/control-panel/doctors/[id]`.
 */
export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { USER_API_SELECT } from "@/lib/user-api-select";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { getUserRole } from "@/lib/rbac";
import { serializeUser } from "@/lib/serializers";
import { AdminUserDetailScreen } from "@/components/control-panel/AdminUserDetailScreen";

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
    select: {
      ...USER_API_SELECT,
      email_verified: true,
    },
  });
  if (!raw) notFound();

  if (raw.role === "doctor") {
    redirect(`/control-panel/doctors/${id}`);
  }

  const appointmentCount = await prisma.appointment.count({ where: { owner_id: id } });
  const listBackHref =
    raw.role === "patient"
      ? "/control-panel/user-admin-management"
      : "/control-panel/user-admin-management";

  return (
    <AdminUserDetailScreen
      userId={id}
      canAdminEdit={callerRole === "admin"}
      listBackHref={listBackHref}
      scrollShell="control-panel"
      initialUser={serializeUser(raw)}
      appointmentCount={appointmentCount}
      emailVerified={raw.email_verified}
    />
  );
}
