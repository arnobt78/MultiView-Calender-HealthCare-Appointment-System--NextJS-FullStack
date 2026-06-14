/**
 * Google Calendar event status — glass badge tokens for CP events preview table.
 */

import type { LucideIcon } from "lucide-react";
import { Ban, CalendarCheck, HelpCircle, Hourglass } from "lucide-react";
import type { GoogleCalendarEventStatus } from "@/types/google-calendar";

export type GoogleCalendarEventStatusKey = "confirmed" | "tentative" | "cancelled" | "unknown";

export type GoogleCalendarEventStatusMeta = {
  key: GoogleCalendarEventStatusKey;
  label: string;
  glassClass: string;
  Icon: LucideIcon;
};

const META: Record<GoogleCalendarEventStatusKey, GoogleCalendarEventStatusMeta> = {
  confirmed: {
    key: "confirmed",
    label: "Confirmed",
    glassClass: "calendar-glass-badge-emerald",
    Icon: CalendarCheck,
  },
  tentative: {
    key: "tentative",
    label: "Tentative",
    glassClass: "calendar-glass-badge-amber",
    Icon: Hourglass,
  },
  cancelled: {
    key: "cancelled",
    label: "Cancelled",
    glassClass: "calendar-glass-badge-slate",
    Icon: Ban,
  },
  unknown: {
    key: "unknown",
    label: "Unknown",
    glassClass: "calendar-glass-badge-slate",
    Icon: HelpCircle,
  },
};

/** Normalize Google API status strings for badge display. */
export function normalizeGoogleCalendarEventStatus(
  status?: GoogleCalendarEventStatus | null
): GoogleCalendarEventStatusKey {
  const raw = status?.trim().toLowerCase();
  if (raw === "confirmed") return "confirmed";
  if (raw === "tentative") return "tentative";
  if (raw === "cancelled") return "cancelled";
  return "unknown";
}

export function resolveGoogleCalendarEventStatusMeta(
  status?: GoogleCalendarEventStatus | null
): GoogleCalendarEventStatusMeta {
  return META[normalizeGoogleCalendarEventStatus(status)];
}
