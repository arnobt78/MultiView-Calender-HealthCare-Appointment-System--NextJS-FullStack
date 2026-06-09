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
  prefetchDashboardAccessAccepted,
  prefetchGlobalAppointmentTypes,
  prefetchOrganizations,
  prefetchPatients,
  prefetchInvoices,
  prefetchBillingAppointmentOptions,
  prefetchNotifications,
  prefetchCalendarAppointmentsBundle,
  prefetchDoctors,
} from "@/lib/server-prefetch";
import { prefetchOrgBillingInvoicesByOrgIds } from "@/lib/org-billing-prefetch";
import type { OrgBillingCachePayload } from "@/lib/org-billing-prefetch";

/** SSR payload keyed by section — seeded in `ControlPanelSectionPageClient` before paint. */
export type ControlPanelSectionPrefetchPayload = {
  dashboardOverview?: DashboardOverview | null;
  patients?: Patient[] | null;
  categories?: Category[] | null;
  organizations?: Organization[] | null;
  globalAppointmentTypes?: GlobalAppointmentType[] | null;
  invoices?: Invoice[] | null;
  /** Default visit picker for Create Invoice dialog (empty search, eligible visits only). */
  billingAppointmentOptions?: { options: import("@/lib/billing-types").InvoiceAppointmentOptionRow[] } | null;
  notifications?: NotificationsPrefetch | null;
  appointments?: FullAppointment[] | null;
  assignees?: AppointmentAssignee[] | null;
  dashboardAccessAccepted?: DashboardAccessRow[] | null;
  /** Doctor directory — seeds queryKeys.doctors.all on doctor-management tab. */
  doctorsDirectory?: { doctors: import("@/lib/server-prefetch").DoctorPrefetchRow[] } | null;
  /** Every org on CP org tab — seeds `queryKeys.invoices.byOrganization(id)`. */
  orgBillingInvoicesByOrgId?: Record<string, OrgBillingCachePayload>;
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
      return {
        dashboardOverview: await prefetchDashboardOverview(userId, role, email),
      };
    case "patients":
      return { patients: await prefetchPatients() };
    case "categories":
      return { categories: await prefetchCategories() };
    case "organizations": {
      const organizations = await prefetchOrganizations(userId);
      const orgBillingInvoicesByOrgId = organizations?.length
        ? await prefetchOrgBillingInvoicesByOrgIds(
            organizations.map((o) => o.id),
            userId,
            role,
            email
          )
        : {};
      return { organizations, orgBillingInvoicesByOrgId };
    }
    case "visit_types_global":
      return { globalAppointmentTypes: await prefetchGlobalAppointmentTypes() };
    case "invoices": {
      const [invoices, billingAppointmentOptions] = await Promise.all([
        prefetchInvoices(userId, role, email),
        prefetchBillingAppointmentOptions(userId, role),
      ]);
      return { invoices, billingAppointmentOptions };
    }
    case "appointment":
    case "appointments_mgmt":
    case "telehealth":
      return prefetchCalendarAppointmentsBundle(userId, email);
    case "dashboard":
      return {
        dashboardAccessAccepted: await prefetchDashboardAccessAccepted(userId, email),
      };
    case "notifications":
      return { notifications: await prefetchNotifications(userId) };
    case "doctors":
      return { doctorsDirectory: await prefetchDoctors() };
    default:
      return {};
  }
}
