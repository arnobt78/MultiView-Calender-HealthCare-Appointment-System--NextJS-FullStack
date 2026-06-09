"use client";

import { useEffect, useLayoutEffect, useMemo, type ReactNode } from "react";
import { seedInvoicesListCacheFromSsr } from "@/lib/invoices-query-ssr-seed";
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

type Props = {
  tab: ControlPanelSidebarTabValue;
  initial: ControlPanelSectionPrefetchPayload | null;
  /** Config subtitle — shown until a section registers `description` override. */
  defaultDescription?: string;
  /** SSR icon tile — when omitted, sections render full `ControlPanelPageChrome` (legacy). */
  serverChromeIcon?: ReactNode;
  /** SSR title node — server component passed as child. */
  serverChromeTitle?: ReactNode;
};

/** Seeds SSR prefetch + merged sticky header (SSR left + client actions slot) + section body. */
export function ControlPanelSectionPageClient({
  tab,
  initial,
  defaultDescription,
  serverChromeIcon,
  serverChromeTitle,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  useMemo(() => {
    if (initial?.invoices != null) {
      seedInvoicesListCacheFromSsr(queryClient, initial.invoices);
    }
    return null;
  }, [queryClient, initial?.invoices]);

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
    <ControlPanelChromeRegistryProvider defaultDescription={defaultDescription ?? ""}>
      <div className="w-full text-gray-700">
        {/* Merged header: SSR icon/title + client description + client actions in one sticky row */}
        {/* CP header: no border-b — section body uses `appSectionStackClass` gap below */}
        <div className={pageHeaderRootClass}>
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-stretch sm:justify-between">
            <div className="flex min-w-0 flex-1 items-stretch gap-2">
              {serverChromeIcon}
              <div className={pageChromeTitleStackClass}>
                {serverChromeTitle}
                <ControlPanelChromeDescriptionSlot />
              </div>
            </div>
            <ControlPanelChromeActionsSlot />
          </div>
          <ControlPanelChromeToolbarSlot />
        </div>
        {body}
      </div>
    </ControlPanelChromeRegistryProvider>
  );
}
