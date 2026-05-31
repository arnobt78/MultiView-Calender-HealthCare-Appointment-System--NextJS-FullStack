import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  Calendar,
  CalendarDays,
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

/** Control-panel sidebar tab values — shared by desktop nav, mobile sheet, and dedicated section pages. */
export const CONTROL_PANEL_SIDEBAR_ITEMS = [
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

export type ControlPanelSidebarTabValue = (typeof CONTROL_PANEL_SIDEBAR_ITEMS)[number]["value"];

export const CONTROL_PANEL_SIDEBAR_ITEM_LABEL = Object.fromEntries(
  CONTROL_PANEL_SIDEBAR_ITEMS.map((item) => [item.value, item.label])
) as Record<ControlPanelSidebarTabValue, string>;

export const CONTROL_PANEL_TAB_TO_SEGMENT: Record<string, string> = {
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

export const CONTROL_PANEL_SEGMENT_TO_TAB = {
  ...Object.fromEntries(
    Object.entries(CONTROL_PANEL_TAB_TO_SEGMENT).map(([tab, segment]) => [segment, tab])
  ),
  /** Legacy alias + detail sub-routes highlight parent section in sidebar. */
  "doctor-user-management": "doctors",
  patients: "patients",
  categories: "categories",
  appointments: "appointments_mgmt",
  doctors: "doctors",
  invoices: "invoices",
  organizations: "organizations",
  users: "users_admin",
} as Record<string, ControlPanelSidebarTabValue>;

export const CONTROL_PANEL_SIDEBAR_SECTIONS: readonly {
  heading: string;
  items: readonly { value: ControlPanelSidebarTabValue; icon: LucideIcon }[];
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
    items: [{ value: "google-calendar", icon: Calendar }],
  },
];

export const CONTROL_PANEL_NAV_BORDER = "border-gray-100/80";

export const controlPanelSidebarTriggerClass =
  "!m-0 !h-auto !min-h-0 !gap-0 !px-0 !py-2.5 w-full cursor-pointer items-start justify-start rounded-none border-0 text-left text-sm font-normal shadow-none transition-colors text-gray-700 hover:bg-gray-50 hover:text-gray-700 data-[state=active]:rounded-md data-[state=active]:bg-sky-100 data-[state=active]:text-sky-800 data-[state=active]:shadow-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-gray-500 data-[state=active]:[&_svg]:text-sky-700 after:hidden! data-[state=active]:after:hidden!";

export const controlPanelSidebarItemLabelClass =
  "min-w-0 flex-1 pl-2 leading-snug break-words";
