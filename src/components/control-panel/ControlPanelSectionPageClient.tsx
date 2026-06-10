"use client";

import { useEffect, useLayoutEffect, useMemo, type ReactNode } from "react";
import { seedInvoicesListCacheFromSsr } from "@/lib/invoices-query-ssr-seed";
import {
  seedCategoriesListCacheFromSsr,
  seedDoctorsDirectoryCacheFromSsr,
  seedPatientsListCacheFromSsr,
  seedUsersListCacheFromSsr,
  seedDashboardOverviewCacheFromSsr,
  seedOrganizationsListCacheFromSsr,
  seedNotificationsCacheFromSsr,
  seedAppointmentsListCacheFromSsr,
  seedAdminAllAppointmentTypesCacheFromSsr,
  seedInvitationsCacheFromSsr,
  seedGoogleCalendarStatusCacheFromSsr,
  seedDashboardAccessAcceptedCacheFromSsr,
  seedOrgBillingCacheFromSsr,
} from "@/lib/cp-list-query-ssr-seed";
import { CP_ADMIN_USERS_FILTERS } from "@/lib/control-panel-users-filters";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateInvoicesAndOverview } from "@/lib/query-client";
import { seedControlPanelSectionCache } from "@/lib/ssr-query-seed";
import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";
import type { ControlPanelSectionPrefetchPayload } from "@/lib/control-panel-section-prefetch";
import { ControlPanelMobileNav } from "@/components/control-panel/ControlPanelMobileNav";
import { ControlPanelMobileSectionTabs } from "@/components/control-panel/ControlPanelMobileSectionTabs";
import { ControlPanelChromeRegistryProvider } from "@/components/control-panel/ControlPanelChromeContext";
import {
  ControlPanelChromeActionsSlot,
  ControlPanelChromeDescriptionSlot,
  ControlPanelChromeToolbarSlot,
} from "@/components/control-panel/ControlPanelChromeSlots";
import { ControlPanelSectionContent } from "@/components/control-panel/ControlPanelSectionContent";
import {
  pageChromeTitleStackClass,
  pageHeaderRootClass,
} from "@/lib/page-chrome-classes";
import { cn } from "@/lib/utils";
import { ControlPanelSectionInitialProvider } from "@/components/control-panel/ControlPanelSectionInitialContext";

type Props = {
  tab: ControlPanelSidebarTabValue;
  initial: ControlPanelSectionPrefetchPayload | null;
  /** Config subtitle — shown until a section registers `description` override. */
  defaultDescription?: string;
  /** SSR icon tile — when omitted, sections render full `ControlPanelPageChrome` (legacy). */
  serverChromeIcon?: ReactNode;
  /** SSR title node — server component passed as child. */
  serverChromeTitle?: ReactNode;
  /** SSR action shells — first paint before client registry populates. */
  serverChromeActions?: ReactNode;
};

/** Seeds SSR prefetch + merged sticky header (SSR left + client actions slot) + section body. */
export function ControlPanelSectionPageClient({
  tab,
  initial,
  defaultDescription,
  serverChromeIcon,
  serverChromeTitle,
  serverChromeActions,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  /** Sync seed before section children subscribe (invoice parity for all entity lists). */
  useMemo(() => {
    if (initial?.invoices != null) {
      seedInvoicesListCacheFromSsr(queryClient, initial.invoices);
    }
    if (initial?.patients != null) {
      seedPatientsListCacheFromSsr(queryClient, initial.patients);
    }
    if (initial?.categories != null) {
      seedCategoriesListCacheFromSsr(queryClient, initial.categories);
    }
    if (initial?.doctorsDirectory != null) {
      seedDoctorsDirectoryCacheFromSsr(queryClient, initial.doctorsDirectory);
    }
    if (initial?.adminUsers != null) {
      seedUsersListCacheFromSsr(queryClient, CP_ADMIN_USERS_FILTERS, initial.adminUsers);
    }
    if (initial?.dashboardOverview != null) {
      seedDashboardOverviewCacheFromSsr(
        queryClient,
        initial.dashboardOverview,
        initial.dashboardOverviewUpdatedAt
      );
    }
    if (initial?.organizations != null) {
      seedOrganizationsListCacheFromSsr(queryClient, initial.organizations);
    }
    if (initial?.notifications != null) {
      seedNotificationsCacheFromSsr(
        queryClient,
        initial.notifications,
        initial.notificationsPrefetchUpdatedAt
      );
    }
    if (initial?.appointments != null) {
      seedAppointmentsListCacheFromSsr(queryClient, initial.appointments);
    }
    if (initial?.adminAllAppointmentTypes != null) {
      seedAdminAllAppointmentTypesCacheFromSsr(queryClient, initial.adminAllAppointmentTypes);
    }
    if (initial?.appointmentInvitations != null) {
      seedInvitationsCacheFromSsr(queryClient, "appointment", initial.appointmentInvitations);
    }
    if (initial?.dashboardInvitations != null) {
      seedInvitationsCacheFromSsr(queryClient, "dashboard", initial.dashboardInvitations);
    }
    if (initial?.googleCalendarStatus != null) {
      seedGoogleCalendarStatusCacheFromSsr(queryClient, initial.googleCalendarStatus);
    }
    if (initial?.dashboardAccessAccepted != null) {
      seedDashboardAccessAcceptedCacheFromSsr(queryClient, initial.dashboardAccessAccepted);
    }
    if (initial?.orgBillingInvoicesByOrgId != null) {
      seedOrgBillingCacheFromSsr(queryClient, initial.orgBillingInvoicesByOrgId);
    }
    return null;
  }, [
    queryClient,
    initial?.invoices,
    initial?.patients,
    initial?.categories,
    initial?.doctorsDirectory,
    initial?.adminUsers,
    initial?.dashboardOverview,
    initial?.dashboardOverviewUpdatedAt,
    initial?.organizations,
    initial?.notifications,
    initial?.notificationsPrefetchUpdatedAt,
    initial?.appointments,
    initial?.adminAllAppointmentTypes,
    initial?.appointmentInvitations,
    initial?.dashboardInvitations,
    initial?.googleCalendarStatus,
    initial?.dashboardAccessAccepted,
    initial?.orgBillingInvoicesByOrgId,
  ]);

  /** Stripe return on invoice tab — bust overview/invoices without full reload. */
  useEffect(() => {
    if (searchParams.get("status") === "success") {
      void invalidateInvoicesAndOverview(queryClient);
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, queryClient, router, pathname]);

  useLayoutEffect(() => {
    if (!initial) return;
    seedControlPanelSectionCache(queryClient, initial);
  }, [queryClient, initial]);

  const mergedServerChrome =
    serverChromeIcon != null && serverChromeTitle != null;

  const body = (
    <>
      <ControlPanelMobileNav activeTab={tab} />
      <ControlPanelMobileSectionTabs activeTab={tab} />
      <ControlPanelSectionContent tab={tab} />
    </>
  );

  if (!mergedServerChrome) {
    return <div className="w-full text-gray-700">{body}</div>;
  }

  return (
    <ControlPanelSectionInitialProvider initial={initial}>
      <ControlPanelChromeRegistryProvider defaultDescription={defaultDescription ?? ""} activeTab={tab}>
        <div className="flex w-full flex-col text-gray-700">
          {/* Body renders first so ControlPanelChromeActions registers before ActionsSlot reads store. */}
          <div className="order-2">{body}</div>
          {/* Merged header: SSR icon/title + client description + client actions in one sticky row */}
          <div className={cn(pageHeaderRootClass, "order-1")}>
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-stretch sm:justify-between">
              <div className="flex min-w-0 flex-1 items-stretch gap-2">
                {serverChromeIcon}
                <div className={pageChromeTitleStackClass}>
                  {serverChromeTitle}
                  <ControlPanelChromeDescriptionSlot />
                </div>
              </div>
              <ControlPanelChromeActionsSlot tab={tab} serverChromeActions={serverChromeActions} />
            </div>
            <ControlPanelChromeToolbarSlot />
          </div>
        </div>
      </ControlPanelChromeRegistryProvider>
    </ControlPanelSectionInitialProvider>
  );
}
