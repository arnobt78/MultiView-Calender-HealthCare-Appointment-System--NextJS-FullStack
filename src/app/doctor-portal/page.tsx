// Doctor Portal — async Server Component
// Pre-fetches portal summary + schedule settings (weekly hours, time off, visit types)
// so DoctorPortalPage seeds TanStack Query on first paint — no skeleton flash on refresh.
//
// RBAC: only users with the "doctor" role may access this route.
// Admin / secretary / patient are redirected to their respective dashboards.

import DoctorPortalPage from "@/components/pages/DoctorPortalPage";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prefetchDoctorPortalSettings } from "@/lib/doctor-portal-settings-prefetch";
import { prefetchDoctorPortal } from "@/lib/server-prefetch";
import type { DoctorPortalData } from "@/types/types";
import { getUserRole, isDoctorRole } from "@/lib/rbac";

export const metadata = { title: "Doctor Portal — HealthCal Pro" };

export default async function DoctorPortalRoute() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  // Only doctors may access this portal; redirect other roles to appropriate pages
  const role = await getUserRole(session.userId);
  if (!isDoctorRole(role)) redirect("/control-panel/dashboard-overview");

  const [initialData, initialScheduleSettings] = await Promise.all([
    prefetchDoctorPortal(session.userId),
    prefetchDoctorPortalSettings(session.userId),
  ]);

  return (
    <DoctorPortalPage
      initialData={initialData}
      initialScheduleSettings={initialScheduleSettings}
    />
  );
}
