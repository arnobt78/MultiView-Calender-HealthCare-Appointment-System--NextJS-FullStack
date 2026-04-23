"use client";

import React, { useState } from "react";
import PatientDetailView from "./PatientDetailView";
import TelehealthDashboard from "./TelehealthDashboard";
import { useAppStore } from "@/store/useAppStore";
import { usePatients } from "@/hooks/usePatients";
import { useDebounce } from "@/hooks/useDebounce";
import AppointmentAccessPermission from "@/components/control-panel/AppointmentAccessPermission";
import UserAccessPermission from "@/components/control-panel/UserAccessPermission";
import InvitationList from "@/components/control-panel/InvitationList";
import PatientManagement from "@/components/control-panel/PatientManagement";
import CategoryManagement from "@/components/control-panel/CategoryManagement";
import DoctorManagement from "@/components/control-panel/DoctorManagement";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const SIDEBAR_ITEMS = [
  { value: "overview", label: "Dashboard Overview" },
  { value: "telehealth", label: "Telehealth Queue" },
  { value: "appointment", label: "Appointment Access Invitation" },
  { value: "dashboard", label: "User Dashboard Access Invitation" },
  { value: "patients", label: "Patient Management" },
  { value: "categories", label: "Category Management" },
  { value: "doctors", label: "Doctor / User Management" },
  { value: "relatives", label: "Relative Management" },
  { value: "organizations", label: "Organization Management" },
  { value: "invoices", label: "Invoices & Payments" },
  { value: "appointments_mgmt", label: "Appointment Management" },
  { value: "notifications", label: "Notifications" },
  { value: "activities", label: "Activity Log" },
  { value: "google-calendar", label: "Google Calendar" },
] as const;

type ControlPanelPageProps = {
  /** Optional session from SSR to avoid client round-trip */
  initialSession?: { userId: string; email: string } | null;
};

export function PatientsTab() {
  const { patients, isLoading, isError, error } = usePatients();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300) ?? "";

  // Local state for editing form, global state for viewing entire record
  const [editingPatient, setEditingPatient] = useState<string | null>(null);
  const activePatientId = useAppStore(state => state.activePatientId);
  const setActivePatient = useAppStore(state => state.setActivePatientId);

  if (activePatientId) {
    return (
      <div className="space-y-4 animate-in fade-in h-[calc(100vh-140px)]">
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

  if (isLoading) return <div className="p-4"><Skeleton className="h-[400px] w-full" /></div>;
  if (isError) return <div className="p-4 text-red-500">Error loading patients: {error?.message}</div>;

  const search = (debouncedSearch ?? "").toLowerCase();
  const filteredPatients = patients?.filter(patient =>
    `${patient.firstname ?? ""} ${patient.lastname ?? ""}`.toLowerCase().includes(search) ||
    (patient.email ?? "").toLowerCase().includes(search)
  ) || [];

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Patient Management</h2>
        <Input
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      {filteredPatients.length === 0 ? (
        <p className="text-center text-muted-foreground">No patients found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <Card key={patient.id}>
              <CardHeader>
                <CardTitle>{patient.firstname} {patient.lastname}</CardTitle>
                <CardDescription>{patient.email}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setActivePatient(patient.id)}>
                  View All Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ControlPanelPage({ initialSession }: ControlPanelPageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="w-full max-w-9xl mx-auto py-8 px-2 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 min-h-[60vh]">
        {/* Desktop sidebar - shadcn Tabs as vertical tab menu */}
        <aside className="hidden md:flex min-w-[240px] w-64 shrink-0 flex-col rounded-lg border bg-card text-card-foreground shadow-xl">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
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
                  setActiveTab(v);
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
        <main className="flex-1 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="md:hidden mb-4 overflow-x-auto">
              <TabsList className="inline-flex w-full min-w-max rounded-2xl shadow-xl gap-2 p-1">
                <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
                <TabsTrigger value="telehealth" className="py-2">Telehealth</TabsTrigger>
                <TabsTrigger value="appointment" className="py-2">Appointments</TabsTrigger>
                <TabsTrigger value="dashboard" className="py-2">Dashboard</TabsTrigger>
                <TabsTrigger value="patients" className="py-2">Patients</TabsTrigger>
                <TabsTrigger value="categories" className="py-2">Categories</TabsTrigger>
                <TabsTrigger value="doctors" className="py-2">Doctors</TabsTrigger>
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
