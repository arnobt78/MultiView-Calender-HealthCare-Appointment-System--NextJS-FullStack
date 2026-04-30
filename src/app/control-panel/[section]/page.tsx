import ControlPanelPage from "@/components/pages/ControlPanelPage";
import { getSessionUser } from "@/lib/session";

const SECTION_TO_TAB: Record<string, string> = {
  "dashboard-overview": "overview",
  "telehealth-queue": "telehealth",
  "appointment-access-invitation": "appointment",
  "user-dashboard-access-invitation": "dashboard",
  "patient-management": "patients",
  "category-management": "categories",
  "doctor-management": "doctors",
  "doctor-user-management": "doctors",
  "user-admin-management": "users_admin",
  "relative-management": "relatives",
  "organization-management": "organizations",
  "invoice-management": "invoices",
  "appointment-management": "appointments_mgmt",
  notifications: "notifications",
  "activity-log": "activities",
  "google-calendar": "google-calendar",
};

export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const sessionUser = await getSessionUser();
  const initialTab = SECTION_TO_TAB[section] ?? "overview";
  return <ControlPanelPage initialSession={sessionUser} initialTab={initialTab} />;
}
