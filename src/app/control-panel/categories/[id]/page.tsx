/**
 * Admin category detail — control-panel shell.
 */
export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { getUserRole, isAdminRole, isDoctorRole, isPatientRole } from "@/lib/rbac";
import { categoryDetailHref } from "@/lib/entity-routes";
import { loadCategoryDetailData } from "@/lib/category-detail-data";
import { ControlPanelCategoryDetailScreen } from "@/components/control-panel/CategoryDetailScreen";
import { prefetchCategory, prefetchCategorySnapshot, prefetchUsersList } from "@/lib/server-prefetch";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const data = isValidUUID(id) ? await loadCategoryDetailData(id) : null;
  return {
    title: data?.cat.label ? `Category: ${data.cat.label}` : `Category — ${id.slice(0, 8)}`,
  };
}

export default async function ControlPanelCategoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const role = await getUserRole(sessionUser.userId);
  if (isDoctorRole(role) || isPatientRole(role)) {
    redirect(categoryDetailHref(role, id));
  }
  if (!isAdminRole(role)) notFound();

  const [data, initialCategory, initialSnapshot, initialDoctorUsers, initialAdminUsers] =
    await Promise.all([
      loadCategoryDetailData(id),
      prefetchCategory(id),
      prefetchCategorySnapshot(id),
      prefetchUsersList({ role: "doctor", limit: 200 }),
      prefetchUsersList({ role: "admin", limit: 50 }),
    ]);
  if (!data) notFound();

  return (
    <ControlPanelCategoryDetailScreen
      categoryId={id}
      viewerRole={role}
      listBackHref="/control-panel/category-management"
      initialCategory={initialCategory}
      initialSnapshot={initialSnapshot}
      initialDoctorUsers={initialDoctorUsers}
      initialAdminUsers={initialAdminUsers}
    />
  );
}
