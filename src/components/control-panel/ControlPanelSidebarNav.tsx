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

import React, { useMemo, useRef, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  Calendar,
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  Layers,
  Mail,
  PanelTop,
  Receipt,
  Stethoscope,
  Tags,
  UserCog,
  Users,
  Video,
} from "lucide-react";

// ─── Tab / segment constants ──────────────────────────────────────────────────

const SIDEBAR_ITEMS = [
  { value: "overview", label: "Dashboard Overview" },
  { value: "telehealth", label: "Telehealth Queue" },
  { value: "appointment", label: "Appointment Access Invitation" },
  { value: "dashboard", label: "User Dashboard Access Invitation" },
  { value: "patients", label: "Patient Management" },
  { value: "categories", label: "Category Management" },
  { value: "visit_types_global", label: "Global Visit Types" },
  { value: "doctors", label: "Doctor Management" },
  { value: "users_admin", label: "User / Admin Management" },
  { value: "organizations", label: "Organization Management" },
  { value: "invoices", label: "Invoices & Payments" },
  { value: "appointments_mgmt", label: "Appointment Management" },
  { value: "notifications", label: "Notifications" },
  { value: "google-calendar", label: "Google Calendar" },
] as const;

type SidebarTabValue = (typeof SIDEBAR_ITEMS)[number]["value"];

const SIDEBAR_ITEM_LABEL = Object.fromEntries(
  SIDEBAR_ITEMS.map((item) => [item.value, item.label])
) as Record<SidebarTabValue, string>;

const SIDEBAR_SECTIONS: readonly {
  heading: string;
  items: readonly { value: SidebarTabValue; icon: LucideIcon }[];
}[] = [
  {
    heading: "Overview & Queue",
    items: [
      { value: "overview", icon: LayoutDashboard },
      { value: "telehealth", icon: Video },
    ],
  },
  {
    heading: "Access & Invitations",
    items: [
      { value: "appointment", icon: Mail },
      { value: "dashboard", icon: PanelTop },
    ],
  },
  {
    heading: "Entity Management",
    items: [
      { value: "patients", icon: Users },
      { value: "categories", icon: Tags },
      { value: "visit_types_global", icon: Layers },
      { value: "doctors", icon: Stethoscope },
      { value: "users_admin", icon: UserCog },
      { value: "organizations", icon: Building2 },
    ],
  },
  {
    heading: "Operations",
    items: [
      { value: "invoices", icon: Receipt },
      { value: "appointments_mgmt", icon: CalendarDays },
      { value: "notifications", icon: Bell },
    ],
  },
  {
    heading: "System & Audit",
    items: [
      { value: "google-calendar", icon: Calendar },
    ],
  },
] as const;

/** URL segment → tab value. Covers both section slugs AND sub-resource paths (detail pages). */
const SEGMENT_TO_TAB: Record<string, SidebarTabValue> = {
  // section routes (from TAB_TO_SEGMENT reverse)
  "dashboard-overview": "overview",
  "telehealth-queue": "telehealth",
  "appointment-access-invitation": "appointment",
  "user-dashboard-access-invitation": "dashboard",
  "patient-management": "patients",
  "category-management": "categories",
  "global-visit-types": "visit_types_global",
  "doctor-management": "doctors",
  "user-admin-management": "users_admin",
  "organization-management": "organizations",
  "invoice-management": "invoices",
  "appointment-management": "appointments_mgmt",
  notifications: "notifications",
  "google-calendar": "google-calendar",
  // legacy alias
  "doctor-user-management": "doctors",
  // sub-resource detail pages — highlight the parent section in the sidebar
  patients: "patients",
  appointments: "appointments_mgmt",
  doctors: "doctors",
  invoices: "invoices",
  categories: "categories",
  organizations: "organizations",
};

/** Maps tab value → URL segment for navigation. */
const TAB_TO_SEGMENT: Record<string, string> = {
  overview: "dashboard-overview",
  telehealth: "telehealth-queue",
  appointment: "appointment-access-invitation",
  dashboard: "user-dashboard-access-invitation",
  patients: "patient-management",
  categories: "category-management",
  visit_types_global: "global-visit-types",
  doctors: "doctor-management",
  users_admin: "user-admin-management",
  organizations: "organization-management",
  invoices: "invoice-management",
  appointments_mgmt: "appointment-management",
  notifications: "notifications",
  "google-calendar": "google-calendar",
};

// ─── Styling tokens (match ControlPanelPage) ─────────────────────────────────

/** Border color matching Navbar bottom border. */
const NAV_BORDER = "border-gray-100/80";

/** Sidebar trigger — full-width, no padding, active item gets sky chip style. */
const triggerClass = cn(
  /* tabs.tsx now emits `whitespace-normal` for vertical orientation via group-data selector;
     items-start keeps the icon at the top of wrapped multi-line labels. */
  "!m-0 !h-auto !min-h-0 !gap-0 !px-0 !py-2 w-full cursor-pointer items-start justify-start rounded-none border-0 text-left text-sm font-normal shadow-none transition-colors",
  "text-gray-700 hover:bg-sky-50 hover:text-sky-800",
  "data-[state=active]:rounded-md data-[state=active]:bg-sky-100 data-[state=active]:text-sky-800 data-[state=active]:shadow-none",
  "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-gray-500 data-[state=active]:[&_svg]:text-sky-700",
  "after:hidden! data-[state=active]:after:hidden!"
);

/* Allow long labels (e.g. "Appointment Access Invitation") to wrap inside the sidebar width. */
const labelClass = "min-w-0 flex-1 pl-2 leading-snug break-words";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ControlPanelSidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  /** Resolve active tab from the current pathname segment. Works for section AND detail routes. */
  const activeTab = useMemo<SidebarTabValue>(() => {
    const seg = pathname.split("/")[2] ?? "";
    return (SEGMENT_TO_TAB[seg] as SidebarTabValue | undefined) ?? "overview";
  }, [pathname]);

  const handleTabChange = (nextTab: string) => {
    const segment = TAB_TO_SEGMENT[nextTab] ?? TAB_TO_SEGMENT.overview;
    const targetPath = `/control-panel/${segment}`;
    // Always scroll to top on tab switch (mirrors stock-inventory Link navigation).
    if (pathname !== targetPath) {
      router.replace(targetPath);
    }
  };

  /*
   * Scroll indicator — shows a gradient fade + chevron when the sidebar has hidden items below.
   * Tracked via a scroll event listener + ResizeObserver so it updates on both scroll and
   * viewport resize (e.g. user resizes browser window on a short screen).
   */
  const asideRef = useRef<HTMLElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const el = asideRef.current;
    if (!el) return;

    const check = () => {
      // true when there are more than 4px of hidden content below the current scroll position
      setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
    };

    check(); // run once on mount
    el.addEventListener("scroll", check, { passive: true });

    // Re-check whenever the sidebar or its content resizes (e.g. viewport height change)
    const ro = new ResizeObserver(check);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
    };
  }, []);

  /** Smoothly scroll the sidebar down by ~120px per click. */
  const scrollDown = () =>
    asideRef.current?.scrollBy({ top: 120, behavior: "smooth" });

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
          className="flex h-auto w-full flex-col gap-0 rounded-none border-0 bg-transparent pl-2 sm:pl-4 lg:pl-8 pb-3"
        >
          {SIDEBAR_SECTIONS.map((section, idx) => (
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
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      <span className={labelClass}>
                        {SIDEBAR_ITEM_LABEL[item.value]}
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
      {canScrollDown && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex flex-col items-center">
          {/* Gradient fade — signals hidden content below */}
          <div className="h-10 w-full bg-gradient-to-t from-white/90 via-white/60 to-transparent" />
          {/* Clickable chevron sits on top of the gradient */}
          <button
            onClick={scrollDown}
            aria-label="Scroll sidebar down"
            className="pointer-events-auto mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-gray-200/80 text-gray-400 hover:text-sky-600 hover:ring-sky-300 transition-colors animate-bounce"
          >
            <ChevronDown className="size-3.5" />
          </button>
        </div>
      )}
    </aside>
  );
}
