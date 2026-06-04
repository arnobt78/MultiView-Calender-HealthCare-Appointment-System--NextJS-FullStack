/**
 * Doctor profile for portal users — `/doctors/:id`.
 * Doctor: self or directory colleagues. Patient: primary doctor from `/services`.
 * SSR seeds user + snapshot + assigned patients + staff directory (appointment table portraits).
 */
export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { getUserRole, isAdminRole, isDoctorRole } from "@/lib/rbac";
import { doctorDetailHref } from "@/lib/entity-routes";
import { canViewDoctorPortalProfile } from "@/lib/doctor-access";
import { userDetailInclude } from "@/lib/user-api-include";
import { serializeUser } from "@/lib/serializers";
import { fetchDoctorAssignedPatients } from "@/lib/doctor-assigned-patients";
import { canClientFetchAdminUsersList } from "@/lib/user-list-access";
import { DoctorDetailScreen } from "@/components/detail/DoctorDetailScreen";
import {
  prefetchDoctorSnapshot,
  prefetchUsersList,
} from "@/lib/server-prefetch";

type PageProps = { params: Promise<{ id: string }> };

export default async function PortalDoctorDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const role = await getUserRole(sessionUser.userId);
  if (isAdminRole(role)) redirect(doctorDetailHref(role, id));

  const canView = await canViewDoctorPortalProfile(
    { userId: sessionUser.userId, email: sessionUser.email, role },
    id
  );
  if (!canView) notFound();

  const raw = await prisma.user.findFirst({
    where: { id, role: "doctor" },
    include: userDetailInclude,
  });
  if (!raw) notFound();

  const staffRoster = isDoctorRole(role);
  const [initialSnapshot, initialAssignedPatients, initialDoctorUsers, initialAdminUsers] =
    await Promise.all([
      prefetchDoctorSnapshot(id),
      fetchDoctorAssignedPatients(id),
      prefetchUsersList({ role: "doctor", limit: 200 }),
      staffRoster && canClientFetchAdminUsersList(role)
        ? prefetchUsersList({ role: "admin", limit: 50 })
        : Promise.resolve(null),
    ]);

  const initialUser = serializeUser(raw);

  /** Directory links from `/services` — back to catalog for doctor and patient roles. */
  const backHref = role === "patient" ? "/services" : role === "doctor" ? "/services" : "/dashboard";

  return (
    <DoctorDetailScreen
      doctorId={id}
      viewerRole={role}
      backHref={backHref}
      initialUser={initialUser}
      initialSnapshot={initialSnapshot}
      initialAssignedPatients={initialAssignedPatients}
      initialDoctorUsers={initialDoctorUsers}
      initialAdminUsers={initialAdminUsers}
    />
  );
}
