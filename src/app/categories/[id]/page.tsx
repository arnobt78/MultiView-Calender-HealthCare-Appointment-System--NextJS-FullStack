/**
 * Doctor category detail (read-only) — `/categories/:id`.
 */
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { getUserRole, isAdminRole, isDoctorRole, isPatientRole } from "@/lib/rbac";
import { categoryDetailHref } from "@/lib/entity-routes";
import { loadCategoryDetailData } from "@/lib/category-detail-data";
import { CategoryDetailScreen } from "@/components/detail/CategoryDetailScreen";

type PageProps = { params: Promise<{ id: string }> };

export default async function PortalCategoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const role = await getUserRole(sessionUser.userId);
  if (isAdminRole(role)) redirect(categoryDetailHref(role, id));
  // Portal category detail is read-only for doctor and patient (no CP edit routes).
  if (!isDoctorRole(role) && !isPatientRole(role)) notFound();

  const data = await loadCategoryDetailData(id);
  if (!data) notFound();

  const backHref = isPatientRole(role)
    ? "/patient-portal"
    : isDoctorRole(role)
      ? "/doctor-portal"
      : "/dashboard";

  return (
    <CategoryDetailScreen
      cat={data.cat}
      appointments={data.appointments}
      totalCount={data.totalCount}
      viewerRole={role}
      backHref={backHref}
    />
  );
}
