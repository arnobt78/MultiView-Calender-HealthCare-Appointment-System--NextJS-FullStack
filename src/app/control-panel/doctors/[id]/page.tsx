/**
 * Admin doctor detail — SSR seeds user + assigned-patients query; CP sidebar stays mounted.
 */
export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";
import { doctorDetailHref } from "@/lib/entity-routes";
import { prisma } from "@/lib/prisma";
import { USER_API_SELECT } from "@/lib/user-api-select";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { getUserRole } from "@/lib/rbac";
import { DoctorDetailScreen } from "@/components/control-panel/DoctorDetailScreen";
import { serializeUser } from "@/lib/serializers";
import { fetchDoctorAssignedPatients } from "@/lib/doctor-assigned-patients";
import { canClientFetchAdminUsersList } from "@/lib/user-list-access";
import {
  prefetchDoctorSnapshot,
  prefetchUsersList,
} from "@/lib/server-prefetch";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const doc = await prisma.user.findUnique({ where: { id }, select: { display_name: true } });
  return { title: doc?.display_name ? `Dr. ${doc.display_name}` : `Doctor — ${id.slice(0, 8)}` };
}

export default async function DoctorDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const callerRole = await getUserRole(sessionUser.userId);
  if (isDoctorRole(callerRole) && id !== sessionUser.userId) {
    redirect(doctorDetailHref(callerRole, id));
  }
  if (!isAdminRole(callerRole) && id !== sessionUser.userId) notFound();

  const raw = await prisma.user.findUnique({
    where: { id },
    select: USER_API_SELECT,
  });

  if (!raw) notFound();

  const initialUser = serializeUser(raw);
  const [initialAssignedPatients, initialSnapshot, initialDoctorUsers, initialAdminUsers] =
    await Promise.all([
      fetchDoctorAssignedPatients(id),
      prefetchDoctorSnapshot(id),
      prefetchUsersList({ role: "doctor", limit: 200 }),
      canClientFetchAdminUsersList(callerRole)
        ? prefetchUsersList({ role: "admin", limit: 50 })
        : Promise.resolve(null),
    ]);

  return (
    <DoctorDetailScreen
      doctorId={id}
      canAdminEdit={callerRole === "admin"}
      listBackHref="/control-panel/doctor-management"
      initialUser={initialUser}
      initialSnapshot={initialSnapshot}
      initialAssignedPatients={initialAssignedPatients}
      initialDoctorUsers={initialDoctorUsers}
      initialAdminUsers={initialAdminUsers}
    />
  );
}
