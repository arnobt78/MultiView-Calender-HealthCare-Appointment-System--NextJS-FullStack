// Control Panel section page — Server Component (async)
// Pre-fetches dashboard overview data and the patient list so ControlPanelPage
// can seed the TanStack Query cache on first render — overview and patient tabs
// both show data instantly without a loading flash.

export const dynamic = "force-dynamic";

import ControlPanelPage from "@/components/pages/ControlPanelPage";
import { getSessionUser } from "@/lib/session";
import {
  prefetchDashboardOverview,
  prefetchPatients,
} from "@/lib/server-prefetch";
import type { Patient } from "@/types/types";
import type { DashboardOverview } from "@/hooks/useDashboardOverview";

const SECTION_TO_TAB: Record<string, string> = {
  "dashboard-overview": "overview",
  "telehealth-queue": "telehealth",
  "appointment-access-invitation": "appointment",
  "user-dashboard-access-invitation": "dashboard",
  "patient-management": "patients",
  "category-management": "categories",
  "global-visit-types": "visit_types_global",
  "doctor-management": "doctors",
  "doctor-user-management": "doctors",
  "user-admin-management": "users_admin",
  "organization-management": "organizations",
  "invoice-management": "invoices",
  "appointment-management": "appointments_mgmt",
  notifications: "notifications",
  "google-calendar": "google-calendar",
};

export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const sessionUser = await getSessionUser();
  const initialTab = SECTION_TO_TAB[section] ?? "overview";

  // Pre-fetch overview + patient list in parallel so ControlPanelPage seeds
  // the cache immediately — both tabs render from cache on first visit.
  let initialDashboardOverview: DashboardOverview | null = null;
  let initialPatients: Patient[] | null = null;

  if (sessionUser) {
    const prefetchJobs: [
      Promise<DashboardOverview | null>,
      Promise<Patient[] | null>,
    ] = [Promise.resolve(null), Promise.resolve(null)];

    if (section === "dashboard-overview") {
      prefetchJobs[0] = prefetchDashboardOverview(sessionUser.userId);
    }
    if (section === "patient-management") {
      prefetchJobs[1] = prefetchPatients();
    }

    [initialDashboardOverview, initialPatients] = await Promise.all(prefetchJobs);
  }

  return (
    <ControlPanelPage
      initialSession={sessionUser}
      initialTab={initialTab}
      initialDashboardOverview={initialDashboardOverview}
      initialPatients={initialPatients}
    />
  );
}
