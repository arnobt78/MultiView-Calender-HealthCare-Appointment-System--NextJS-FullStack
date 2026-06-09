/**
 * Portal route page chrome — icon/tone/title per authenticated portal section.
 */

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  FileCode,
  LayoutDashboard,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import type { PageChromeTone } from "@/lib/page-chrome-classes";
import {
  INSIGHTS_PAGE_BODY,
  INSIGHTS_PAGE_TITLE,
} from "@/lib/insights-page-copy";

export type PortalPageChromeRouteKey =
  | "patient_portal"
  | "services"
  | "insights"
  | "admin_portal"
  | "api_docs"
  | "api_status";

export type PortalPageChromeConfig = {
  route: PortalPageChromeRouteKey;
  icon: LucideIcon;
  title: string;
  description: string;
  tone: PageChromeTone;
};

const PORTAL_PAGE_CHROME: Record<PortalPageChromeRouteKey, PortalPageChromeConfig> = {
  patient_portal: {
    route: "patient_portal",
    icon: Activity,
    tone: "emerald",
    title: "Patient Portal",
    description: "View your appointment history and request new appointments",
  },
  services: {
    route: "services",
    icon: Stethoscope,
    tone: "sky",
    title: "Doctors & Services",
    description:
      "Browse our specialist doctors and available appointment services and book your appointment with ease.",
  },
  insights: {
    route: "insights",
    icon: TrendingUp,
    tone: "violet",
    title: INSIGHTS_PAGE_TITLE,
    description: INSIGHTS_PAGE_BODY,
  },
  admin_portal: {
    route: "admin_portal",
    icon: LayoutDashboard,
    tone: "indigo",
    title: "Admin Portal",
    description: "Clinic-wide overview and operational snapshot",
  },
  api_docs: {
    route: "api_docs",
    icon: FileCode,
    tone: "indigo",
    title: "API Documentation",
    description:
      "REST endpoints for appointments, invitations, permissions, and user management",
  },
  api_status: {
    route: "api_status",
    icon: Activity,
    tone: "slate",
    title: "API & Project Status",
    description: "Health checks and endpoint availability for HealthCal Pro",
  },
};

export function getPortalPageChromeConfig(
  route: PortalPageChromeRouteKey
): PortalPageChromeConfig {
  return PORTAL_PAGE_CHROME[route];
}
