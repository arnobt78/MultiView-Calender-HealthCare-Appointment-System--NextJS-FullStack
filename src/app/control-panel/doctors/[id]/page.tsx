/**
 * Admin doctor detail — SSR seeds user; CP sidebar stays mounted.
 */
export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";
import { doctorDetailHref } from "@/lib/entity-routes";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { getUserRole } from "@/lib/rbac";
import { DoctorDetailScreen } from "@/components/control-panel/DoctorDetailScreen";
import { serializeUser } from "@/lib/serializers";

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
    select: {
      id: true,
      email: true,
      display_name: true,
      role: true,
      image: true,
      specialty: true,
      bio: true,
      created_at: true,
      phone: true,
      license_number: true,
      department: true,
      consultation_fee: true,
      office_location: true,
      languages_spoken: true,
      years_of_experience: true,
      is_active: true,
      active_since: true,
      patients_primary_doctor: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          active: true,
          birth_date: true,
        },
        orderBy: { firstname: "asc" },
        take: 50,
      },
    },
  });

  if (!raw) notFound();

  const initialUser = serializeUser(raw);
  const initialAssignedPatients = raw.patients_primary_doctor.map((p) => ({
    id: p.id,
    firstname: p.firstname,
    lastname: p.lastname,
    email: p.email,
    active: p.active,
    birth_date: p.birth_date?.toISOString() ?? null,
  }));

  return (
    <DoctorDetailScreen
      doctorId={id}
      canAdminEdit={callerRole === "admin"}
      listBackHref="/control-panel/doctor-management"
      scrollShell="control-panel"
      initialUser={initialUser}
      initialAssignedPatients={initialAssignedPatients}
    />
  );
}
