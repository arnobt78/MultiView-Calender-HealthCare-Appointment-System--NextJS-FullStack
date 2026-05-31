import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";
import type { DashboardOverview } from "@/hooks/useDashboardOverview";
import type { Organization } from "@/hooks/useOrganization";
import type { Category, Patient } from "@/types/types";
import type { GlobalAppointmentType } from "@/lib/server-prefetch";
import {
  prefetchCategories,
  prefetchDashboardOverview,
  prefetchGlobalAppointmentTypes,
  prefetchOrganizations,
  prefetchPatients,
} from "@/lib/server-prefetch";

/** SSR payload keyed by section — seeded in `ControlPanelSectionPageClient` before paint. */
export type ControlPanelSectionPrefetchPayload = {
  dashboardOverview?: DashboardOverview | null;
  patients?: Patient[] | null;
  categories?: Category[] | null;
  organizations?: Organization[] | null;
  globalAppointmentTypes?: GlobalAppointmentType[] | null;
};

/**
 * Section-scoped server prefetch — only fetches data the active tab needs (no 15-tab mount).
 */
export async function prefetchControlPanelSection(
  tab: ControlPanelSidebarTabValue,
  userId: string
): Promise<ControlPanelSectionPrefetchPayload> {
  switch (tab) {
    case "overview":
      return { dashboardOverview: await prefetchDashboardOverview(userId) };
    case "patients":
      return { patients: await prefetchPatients() };
    case "categories":
      return { categories: await prefetchCategories() };
    case "organizations":
      return { organizations: await prefetchOrganizations(userId) };
    case "visit_types_global":
      return { globalAppointmentTypes: await prefetchGlobalAppointmentTypes() };
    default:
      return {};
  }
}
