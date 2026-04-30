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
import { Menu } from "lucide-react";
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
    <div className="w-full max-w-9xl mx-auto px-2 sm:px-6 lg:px-8 py-2">
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 min-h-[60vh]">
        {/* Desktop sidebar - shadcn Tabs as vertical tab menu */}
        <aside className="hidden md:flex h-full min-w-[240px] w-64 shrink-0 flex-col rounded-2xl border bg-card text-card-foreground shadow-2xl sticky top-0">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            orientation="vertical"
            className="flex-1 w-full"
          >
            <TabsList
              variant="line"
              className="flex h-auto flex-col rounded-none rounded-t-lg border-0 bg-transparent p-2 gap-0.5 w-full"
            >
              {SIDEBAR_ITEMS.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className={cn(
                    "w-full justify-start rounded-2xl px-3 py-2 text-base font-medium text-left whitespace-normal h-auto min-h-10 cursor-pointer",
                    "hover:bg-gray-100!",
                    "data-[state=active]:bg-gray-200! data-[state=active]:text-foreground!",
                    "data-[state=active]:after:content-none! data-[state=active]:after:hidden!"
                  )}
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </aside>

        {/* Mobile: Sheet for sidebar */}
        <div className="md:hidden flex items-center gap-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="default" className="rounded-2xl shadow-xl" aria-label="Open menu">
                <Menu className="h-5 w-5 mr-2" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Control Panel</SheetTitle>
              </SheetHeader>
              <Tabs
                value={activeTab}
                onValueChange={(v) => {
                  handleTabChange(v);
                  setSheetOpen(false);
                }}
                orientation="vertical"
                className="flex-1"
              >
                <TabsList className="flex flex-col h-auto rounded-none border-0 bg-transparent p-2 gap-0.5 w-full">
                  {SIDEBAR_ITEMS.map((item) => (
                    <TabsTrigger
                      key={item.value}
                      value={item.value}
                      className={cn(
                        "w-full justify-start rounded-2xl px-3 py-2 text-sm cursor-pointer",
                        "hover:bg-gray-100!",
                        "data-[state=active]:bg-gray-200! data-[state=active]:text-foreground!"
                      )}
                    >
                      {item.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main content - dynamic width */}
        <main className="flex-1 min-w-0 text-gray-700">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="md:hidden mb-4 overflow-x-auto">
              <TabsList className="inline-flex w-full min-w-max rounded-2xl shadow-xl gap-2 p-1">
                <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
                <TabsTrigger value="telehealth" className="py-2">Telehealth</TabsTrigger>
                <TabsTrigger value="appointment" className="py-2">Appointments</TabsTrigger>
                <TabsTrigger value="dashboard" className="py-2">Dashboard</TabsTrigger>
                <TabsTrigger value="patients" className="py-2">Patients</TabsTrigger>
                <TabsTrigger value="categories" className="py-2">Categories</TabsTrigger>
                <TabsTrigger value="doctors" className="py-2">Doctors</TabsTrigger>
                <TabsTrigger value="users_admin" className="py-2">Staff</TabsTrigger>
                <TabsTrigger value="relatives" className="py-2">Relatives</TabsTrigger>
                <TabsTrigger value="organizations" className="py-2">Organizations</TabsTrigger>
                <TabsTrigger value="invoices" className="py-2">Invoices</TabsTrigger>
                <TabsTrigger value="appointments_mgmt" className="py-2">All Appointments</TabsTrigger>
                <TabsTrigger value="notifications" className="py-2">Notifications</TabsTrigger>
                <TabsTrigger value="activities" className="py-2">Activity Log</TabsTrigger>
                <TabsTrigger value="google-calendar" className="py-2">Google Calendar</TabsTrigger>
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
