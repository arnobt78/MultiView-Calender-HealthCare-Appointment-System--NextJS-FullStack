/**
 * Section-scoped SSR prefetch for dedicated CP list routes.
 *
 * Seeded cache keys (via ControlPanelSectionPageClient):
 *   overview          → queryKeys.dashboard.overview
 *   patients          → queryKeys.patients.all
 *   categories        → queryKeys.categories.all
 *   organizations     → queryKeys.organizations.all
 *   visit_types_global→ queryKeys.appointmentTypes.all (admin-all shape)
 *   invoices          → queryKeys.invoices.all
 *   notifications     → queryKeys.notifications.all
 *   doctors           → queryKeys.doctors.all + useUsers(CP_DOCTOR_USERS_FILTERS) (layout also seeds doctor users)
 *   appointments_mgmt / telehealth → appointments.all + categories/patients/assignees/dashboardAccess.accepted (+ invoices.all on appointments_mgmt)
 */

import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";
import type { DashboardOverview } from "@/hooks/useDashboardOverview";
import type { Organization } from "@/hooks/useOrganization";
import type { FullAppointment } from "@/hooks/useAppointments";
import type { Invoice } from "@/hooks/usePayments";
import type { Category, Patient, AppointmentAssignee } from "@/types/types";
import type { DashboardAccessRow } from "@/lib/query-fetchers";
import type { GlobalAppointmentType, NotificationsPrefetch } from "@/lib/server-prefetch";
import type { GoogleCalendarStatus } from "@/types/google-calendar";
import type { AdminAllTypeRow } from "@/hooks/useAppointmentTypes";
import {
  prefetchCategories,
  prefetchDashboardOverview,
  prefetchDashboardAccessAccepted,
  prefetchAdminAllAppointmentTypes,
  prefetchOrganizations,
  prefetchPatients,
  prefetchInvoices,
  prefetchBillingAppointmentOptions,
  prefetchNotifications,
  prefetchCalendarAppointmentsBundle,
  prefetchDoctors,
  prefetchUsersList,
  prefetchInvitationsForUser,
  prefetchGoogleCalendarStatus,
} from "@/lib/server-prefetch";
import {
  CP_ADMIN_USERS_FILTERS,
  CP_DOCTOR_USERS_FILTERS,
} from "@/lib/control-panel-users-filters";
import type { UsersListResponse } from "@/hooks/useUsers";
import { prefetchOrgBillingInvoicesByOrgIds } from "@/lib/org-billing-prefetch";
import type { OrgBillingCachePayload } from "@/lib/org-billing-prefetch";
import type { InvoiceBillingTotalsPayload } from "@/lib/invoice-billing-totals";

/** SSR payload keyed by section — seeded in `ControlPanelSectionPageClient` before paint. */
export type ControlPanelSectionPrefetchPayload = {
  dashboardOverview?: DashboardOverview | null;
  /** Frozen at SSR prefetch — seeds TanStack `updatedAt` so subtitle time matches server + client hydrate. */
  dashboardOverviewUpdatedAt?: number;
  patients?: Patient[] | null;
  categories?: Category[] | null;
  organizations?: Organization[] | null;
  globalAppointmentTypes?: GlobalAppointmentType[] | null;
  /** Admin-all shape for visit_types_global tab — seeds queryKeys.appointmentTypes.all. */
  adminAllAppointmentTypes?: {
    globalTypes: AdminAllTypeRow[];
    customTypes: AdminAllTypeRow[];
  } | null;
  appointmentInvitations?: import("@/hooks/useInvitations").Invitation[] | null;
  dashboardInvitations?: import("@/hooks/useInvitations").Invitation[] | null;
  googleCalendarStatus?: GoogleCalendarStatus | null;
  /** Server read of ?gcal=connected — first-paint spinner before useSearchParams hydrates. */
  gcalOAuthReturn?: boolean;
  invoices?: Invoice[] | null;
  /** Default visit picker for Create Invoice dialog (empty search, eligible visits only). */
  billingAppointmentOptions?: { options: import("@/lib/billing-types").InvoiceAppointmentOptionRow[] } | null;
  notifications?: NotificationsPrefetch | null;
  /** Frozen at SSR prefetch — seeds TanStack `updatedAt` so notifications subtitle time matches hydrate. */
  notificationsPrefetchUpdatedAt?: number;
  appointments?: FullAppointment[] | null;
  assignees?: AppointmentAssignee[] | null;
  dashboardAccessAccepted?: DashboardAccessRow[] | null;
  /** Doctor directory — seeds queryKeys.doctors.all on doctor-management tab. */
  doctorsDirectory?: { doctors: import("@/lib/server-prefetch").DoctorPrefetchRow[] } | null;
  /**
   * Doctor user roster — seeds useUsers(CP_DOCTOR_USERS_FILTERS) on doctor-management tab.
   * CP layout also seeds the same key for sidebar pickers; section prefetch keeps the tab self-contained.
   */
  doctorUsers?: UsersListResponse | null;
  /** Admin roster — seeds useUsers(CP_ADMIN_USERS_FILTERS) on user-admin-management tab. */
  adminUsers?: UsersListResponse | null;
  /** Every org on CP org tab — seeds `queryKeys.invoices.byOrganization(id)`. */
  orgBillingInvoicesByOrgId?: Record<string, OrgBillingCachePayload>;
  /** Invoice hub doctor scope — seeds `queryKeys.invoices.byDoctor(id)`. */
  doctorBillingByDoctorId?: Record<string, OrgBillingCachePayload>;
  /** Invoice hub all-scope KPI — seeds `queryKeys.invoices.viewerTotals`. */
  invoiceViewerBillingTotals?: InvoiceBillingTotalsPayload;
  /** Invoice hub URL scope — seeded from invoice-management/page.tsx searchParams. */
  invoiceManagementViewerRole?: string | null;
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
    case "overview": {
      const dashboardOverviewUpdatedAt = Date.now();
      return {
        dashboardOverview: await prefetchDashboardOverview(userId, role, email),
        dashboardOverviewUpdatedAt,
      };
    }
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
      return { adminAllAppointmentTypes: await prefetchAdminAllAppointmentTypes() };
    case "invoices": {
      const [invoices, billingAppointmentOptions] = await Promise.all([
        prefetchInvoices(userId, role, email),
        prefetchBillingAppointmentOptions(userId, role),
      ]);
      return { invoices, billingAppointmentOptions };
    }
    case "appointments_mgmt": {
      const [bundle, invoices] = await Promise.all([
        prefetchCalendarAppointmentsBundle(userId, email),
        prefetchInvoices(userId, role, email),
      ]);
      return { ...bundle, invoices };
    }
    case "telehealth":
      return prefetchCalendarAppointmentsBundle(userId, email);
    case "appointment": {
      const bundle = await prefetchInvitationsForUser(userId, email);
      return {
        appointmentInvitations: (bundle?.appointmentInvitations ??
          []) as import("@/hooks/useInvitations").Invitation[],
      };
    }
    case "dashboard": {
      const access = await prefetchDashboardAccessAccepted(userId, email);
      const bundle = await prefetchInvitationsForUser(userId, email);
      return {
        dashboardAccessAccepted: access,
        dashboardInvitations: (bundle?.dashboardInvitations ??
          []) as import("@/hooks/useInvitations").Invitation[],
      };
    }
    case "notifications": {
      const notificationsPrefetchUpdatedAt = Date.now();
      return {
        notifications: await prefetchNotifications(userId),
        notificationsPrefetchUpdatedAt,
      };
    }
    case "doctors": {
      const [doctorsDirectory, doctorUsers] = await Promise.all([
        prefetchDoctors(),
        prefetchUsersList(CP_DOCTOR_USERS_FILTERS),
      ]);
      return { doctorsDirectory, doctorUsers };
    }
    case "users_admin":
      return { adminUsers: await prefetchUsersList(CP_ADMIN_USERS_FILTERS) };
    case "google-calendar":
      return { googleCalendarStatus: await prefetchGoogleCalendarStatus(userId) };
    default:
      return {};
  }
}
