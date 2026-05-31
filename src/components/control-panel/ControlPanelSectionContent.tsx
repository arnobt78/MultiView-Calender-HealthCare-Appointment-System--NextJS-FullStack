"use client";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import AppointmentAccessPermission from "@/components/control-panel/AppointmentAccessPermission";
import UserAccessPermission from "@/components/control-panel/UserAccessPermission";
import InvitationList from "@/components/control-panel/InvitationList";
import PatientManagement from "@/components/control-panel/PatientManagement";
import CategoryManagement from "@/components/control-panel/CategoryManagement";
import DoctorManagement from "@/components/control-panel/DoctorManagement";
import UserManagement from "@/components/control-panel/UserManagement";
import OrganizationManagement from "@/components/control-panel/OrganizationManagement";
import InvoiceManagement from "@/components/control-panel/InvoiceManagement";
import AppointmentsManagement from "@/components/control-panel/AppointmentsManagement";
import NotificationsManagement from "@/components/control-panel/NotificationsManagement";
import GoogleCalendarSettings from "@/components/control-panel/GoogleCalendarSettings";
import { GlobalAppointmentTypesEditor } from "@/components/control-panel/GlobalAppointmentTypesEditor";
import DashboardOverviewComponent from "@/components/control-panel/DashboardOverview";
import TelehealthDashboard from "@/components/pages/TelehealthDashboard";
import PatientDetailView from "@/components/pages/PatientDetailView";
import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";

/** Legacy inline patient detail when store pins a patient id (rare). */
export function ControlPanelPatientsTab() {
  const activePatientId = useAppStore((state) => state.activePatientId);
  const setActivePatient = useAppStore((state) => state.setActivePatientId);

  if (activePatientId) {
    return (
      <div className="space-y-2 animate-in fade-in h-[calc(100vh-140px)]">
        <div className="flex items-center gap-2 border-b pb-4">
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

/** Single control-panel section body — one tab mounts at a time (dedicated routes). */
export function ControlPanelSectionContent({ tab }: { tab: ControlPanelSidebarTabValue }) {
  switch (tab) {
    case "overview":
      return <DashboardOverviewComponent />;
    case "telehealth":
      return <TelehealthDashboard />;
    case "appointment":
      return (
        <>
          <AppointmentAccessPermission />
          <InvitationList type="appointment" />
        </>
      );
    case "dashboard":
      return (
        <>
          <UserAccessPermission />
          <InvitationList type="dashboard" />
        </>
      );
    case "patients":
      return <ControlPanelPatientsTab />;
    case "categories":
      return <CategoryManagement />;
    case "visit_types_global":
      return (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Global Visit Types</h2>
            <p className="text-sm text-muted-foreground">
              Organization-wide visit templates available to every doctor for booking and the public
              Services page. Only admins can add or remove templates here.
            </p>
          </div>
          <GlobalAppointmentTypesEditor />
        </div>
      );
    case "doctors":
      return <DoctorManagement />;
    case "users_admin":
      return <UserManagement />;
    case "organizations":
      return <OrganizationManagement />;
    case "invoices":
      return <InvoiceManagement />;
    case "appointments_mgmt":
      return <AppointmentsManagement />;
    case "notifications":
      return <NotificationsManagement />;
    case "google-calendar":
      return <GoogleCalendarSettings />;
    default:
      return <DashboardOverviewComponent />;
  }
}
