"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateInvoicesAndOverview } from "@/lib/query-client";
import { seedControlPanelSectionCacheFromSsr } from "@/lib/cp-list-query-ssr-seed";
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

  /** Sync seed before section children subscribe — single path, seedIfAbsent only. */
  useMemo(() => {
    if (initial != null) {
      seedControlPanelSectionCacheFromSsr(queryClient, initial);
    }
    return null;
  }, [queryClient, initial]);

  /** Stripe return on invoice tab — bust overview/invoices without full reload. */
  useEffect(() => {
    if (searchParams.get("status") === "success") {
      void invalidateInvoicesAndOverview(queryClient);
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, queryClient, router, pathname]);

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
      <ControlPanelChromeRegistryProvider
        key={tab}
        defaultDescription={defaultDescription ?? ""}
        activeTab={tab}
      >
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
