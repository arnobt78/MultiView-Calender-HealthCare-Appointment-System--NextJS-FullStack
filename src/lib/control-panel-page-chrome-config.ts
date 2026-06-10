/**
 * Control-panel section page chrome — icon/tone/title per sidebar tab.
 * Icons sourced from `CONTROL_PANEL_SIDEBAR_SECTIONS` (single source of truth).
 */

import type { LucideIcon } from "lucide-react";
import {
  CONTROL_PANEL_SIDEBAR_ITEM_LABEL,
  CONTROL_PANEL_SIDEBAR_SECTIONS,
  type ControlPanelSidebarTabValue,
} from "@/lib/control-panel-nav-config";
import type { PageChromeTone } from "@/lib/page-chrome-classes";
import { APPOINTMENT_TYPE_COPY } from "@/lib/appointment-type-copy";

/** Static subtitle leads — dynamic segments use ControlPanelHeaderSubtitle inline skeleton. */
export const CP_OVERVIEW_SUBTITLE_LEAD = "Real-time system summary — last updated";
export const CP_NOTIFICATIONS_SUBTITLE_LEAD = "Review in-app notifications —";
export const CP_USERS_ADMIN_SUBTITLE =
  "B2B admin accounts — register or Google sign-in. Demo doctors and patients are on their own management tabs.";

export type ControlPanelPageChromeConfig = {
  tab: ControlPanelSidebarTabValue;
  icon: LucideIcon;
  title: string;
  description: string;
  tone: PageChromeTone;
};

/** Flat map: sidebar tab value → Lucide icon (from nav config). */
const CONTROL_PANEL_TAB_ICON = Object.fromEntries(
  CONTROL_PANEL_SIDEBAR_SECTIONS.flatMap((section) =>
    section.items.map((item) => [item.value, item.icon] as const)
  )
) as Record<ControlPanelSidebarTabValue, LucideIcon>;

const CONTROL_PANEL_PAGE_DESCRIPTIONS: Record<ControlPanelSidebarTabValue, string> = {
  overview: CP_OVERVIEW_SUBTITLE_LEAD,
  telehealth: "Live telehealth queue — filter by status and join sessions.",
  appointment:
    "Invite users to book appointments and manage pending access requests.",
  dashboard:
    "Invite users to the shared calendar dashboard and manage access.",
  patients:
    "Create, edit, and manage patient records, care tiers, and primary doctors.",
  categories:
    "Organize visit categories for scheduling, billing, and reporting.",
  visit_types_global: APPOINTMENT_TYPE_COPY.pageSubtitleLabel,
  doctors:
    "Manage doctor profiles, specialties, schedules, and visit types.",
  users_admin: CP_USERS_ADMIN_SUBTITLE,
  organizations:
    "Manage clinic organizations, billing settings, and linked entities.",
  invoices:
    "Track invoices, payments, refunds, and billing KPIs.",
  appointments_mgmt:
    "View and manage all appointments across the organization.",
  notifications: CP_NOTIFICATIONS_SUBTITLE_LEAD,
  "google-calendar":
    "Connect Google Calendar for two-way sync with HealthCal Pro.",
};

/** Per-section tone — matches entity/dialog color families on each tab. */
const CONTROL_PANEL_PAGE_TONES: Record<ControlPanelSidebarTabValue, PageChromeTone> = {
  overview: "sky",
  telehealth: "violet",
  appointment: "indigo",
  dashboard: "slate",
  patients: "emerald",
  categories: "violet",
  visit_types_global: "amber",
  doctors: "sky",
  users_admin: "slate",
  organizations: "indigo",
  invoices: "amber",
  appointments_mgmt: "sky",
  notifications: "rose",
  "google-calendar": "sky",
};

export function getControlPanelPageChromeConfig(
  tab: ControlPanelSidebarTabValue
): ControlPanelPageChromeConfig {
  return {
    tab,
    icon: CONTROL_PANEL_TAB_ICON[tab],
    title: CONTROL_PANEL_SIDEBAR_ITEM_LABEL[tab],
    description: CONTROL_PANEL_PAGE_DESCRIPTIONS[tab],
    tone: CONTROL_PANEL_PAGE_TONES[tab],
  };
}
