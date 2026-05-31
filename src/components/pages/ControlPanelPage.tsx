"use client";

/**
 * @deprecated Use dedicated `/control-panel/[segment]` routes + `ControlPanelSectionPageClient`.
 * Thin wrapper kept for backwards compatibility — mounts one section only (no 15-tab shell).
 */

import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";
import type { ControlPanelSectionPrefetchPayload } from "@/lib/control-panel-section-prefetch";
import { ControlPanelSectionPageClient } from "@/components/control-panel/ControlPanelSectionPageClient";
import { ControlPanelPatientsTab } from "@/components/control-panel/ControlPanelSectionContent";
import type { Category, Patient } from "@/types/types";
import type { DashboardOverview } from "@/hooks/useDashboardOverview";
import type { Organization } from "@/hooks/useOrganization";

export { ControlPanelPatientsTab as PatientsTab };

type ControlPanelPageProps = {
  initialSession?: { userId: string; email: string } | null;
  initialTab?: string;
  initialDashboardOverview?: DashboardOverview | null;
  initialPatients?: Patient[] | null;
  initialCategories?: Category[] | null;
  initialOrganizations?: Organization[] | null;
};

export default function ControlPanelPage({
  initialTab = "overview",
  initialDashboardOverview,
  initialPatients,
  initialCategories,
  initialOrganizations,
}: ControlPanelPageProps) {
  const tab = (initialTab ?? "overview") as ControlPanelSidebarTabValue;
  const initial: ControlPanelSectionPrefetchPayload = {
    dashboardOverview: initialDashboardOverview,
    patients: initialPatients,
    categories: initialCategories,
    organizations: initialOrganizations,
  };

  return <ControlPanelSectionPageClient tab={tab} initial={initial} />;
}
