"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CONTROL_PANEL_SIDEBAR_ITEMS,
  type ControlPanelSidebarTabValue,
} from "@/lib/control-panel-nav-config";
import { navigateControlPanelSectionList } from "@/lib/control-panel-section-nav";
import { cn } from "@/lib/utils";

type Props = {
  activeTab: ControlPanelSidebarTabValue;
};

/**
 * Mobile horizontal quick-switch strip — `onClick` ensures detail routes return to list
 * when the active tab is clicked again (Radix `onValueChange` skips same value).
 */
export function ControlPanelMobileSectionTabs({ activeTab }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const navigate = (tab: string) => {
    navigateControlPanelSectionList(pathname, tab, router.replace.bind(router));
  };

  return (
    <div className="mb-4 overflow-x-auto md:hidden">
      <Tabs value={activeTab} onValueChange={navigate} className="w-full">
        <TabsList className="inline-flex w-full min-w-max gap-2 rounded-2xl p-1 shadow-xl">
          {CONTROL_PANEL_SIDEBAR_ITEMS.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn("whitespace-nowrap py-2")}
              onClick={() => navigate(value)}
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
