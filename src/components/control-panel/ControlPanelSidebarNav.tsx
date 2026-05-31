"use client";

/**
 * ControlPanelSidebarNav — stable desktop sidebar for all /control-panel/* routes.
 *
 * Lives in `app/control-panel/layout.tsx` (server layout), so it is NEVER remounted when
 * the user switches between section tabs or navigates to detail pages.
 * This matches the stock-inventory `AdminLayout` → `PageWithSidebar` pattern where the
 * sidebar is part of the persistent route layout, not the per-page component.
 *
 * Active item is derived from `usePathname()` — works for both section routes
 * (`/control-panel/patient-management`) and detail sub-routes (`/control-panel/patients/[id]`).
 */

import React, { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { navigateControlPanelSectionList } from "@/lib/control-panel-section-nav";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useScrollOverflowEdges } from "@/hooks/useScrollOverflowEdges";
import {
  scrollOverflowBottomGradientClass,
  scrollOverflowChevronButtonClass,
} from "@/lib/scroll-overflow-ui-classes";
import {
  CONTROL_PANEL_NAV_BORDER,
  CONTROL_PANEL_SEGMENT_TO_TAB,
  CONTROL_PANEL_SIDEBAR_ITEM_LABEL,
  CONTROL_PANEL_SIDEBAR_SECTIONS,
  controlPanelSidebarItemLabelClass,
  controlPanelSidebarTriggerClass,
  type ControlPanelSidebarTabValue,
} from "@/lib/control-panel-nav-config";

// ─── Styling tokens ───────────────────────────────────────────────────────────

const NAV_BORDER = CONTROL_PANEL_NAV_BORDER;
const triggerClass = controlPanelSidebarTriggerClass;
const labelClass = controlPanelSidebarItemLabelClass;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ControlPanelSidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  /** Resolve active tab from the current pathname segment. Works for section AND detail routes. */
  const activeTab = useMemo<ControlPanelSidebarTabValue>(() => {
    const seg = pathname.split("/")[2] ?? "";
    return CONTROL_PANEL_SEGMENT_TO_TAB[seg] ?? "overview";
  }, [pathname]);

  const handleTabChange = (nextTab: string) => {
    navigateControlPanelSectionList(pathname, nextTab, router.replace.bind(router));
  };

  const { containerRef: asideRef, canScrollDown, scrollDown } = useScrollOverflowEdges();

  return (
    /* Desktop sidebar — fills the height of the viewport-locked layout flex row.
       `control-panel/layout.tsx` owns the `h-full` container (AuthShell locks
       the outer shell to `h-dvh`), so we just stretch with `h-full` and add our
       own `overflow-y-auto` for internal nav scroll when items overflow.
       Mirrors stock-inventory `PageWithSidebar` aside: hidden on mobile, full height,
       own overflow, border-r. */
    <aside
      ref={asideRef}
      className={cn(
        /* relative: scroll-indicator overlay uses absolute positioning inside the aside. */
        "relative hidden shrink-0 border-r bg-transparent md:flex md:flex-col",
        /*
         * overflow-x-hidden must be explicit: `overflow-y-auto` alone causes the browser to
         * compute `overflow-x: auto`, which creates a horizontal scroll container. Any
         * micro-overflow (icon anti-aliasing, tracking-wider letter-spacing, focus rings)
         * can shift the scroll position right and clip the left-edge content.
         * Explicit overflow-x-hidden prevents that shift entirely.
         */
        /* cp-right-scroll: same hidden-track rule as the right pane — no gutter gap from the sidebar's own overflow-y-auto. */
        "cp-right-scroll w-[min(100%,16rem)] h-full overflow-y-auto overflow-x-hidden overscroll-contain",
        NAV_BORDER
      )}
      aria-label="Control panel navigation"
    >
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        orientation="vertical"
        className="flex h-full min-h-0 w-full flex-col"
      >
        {/*
         * pl aligns with the outer layout shell padding (same scale as right pane px-4 sm:px-6 lg:px-8).
         * pr-2 gives a small buffer before the border-r separator.
         */}
        <TabsList
          variant="line"
          className="flex h-auto w-full flex-col gap-0 rounded-none border-0 bg-transparent pl-2 sm:pl-4 lg:pl-8 pb-2"
        >
          {CONTROL_PANEL_SIDEBAR_SECTIONS.map((section, idx) => (
            <div
              key={section.heading}
              className={cn("w-full", idx === 0 ? "pt-2" : "pt-4")}
            >
              <p className="text-xs font-bold tracking-wider text-gray-400">
                {section.heading}
              </p>
              <div className="flex flex-col">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <TabsTrigger
                      key={item.value}
                      value={item.value}
                      className={triggerClass}
                      onClick={() => handleTabChange(item.value)}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      <span className={labelClass}>
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

      {/*
       * Scroll-more indicator — only rendered when hidden items exist below the fold.
       * Gradient fade hints at more content; the ChevronDown button scrolls down ~120px on click.
       * pointer-events-none on the gradient layer so mouse events pass through to sidebar items.
       * The button itself has pointer-events-auto to remain clickable.
       */}
      {canScrollDown ? (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex flex-col items-center">
          <div className={scrollOverflowBottomGradientClass("from-white/90")} />
          <button
            type="button"
            onClick={scrollDown}
            aria-label="Scroll sidebar down"
            className={cn(
              scrollOverflowChevronButtonClass,
              "pointer-events-auto mb-2 animate-bounce"
            )}
          >
            <ChevronDown className="size-3.5" aria-hidden />
          </button>
        </div>
      ) : null}
    </aside>
  );
}
