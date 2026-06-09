"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";
import { seedInvoicesListCacheFromSsr } from "@/lib/invoices-query-ssr-seed";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateInvoicesAndOverview } from "@/lib/query-client";
import { seedControlPanelSectionCache } from "@/lib/ssr-query-seed";
import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";
import type { ControlPanelSectionPrefetchPayload } from "@/lib/control-panel-section-prefetch";
import { ControlPanelMobileNav } from "@/components/control-panel/ControlPanelMobileNav";
import { ControlPanelMobileSectionTabs } from "@/components/control-panel/ControlPanelMobileSectionTabs";
import { ControlPanelChromeFromServerProvider } from "@/components/control-panel/ControlPanelChromeContext";
import { ControlPanelSectionContent } from "@/components/control-panel/ControlPanelSectionContent";

type Props = {
  tab: ControlPanelSidebarTabValue;
  initial: ControlPanelSectionPrefetchPayload | null;
  /** Server already rendered static chrome — client sections render actions only. */
  chromeFromServer?: boolean;
};

/** Seeds SSR prefetch into TanStack cache + renders one CP section (mobile nav + body). */
export function ControlPanelSectionPageClient({
  tab,
  initial,
  chromeFromServer = false,
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

  const body = (
    <div className="w-full text-gray-700">
      <ControlPanelMobileNav activeTab={tab} />
      <ControlPanelMobileSectionTabs activeTab={tab} />
      <ControlPanelSectionContent tab={tab} />
    </div>
  );

  if (!chromeFromServer) return body;

  return (
    <ControlPanelChromeFromServerProvider value>
      {body}
    </ControlPanelChromeFromServerProvider>
  );
}
