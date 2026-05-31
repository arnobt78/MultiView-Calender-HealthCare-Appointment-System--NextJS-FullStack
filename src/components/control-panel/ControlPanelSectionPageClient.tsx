"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateInvoicesAndOverview } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";
import type { ControlPanelSectionPrefetchPayload } from "@/lib/control-panel-section-prefetch";
import { ControlPanelMobileNav } from "@/components/control-panel/ControlPanelMobileNav";
import { ControlPanelMobileSectionTabs } from "@/components/control-panel/ControlPanelMobileSectionTabs";
import { ControlPanelSectionContent } from "@/components/control-panel/ControlPanelSectionContent";

type Props = {
  tab: ControlPanelSidebarTabValue;
  initial: ControlPanelSectionPrefetchPayload | null;
};

/** Seeds SSR prefetch into TanStack cache + renders one CP section (mobile nav + body). */
export function ControlPanelSectionPageClient({ tab, initial }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  /** Stripe return on invoice tab — bust overview/invoices without full reload. */
  useEffect(() => {
    if (searchParams.get("status") === "success") {
      void invalidateInvoicesAndOverview(queryClient);
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, queryClient, router, pathname]);

  useLayoutEffect(() => {
    if (!initial) return;
    if (initial.dashboardOverview != null) {
      queryClient.setQueryData(queryKeys.dashboard.overview, initial.dashboardOverview);
    }
    if (initial.patients != null) {
      queryClient.setQueryData(queryKeys.patients.all, initial.patients);
    }
    if (initial.categories != null) {
      queryClient.setQueryData(queryKeys.categories.all, initial.categories);
    }
    if (initial.organizations != null) {
      queryClient.setQueryData(queryKeys.organizations.all, initial.organizations);
    }
    if (initial.globalAppointmentTypes != null) {
      queryClient.setQueryData(queryKeys.appointmentTypes.global, {
        types: initial.globalAppointmentTypes,
      });
    }
  }, [queryClient, initial]);

  return (
    <div className="w-full text-gray-700">
      <ControlPanelMobileNav activeTab={tab} />
      <ControlPanelMobileSectionTabs activeTab={tab} />
      <ControlPanelSectionContent tab={tab} />
    </div>
  );
}
