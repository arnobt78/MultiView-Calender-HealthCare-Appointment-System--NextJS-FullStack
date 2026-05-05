"use client";

import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import PatientDetailView from "./PatientDetailView";
import TelehealthDashboard from "./TelehealthDashboard";
import { useAppStore } from "@/store/useAppStore";
import AppointmentAccessPermission from "@/components/control-panel/AppointmentAccessPermission";
import UserAccessPermission from "@/components/control-panel/UserAccessPermission";
import InvitationList from "@/components/control-panel/InvitationList";
import PatientManagement from "@/components/control-panel/PatientManagement";
import CategoryManagement from "@/components/control-panel/CategoryManagement";
import DoctorManagement from "@/components/control-panel/DoctorManagement";
import UserManagement from "@/components/control-panel/UserManagement";
import RelativesManagement from "@/components/control-panel/RelativesManagement";
import OrganizationManagement from "@/components/control-panel/OrganizationManagement";
import InvoiceManagement from "@/components/control-panel/InvoiceManagement";
import AppointmentsManagement from "@/components/control-panel/AppointmentsManagement";
import NotificationsManagement from "@/components/control-panel/NotificationsManagement";
import ActivitiesManagement from "@/components/control-panel/ActivitiesManagement";
import GoogleCalendarSettings from "@/components/control-panel/GoogleCalendarSettings";
import DashboardOverviewComponent from "@/components/control-panel/DashboardOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  Calendar,
  CalendarDays,
  History,
  LayoutDashboard,
  Mail,
  Menu,
  PanelTop,
  Receipt,
  Stethoscope,
  Tags,
  UserCog,
  Users,
  UsersRound,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ControlPanelPage — right-pane content for /control-panel/[section] routes.
 *
 * The desktop sidebar is owned by `app/control-panel/layout.tsx` via
 * `ControlPanelSidebarNav`. This component renders ONLY:
 *   - Mobile Sheet drawer (hamburger → sidebar nav)
 *   - Mobile horizontal tab strip
 *   - Tab content panels for all 15 control-panel sections
 *
 * Having the sidebar in the layout (not here) means it NEVER remounts on section
 * navigation — eliminating the "sidebar jumps" regression.
 */

const SIDEBAR_ITEMS = [
  { value: "overview", label: "Dashboard Overview" },
  { value: "telehealth", label: "Telehealth Queue" },
  { value: "appointment", label: "Appointment Access Invitation" },
  { value: "dashboard", label: "User Dashboard Access Invitation" },
  { value: "patients", label: "Patient Management" },
  { value: "categories", label: "Category Management" },
  { value: "doctors", label: "Doctor Management" },
  { value: "users_admin", label: "User / Admin Management" },
  { value: "relatives", label: "Relative Management" },
  { value: "organizations", label: "Organization Management" },
  { value: "invoices", label: "Invoices & Payments" },
  { value: "appointments_mgmt", label: "Appointment Management" },
  { value: "notifications", label: "Notifications" },
  { value: "activities", label: "Activity Log" },
  { value: "google-calendar", label: "Google Calendar" },
] as const;

/** Single source of truth for tab labels (desktop sidebar, mobile sheet, horizontal tab strip). */
const SIDEBAR_ITEM_LABEL = Object.fromEntries(
  SIDEBAR_ITEMS.map((item) => [item.value, item.label])
) as Record<(typeof SIDEBAR_ITEMS)[number]["value"], string>;

/** Same token as `Navbar` bottom rule (`border-b border-gray-100/80`). Used in mobile Sheet. */
const CONTROL_PANEL_NAV_BORDER = "border-gray-100/80";
type SidebarTabValue = (typeof SIDEBAR_ITEMS)[number]["value"];

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
      { value: "doctors", icon: Stethoscope },
      { value: "users_admin", icon: UserCog },
      { value: "relatives", icon: UsersRound },
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
      { value: "activities", icon: History },
      { value: "google-calendar", icon: Calendar },
    ],
  },
] as const;

/** Full-bleed row: no horizontal padding; icon + label only (`pl-2` on label vs icon). */
const sidebarTriggerClass = cn(
  /* tabs.tsx emits `whitespace-normal` for vertical orientation; items-start keeps the icon at top of wrapped labels. */
  "!m-0 !h-auto !min-h-0 !gap-0 !px-0 !py-2.5 w-full cursor-pointer items-start justify-start rounded-none border-0 text-left text-sm font-normal shadow-none transition-colors",
  "text-gray-800 hover:bg-gray-50 hover:text-gray-900",
  "data-[state=active]:rounded-md data-[state=active]:bg-sky-100 data-[state=active]:text-sky-800 data-[state=active]:shadow-none",
  "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-gray-500 data-[state=active]:[&_svg]:text-sky-700",
  "after:hidden! data-[state=active]:after:hidden!"
);

/* Allow long labels to wrap in the mobile Sheet sidebar (same fix as ControlPanelSidebarNav). */
const sidebarItemLabelClass = "min-w-0 flex-1 pl-2 leading-snug break-words";

const TAB_TO_SEGMENT: Record<string, string> = {
  overview: "dashboard-overview",
  telehealth: "telehealth-queue",
  appointment: "appointment-access-invitation",
  dashboard: "user-dashboard-access-invitation",
  patients: "patient-management",
  categories: "category-management",
  doctors: "doctor-management",
  users_admin: "user-admin-management",
  relatives: "relative-management",
  organizations: "organization-management",
  invoices: "invoice-management",
  appointments_mgmt: "appointment-management",
  notifications: "notifications",
  activities: "activity-log",
  "google-calendar": "google-calendar",
};

const SEGMENT_TO_TAB = {
  ...Object.fromEntries(
    Object.entries(TAB_TO_SEGMENT).map(([tab, segment]) => [segment, tab])
  ),
  /** Older deployments linked here from Quick Actions / bookmarks */
  "doctor-user-management": "doctors",
} as Record<string, string>;

type ControlPanelPageProps = {
  /** Optional session from SSR to avoid client round-trip */
  initialSession?: { userId: string; email: string } | null;
  initialTab?: string;
};

export function PatientsTab() {
  // Inline legacy detail when store pins a patient (rare); default list is TanStack PatientManagement.
  const activePatientId = useAppStore((state) => state.activePatientId);
  const setActivePatient = useAppStore((state) => state.setActivePatientId);

  if (activePatientId) {
    return (
      <div className="space-y-2 animate-in fade-in h-[calc(100vh-140px)]">
        <div className="flex items-center gap-4 border-b pb-4">
          <Button variant="ghost" size="sm" onClick={() => setActivePatient(null)}>
            ← Back to Patient List
          </Button>
        </div>
        <div className="h-full overflow-hidden">
          <PatientDetailView patientId={activePatientId} />
        </div>
      </div>
    );
  }

  return <PatientManagement />;
}

export default function ControlPanelPage({ initialSession, initialTab }: ControlPanelPageProps) {
  const pathname = usePathname();
  const router = useRouter();
  const resolvedInitialTab = useMemo(() => {
    if (initialTab && TAB_TO_SEGMENT[initialTab]) return initialTab;
    const segment = pathname.split("/")[2] || "";
    return SEGMENT_TO_TAB[segment] ?? "overview";
  }, [initialTab, pathname]);
  const activeTab = resolvedInitialTab;
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleTabChange = (nextTab: string) => {
    const segment = TAB_TO_SEGMENT[nextTab] ?? TAB_TO_SEGMENT.overview;
    const targetPath = `/control-panel/${segment}`;
    if (pathname !== targetPath) {
      // Match stock-inventory behavior: do not preserve prior page scroll between sidebar tab routes.
      router.replace(targetPath);
    }
  };

  return (
    /* Root wrapper — full width, no padding (layout.tsx right pane owns px/py). */
    <div className="w-full text-gray-700">

      {/*
       * Mobile hamburger → Sheet drawer (hidden on desktop, layout sidebar shows instead).
       * Sheet renders a full vertical sidebar nav the same way the desktop sidebar does.
       */}
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
            {/* Sheet uses its own Tabs purely for active-state styling + navigation. */}
            <Tabs
              value={activeTab}
              onValueChange={(v) => {
                handleTabChange(v);
                setSheetOpen(false);
              }}
              orientation="vertical"
              className="w-full"
            >
                {/* px-3 pb-3: same padding as desktop sidebar so icons/labels aren't flush against the sheet edge. overflow-x-hidden prevents horizontal shift from overflow-y-auto. */}
                <TabsList className="flex h-auto max-h-[min(70vh,calc(100dvh-8rem))] w-full flex-col gap-0 overflow-y-auto overflow-x-hidden rounded-none border-0 bg-transparent px-3 pb-3">
                {SIDEBAR_SECTIONS.map((section, sectionIndex) => (
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
                            className={sidebarTriggerClass}
                          >
                            <Icon className="size-4 shrink-0" aria-hidden />
                            <span className={sidebarItemLabelClass}>
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
          </SheetContent>
        </Sheet>
      </div>

      {/*
       * Main Tabs — ONE Tabs instance controls which content panel is visible.
       * On mobile: includes a horizontal scrollable TabsList for quick switching.
       * On desktop: TabsList is hidden (the layout sidebar drives `activeTab` via router).
       * `value` is always derived from the URL so both sidebar clicks and direct navigation work.
       */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Mobile horizontal tab strip — hidden on md+ (desktop sidebar handles navigation). */}
        <div className="mb-4 overflow-x-auto md:hidden">
          <TabsList className="inline-flex w-full min-w-max gap-2 rounded-2xl p-1 shadow-xl">
            {SIDEBAR_ITEMS.map(({ value, label }) => (
              <TabsTrigger key={value} value={value} className="whitespace-nowrap py-2">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Content panels — rendered for all 15 sections. */}
        <TabsContent value="overview" className="mt-0">
          <DashboardOverviewComponent />
        </TabsContent>
        <TabsContent value="telehealth" className="mt-0">
          <TelehealthDashboard />
        </TabsContent>
        <TabsContent value="appointment" className="mt-0">
          <AppointmentAccessPermission />
          <InvitationList type="appointment" />
        </TabsContent>
        <TabsContent value="dashboard" className="mt-0">
          <UserAccessPermission />
          <InvitationList type="dashboard" />
        </TabsContent>
        <TabsContent value="patients" className="mt-0">
          <PatientsTab />
        </TabsContent>
        <TabsContent value="categories" className="mt-0">
          <CategoryManagement />
        </TabsContent>
        <TabsContent value="doctors" className="mt-0">
          <DoctorManagement />
        </TabsContent>
        <TabsContent value="users_admin" className="mt-0">
          <UserManagement />
        </TabsContent>
        <TabsContent value="relatives" className="mt-0">
          <RelativesManagement />
        </TabsContent>
        <TabsContent value="organizations" className="mt-0">
          <OrganizationManagement />
        </TabsContent>
        <TabsContent value="invoices" className="mt-0">
          <InvoiceManagement />
        </TabsContent>
        <TabsContent value="appointments_mgmt" className="mt-0">
          <AppointmentsManagement />
        </TabsContent>
        <TabsContent value="notifications" className="mt-0">
          <NotificationsManagement />
        </TabsContent>
        <TabsContent value="activities" className="mt-0">
          <ActivitiesManagement />
        </TabsContent>
        <TabsContent value="google-calendar" className="mt-0">
          <GoogleCalendarSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
