/**
 * Doctor/patient category detail — `/categories/:id`.
 */
export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { getUserRole, isAdminRole, isDoctorRole, isPatientRole } from "@/lib/rbac";
import { canClientFetchAdminUsersList } from "@/lib/user-list-access";
import { categoryDetailHref } from "@/lib/entity-routes";
import { loadCategoryDetailData } from "@/lib/category-detail-data";
import { CategoryDetailScreen } from "@/components/detail/CategoryDetailScreen";
import { prefetchCategory, prefetchCategorySnapshot, prefetchUsersList } from "@/lib/server-prefetch";

type PageProps = { params: Promise<{ id: string }> };

export default async function PortalCategoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const role = await getUserRole(sessionUser.userId);
  if (isAdminRole(role)) redirect(categoryDetailHref(role, id));
  if (!isDoctorRole(role) && !isPatientRole(role)) notFound();

  const [data, initialCategory, initialSnapshot, initialDoctorUsers, initialAdminUsers] =
    await Promise.all([
      loadCategoryDetailData(id),
      prefetchCategory(id),
      prefetchCategorySnapshot(id),
      prefetchUsersList({ role: "doctor", limit: 200 }),
      canClientFetchAdminUsersList(role)
        ? prefetchUsersList({ role: "admin", limit: 50 })
        : Promise.resolve(null),
    ]);
  if (!data) notFound();

  const backHref = isPatientRole(role)
    ? "/patient-portal"
    : isDoctorRole(role)
      ? "/doctor-portal"
      : "/dashboard";

  return (
    <CategoryDetailScreen
      categoryId={id}
      initialCategory={initialCategory}
      initialSnapshot={initialSnapshot}
      viewerRole={role}
      backHref={backHref}
      initialDoctorUsers={initialDoctorUsers}
      initialAdminUsers={initialAdminUsers}
    />
  );
}
