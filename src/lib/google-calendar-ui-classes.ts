/**
 * Google Calendar CP — glass panel tokens (sky/emerald/indigo/violet/rose/amber).
 * Softer translucency than global CP cards — avoids flat `via-white` fill on settings tab.
 */

import { cn } from "@/lib/utils";
import { controlPanelGlassCardBaseClass } from "@/lib/control-panel-glass-card";

export type GoogleCalendarPanelTone =
  | "sky"
  | "emerald"
  | "indigo"
  | "violet"
  | "rose"
  | "amber";

/** Tone-specific glass glow — lighter center so backdrop shows through. */
const GOOGLE_CALENDAR_PANEL_GLASS: Record<GoogleCalendarPanelTone, string> = {
  sky: "border-sky-400/25 from-sky-500/10 via-white/20 to-white/45 shadow-[0_24px_60px_rgba(2,132,199,0.12)]",
  emerald:
    "border-emerald-400/25 from-emerald-500/10 via-white/20 to-white/45 shadow-[0_24px_60px_rgba(16,185,129,0.12)]",
  indigo:
    "border-indigo-400/25 from-indigo-500/10 via-white/20 to-white/45 shadow-[0_24px_60px_rgba(99,102,241,0.12)]",
  violet:
    "border-violet-400/25 from-violet-500/10 via-white/20 to-white/45 shadow-[0_24px_60px_rgba(139,92,246,0.12)]",
  rose: "border-rose-400/25 from-rose-500/10 via-white/20 to-white/45 shadow-[0_24px_60px_rgba(225,29,72,0.12)]",
  amber:
    "border-amber-400/25 from-amber-500/10 via-white/20 to-white/45 shadow-[0_24px_60px_rgba(245,158,11,0.12)]",
};

/** Settings card shell — tone-specific glow. */
export function googleCalendarPanelCardClass(tone: GoogleCalendarPanelTone): string {
  return cn(controlPanelGlassCardBaseClass, GOOGLE_CALENDAR_PANEL_GLASS[tone]);
}

export const googleCalendarPanelCardContentClass = "p-4 text-gray-700";

export const googleCalendarConnectionConnectedValueClass = "text-emerald-700";
export const googleCalendarConnectionDisconnectedValueClass = "text-slate-500";

/** User-facing calendar import/export copy — feature titles (not file-extension labels). */
export const googleCalendarIcsCopy = {
  importTitle: "Import external appointments",
  importSubtitle:
    "Upload a calendar file (.ics) from Google Calendar, Outlook, or Apple Calendar.",
  exportTitle: "Export Appointments",
  exportSubtitle:
    "Download your scoped appointments as a calendar file (.ics) for use in other apps.",
  advancedImportTitle: "Import with treating physician / doctor",
  advancedImportDialogDescription:
    "Assign a treating physician and upload a .ics file. Imported visits appear in Appointment Management and the dashboard calendar.",
  advancedImportInfoNote:
    "Choose the doctor who will treat every imported visit, then select a calendar file (.ics) from Google, Outlook, or Apple Calendar. After import, open Control Panel → Appointment Management or the Dashboard calendar to review and edit the new appointments.",
  advancedImportCalendarFileLabel: "Upload Calendar File (.ics)",
  advancedImportSubtitle:
    "Import calendar events from an external file and assign the doctor responsible for each visit.",
  advancedImportOpenButton: "Select Doctor & Import",
  chooseFileButton: "Choose .ics file",
  downloadButton: "Download .ics file",
  exportHeaderButton: "Export Appointments",
} as const;

/** Advanced import dialog — emerald 90vw/90vh parity with patient dialog. */
export const googleCalendarAdvancedImportDialogShellClass =
  "flex h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] flex-col gap-0 overflow-hidden rounded-[28px] border border-emerald-400/30 bg-white p-0 shadow-[0_30px_80px_rgba(16,185,129,0.35)] backdrop-blur-sm";

/** How-it-works callout — mirrors Import ICS violet info panel with emerald glow. */
export const googleCalendarAdvancedImportInfoNoteClass =
  "rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-3 text-xs text-emerald-900 shadow-[0_8px_24px_rgba(16,185,129,0.12)]";

/** Inline warning when connected but Google list API fails (e.g. Calendar API disabled). */
export const googleCalendarEventsFetchWarningBannerClass =
  "flex flex-col gap-3 rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-amber-950 shadow-[0_8px_24px_rgba(245,158,11,0.12)] sm:flex-row sm:items-start sm:justify-between";

export const googleCalendarWarningCopy = {
  enableApiLinkLabel: "Enable Google Calendar API",
} as const;
