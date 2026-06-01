/**
 * Section-scoped SSR prefetch for dedicated CP list routes.
 *
 * Seeded cache keys (via ControlPanelSectionPageClient):
 *   overview          → queryKeys.dashboard.overview
 *   patients          → queryKeys.patients.all
 *   categories        → queryKeys.categories.all
 *   organizations     → queryKeys.organizations.all
 *   visit_types_global→ queryKeys.appointmentTypes.global
 *   invoices          → queryKeys.invoices.all
 *   notifications     → queryKeys.notifications.all
 *   appointments_mgmt / telehealth → appointments.all + categories/patients/assignees/dashboardAccess.accepted
 */

import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";
import type { DashboardOverview } from "@/hooks/useDashboardOverview";
import type { Organization } from "@/hooks/useOrganization";
import type { FullAppointment } from "@/hooks/useAppointments";
import type { Invoice } from "@/hooks/usePayments";
import type { Category, Patient, AppointmentAssignee } from "@/types/types";
import type { DashboardAccessRow } from "@/lib/query-fetchers";
import type { GlobalAppointmentType, NotificationsPrefetch } from "@/lib/server-prefetch";
import {
  prefetchCategories,
  prefetchDashboardOverview,
  prefetchGlobalAppointmentTypes,
  prefetchOrganizations,
  prefetchPatients,
  prefetchInvoices,
  prefetchNotifications,
  prefetchCalendarAppointmentsBundle,
  prefetchDoctors,
} from "@/lib/server-prefetch";

/** SSR payload keyed by section — seeded in `ControlPanelSectionPageClient` before paint. */
export type ControlPanelSectionPrefetchPayload = {
  dashboardOverview?: DashboardOverview | null;
  patients?: Patient[] | null;
  categories?: Category[] | null;
  organizations?: Organization[] | null;
  globalAppointmentTypes?: GlobalAppointmentType[] | null;
  invoices?: Invoice[] | null;
  notifications?: NotificationsPrefetch | null;
  appointments?: FullAppointment[] | null;
  assignees?: AppointmentAssignee[] | null;
  dashboardAccessAccepted?: DashboardAccessRow[] | null;
  /** Doctor directory — seeds queryKeys.doctors.all on doctor-management tab. */
  doctorsDirectory?: { doctors: import("@/lib/server-prefetch").DoctorPrefetchRow[] } | null;
};

/**
 * Section-scoped server prefetch — only fetches data the active tab needs (no 15-tab mount).
 */
export async function prefetchControlPanelSection(
  tab: ControlPanelSidebarTabValue,
  userId: string,
  email: string,
  role: string | null
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
    case "invoices":
      return { invoices: await prefetchInvoices(userId, role, email) };
    case "appointments_mgmt":
    case "telehealth":
      return prefetchCalendarAppointmentsBundle(userId, email);
    case "notifications":
      return { notifications: await prefetchNotifications(userId) };
    case "doctors":
      return { doctorsDirectory: await prefetchDoctors() };
    default:
      return {};
  }
}
