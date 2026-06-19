// Admin Portal — SSR prefetch + invoice seed; skeleton when prefetch fails.

import AdminPortalPage from "@/components/pages/AdminPortalPage";
import { AdminPortalPageSkeleton } from "@/components/pages/AdminPortalPageSkeleton";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prefetchAdminPortal, prefetchInvoices } from "@/lib/server-prefetch";
import type { AdminPortalData } from "@/types/types";
import type { Invoice } from "@/hooks/usePayments";
import { getUserRole, isAdminRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin Portal — HealthCal Pro" };

export default async function AdminPortalRoute() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const role = await getUserRole(session.userId);
  if (!isAdminRole(role)) redirect("/control-panel/dashboard-overview");

  const [initialData, initialInvoices] = await Promise.all([
    prefetchAdminPortal(),
    prefetchInvoices(session.userId, role, session.email),
  ]);

  if (!initialData) {
    return <AdminPortalPageSkeleton />;
  }

  return (
    <AdminPortalPage
      initialData={initialData as AdminPortalData}
      initialInvoices={(initialInvoices ?? []) as Invoice[]}
    />
  );
}
