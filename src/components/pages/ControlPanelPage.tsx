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

/** Matches sticky navbar stack height so sidebar + main pane clear the bar without overlapping. */
const CONTROL_PANEL_STICKY_TOP = "top-[4.5rem]";
/** Same token as `Navbar` bottom rule (`border-b border-gray-100/80`). */
const CONTROL_PANEL_NAV_BORDER = "border-gray-100/80";
/** Desktop: row is at least viewport below navbar so the rail stretches with the layout. */
const CONTROL_PANEL_ROW_MD_MIN_H = "md:min-h-[calc(100dvh-4.5rem)]";
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
  "!m-0 !h-auto !min-h-0 !gap-0 !px-0 !py-2.5 w-full cursor-pointer items-center justify-start rounded-none border-0 text-left text-sm font-normal shadow-none transition-colors",
  "text-gray-800 hover:bg-gray-50 hover:text-gray-900",
  "data-[state=active]:rounded-md data-[state=active]:bg-sky-100 data-[state=active]:text-sky-800 data-[state=active]:shadow-none",
  "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-gray-500 data-[state=active]:[&_svg]:text-sky-700",
  "after:hidden! data-[state=active]:after:hidden!"
);

const sidebarItemLabelClass = "min-w-0 flex-1 pl-2 leading-snug whitespace-nowrap";

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
      router.replace(targetPath, { scroll: false });
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex min-h-[60vh] flex-col gap-2 md:flex-row md:items-stretch md:gap-4",
          CONTROL_PANEL_ROW_MD_MIN_H
        )}
      >
        {/* Desktop: stretch to row height + sticky under navbar so the right border runs the full column. */}
        <aside
          className={cn(
            "sticky z-30 hidden w-[min(100%,16rem)] shrink-0 border-r bg-transparent md:block md:self-stretch",
            CONTROL_PANEL_NAV_BORDER,
            CONTROL_PANEL_STICKY_TOP
          )}
        >
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            orientation="vertical"
            className="flex h-full min-h-0 w-full flex-col"
          >
            <TabsList
              variant="line"
              className="flex h-auto w-full flex-col gap-0 rounded-none border-0 bg-transparent p-0"
            >
              {SIDEBAR_SECTIONS.map((section, sectionIndex) => (
                <div
                  key={section.heading}
                  className={cn("w-full", sectionIndex === 0 && "pt-2", sectionIndex > 0 && "pt-4")}
                >
                  <p className="text-sm font-semibold tracking-wider text-gray-400">{section.heading}</p>
                  <div className="flex flex-col">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <TabsTrigger key={item.value} value={item.value} className={sidebarTriggerClass}>
                          <Icon className="size-4 shrink-0" aria-hidden />
                          <span className={sidebarItemLabelClass}>{SIDEBAR_ITEM_LABEL[item.value]}</span>
                        </TabsTrigger>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TabsList>
          </Tabs>
        </aside>

        {/* Mobile: Sheet mirrors desktop sections + icons. */}
        <div className="flex items-center gap-2 md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="default" className="rounded-2xl shadow-xl" aria-label="Open menu">
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
                onValueChange={(v) => {
                  handleTabChange(v);
                  setSheetOpen(false);
                }}
                orientation="vertical"
                className="w-full"
              >
                <TabsList className="flex h-auto max-h-[min(70vh,calc(100dvh-8rem))] w-full flex-col gap-0 overflow-y-auto rounded-none border-0 bg-transparent p-0">
                  {SIDEBAR_SECTIONS.map((section, sectionIndex) => (
                    <div
                      key={section.heading}
                      className={cn("w-full", sectionIndex === 0 && "pt-2", sectionIndex > 0 && "pt-4")}
                    >
                      <p className="text-sm font-semibold tracking-wider text-gray-400">{section.heading}</p>
                      <div className="flex flex-col">
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <TabsTrigger key={item.value} value={item.value} className={sidebarTriggerClass}>
                              <Icon className="size-4 shrink-0" aria-hidden />
                              <span className={sidebarItemLabelClass}>{SIDEBAR_ITEM_LABEL[item.value]}</span>
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

        {/* Main tab body: own scroll on md so sidebar stays pinned while long tables scroll here. */}
        <main
          className={cn(
            "min-w-0 flex-1 text-gray-700",
            "px-0",
            "md:min-h-0 md:max-h-[calc(100dvh-4.5rem)] md:overflow-y-auto md:overscroll-contain"
          )}
        >
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="md:hidden mb-4 overflow-x-auto">
              <TabsList className="inline-flex w-full min-w-max gap-2 rounded-2xl p-1 shadow-xl">
                {SIDEBAR_ITEMS.map(({ value, label }) => (
                  <TabsTrigger key={value} value={value} className="whitespace-nowrap py-2">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <TabsContent value="overview" className="mt-0 md:mt-0">
              <DashboardOverviewComponent />
            </TabsContent>
            <TabsContent value="telehealth" className="mt-0 md:mt-0">
              <TelehealthDashboard />
            </TabsContent>
            <TabsContent value="appointment" className="mt-0 md:mt-0">
              <AppointmentAccessPermission />
              <InvitationList type="appointment" />
            </TabsContent>
            <TabsContent value="dashboard" className="mt-0 md:mt-0">
              <UserAccessPermission />
              <InvitationList type="dashboard" />
            </TabsContent>
            <TabsContent value="patients" className="mt-0 md:mt-0">
              <PatientsTab />
            </TabsContent>
            <TabsContent value="categories" className="mt-0 md:mt-0">
              <CategoryManagement />
            </TabsContent>
            <TabsContent value="doctors" className="mt-0 md:mt-0">
              <DoctorManagement />
            </TabsContent>
            <TabsContent value="users_admin" className="mt-0 md:mt-0">
              <UserManagement />
            </TabsContent>
            <TabsContent value="relatives" className="mt-0 md:mt-0">
              <RelativesManagement />
            </TabsContent>
            <TabsContent value="organizations" className="mt-0 md:mt-0">
              <OrganizationManagement />
            </TabsContent>
            <TabsContent value="invoices" className="mt-0 md:mt-0">
              <InvoiceManagement />
            </TabsContent>
            <TabsContent value="appointments_mgmt" className="mt-0 md:mt-0">
              <AppointmentsManagement />
            </TabsContent>
            <TabsContent value="notifications" className="mt-0 md:mt-0">
              <NotificationsManagement />
            </TabsContent>
            <TabsContent value="activities" className="mt-0 md:mt-0">
              <ActivitiesManagement />
            </TabsContent>
            <TabsContent value="google-calendar" className="mt-0 md:mt-0">
              <GoogleCalendarSettings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
