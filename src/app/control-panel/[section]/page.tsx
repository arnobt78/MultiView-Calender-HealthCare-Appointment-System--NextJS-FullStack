// Control Panel section page — Server Component (async)
// Pre-fetches dashboard overview, patient list, or category list so ControlPanelPage
// can seed the TanStack Query cache on first render — tabs show data instantly without a loading flash.

export const dynamic = "force-dynamic";

import ControlPanelPage from "@/components/pages/ControlPanelPage";
import { getSessionUser } from "@/lib/session";
import {
  prefetchDashboardOverview,
  prefetchPatients,
  prefetchCategories,
  prefetchOrganizations,
} from "@/lib/server-prefetch";
import type { Category, Patient } from "@/types/types";
import type { DashboardOverview } from "@/hooks/useDashboardOverview";
import type { Organization } from "@/hooks/useOrganization";

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
  let initialCategories: Category[] | null = null;
  let initialOrganizations: Organization[] | null = null;

  if (sessionUser) {
    const prefetchJobs: [
      Promise<DashboardOverview | null>,
      Promise<Patient[] | null>,
      Promise<Category[] | null>,
      Promise<Organization[] | null>,
    ] = [
      Promise.resolve(null),
      Promise.resolve(null),
      Promise.resolve(null),
      Promise.resolve(null),
    ];

    if (section === "dashboard-overview") {
      prefetchJobs[0] = prefetchDashboardOverview(sessionUser.userId);
    }
    if (section === "patient-management") {
      prefetchJobs[1] = prefetchPatients();
    }
    if (section === "category-management") {
      prefetchJobs[2] = prefetchCategories();
    }
    if (section === "organization-management") {
      prefetchJobs[3] = prefetchOrganizations(sessionUser.userId);
    }

    [initialDashboardOverview, initialPatients, initialCategories, initialOrganizations] =
      await Promise.all(prefetchJobs);
  }

  return (
    <ControlPanelPage
      initialSession={sessionUser}
      initialTab={initialTab}
      initialDashboardOverview={initialDashboardOverview}
      initialPatients={initialPatients}
      initialCategories={initialCategories}
      initialOrganizations={initialOrganizations}
    />
  );
}
