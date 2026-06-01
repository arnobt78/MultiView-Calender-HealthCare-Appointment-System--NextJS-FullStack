// Doctor Portal — SSR prefetch + inline pulse fallback (no Suspense).

import DoctorPortalPage from "@/components/pages/DoctorPortalPage";
import { DoctorPortalPageSkeleton } from "@/components/pages/DoctorPortalPageSkeleton";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prefetchDoctorPortalSettings } from "@/lib/doctor-portal-settings-prefetch";
import { prefetchDoctorPortal, prefetchInvoices } from "@/lib/server-prefetch";
import type { Invoice } from "@/hooks/usePayments";
import { getUserRole, isDoctorRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export const metadata = { title: "Doctor Portal — HealthCal Pro" };

export default async function DoctorPortalRoute() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const role = await getUserRole(session.userId);
  if (!isDoctorRole(role)) redirect("/control-panel/dashboard-overview");

  const [initialData, initialScheduleSettings, initialInvoices] = await Promise.all([
    prefetchDoctorPortal(session.userId),
    prefetchDoctorPortalSettings(session.userId),
    prefetchInvoices(session.userId, role, session.email),
  ]);

  if (!initialData) {
    return <DoctorPortalPageSkeleton />;
  }

  return (
    <DoctorPortalPage
      initialData={initialData}
      initialScheduleSettings={initialScheduleSettings}
      initialInvoices={(initialInvoices ?? []) as Invoice[]}
    />
  );
}
