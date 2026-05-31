"use client";

import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CONTROL_PANEL_NAV_BORDER,
  CONTROL_PANEL_SIDEBAR_ITEM_LABEL,
  CONTROL_PANEL_SIDEBAR_SECTIONS,
  controlPanelSidebarItemLabelClass,
  controlPanelSidebarTriggerClass,
  type ControlPanelSidebarTabValue,
} from "@/lib/control-panel-nav-config";
import { navigateControlPanelSectionList } from "@/lib/control-panel-section-nav";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = {
  /** Active sidebar tab — drives mobile sheet highlight. */
  activeTab: ControlPanelSidebarTabValue;
};

/**
 * Mobile-only CP navigation — desktop sidebar lives in `control-panel/layout.tsx`.
 * Trigger click always navigates to list route (detail → list when tab already active).
 */
export function ControlPanelMobileNav({ activeTab }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const navigate = (tab: string) => {
    navigateControlPanelSectionList(pathname, tab, router.replace.bind(router));
    setSheetOpen(false);
  };

  return (
    <div className="mb-4 flex items-center gap-2 md:hidden">
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="default"
            className="rounded-2xl shadow-xl"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
            Menu
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className={cn("w-80 border-r bg-transparent p-0", CONTROL_PANEL_NAV_BORDER)}
        >
          <SheetHeader className="border-b p-4">
            <SheetTitle>Control Panel</SheetTitle>
          </SheetHeader>
          <Tabs
            value={activeTab}
            onValueChange={navigate}
            orientation="vertical"
            className="w-full"
          >
            <TabsList className="flex h-auto max-h-[min(70vh,calc(100dvh-8rem))] w-full flex-col gap-0 overflow-y-auto overflow-x-hidden rounded-none border-0 bg-transparent px-3 pb-2">
              {CONTROL_PANEL_SIDEBAR_SECTIONS.map((section, sectionIndex) => (
                <div
                  key={section.heading}
                  className={cn("w-full", sectionIndex === 0 ? "pt-2" : "pt-4")}
                >
                  <p className="text-sm font-semibold tracking-wider text-gray-400">
                    {section.heading}
                  </p>
                  <div className="flex flex-col">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <TabsTrigger
                          key={item.value}
                          value={item.value}
                          className={controlPanelSidebarTriggerClass}
                          onClick={() => navigate(item.value)}
                        >
                          <Icon className="size-4 shrink-0" aria-hidden />
                          <span className={controlPanelSidebarItemLabelClass}>
                            {CONTROL_PANEL_SIDEBAR_ITEM_LABEL[item.value]}
                          </span>
                        </TabsTrigger>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TabsList>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
}
