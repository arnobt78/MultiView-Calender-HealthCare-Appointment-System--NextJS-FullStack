// Admin Portal — async Server Component
// Pre-fetches global clinic KPIs, doctor directory, and recent appointments
// so AdminPortalPage seeds TanStack Query cache before first paint.
//
// RBAC: only users with the "admin" role (new user default) may access this route.

import AdminPortalPage from "@/components/pages/AdminPortalPage";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prefetchAdminPortal } from "@/lib/server-prefetch";
import type { AdminPortalData } from "@/types/types";
import { getUserRole, isAdminRole } from "@/lib/rbac";

export const metadata = { title: "Admin Portal — HealthCal Pro" };

export default async function AdminPortalRoute() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const role = await getUserRole(session.userId);
  if (!isAdminRole(role)) redirect("/control-panel/dashboard-overview");

  const initialData: AdminPortalData | null = await prefetchAdminPortal();

  return <AdminPortalPage initialData={initialData} />;
}
