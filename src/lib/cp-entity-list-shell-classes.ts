/**
 * Tone tokens for ControlPanelEntityListShell — static chrome only (no data).
 */

import {
  amberGlassTableFrameClass,
} from "@/lib/category-management-toolbar-classes";
import {
  emeraldGlassTableFrameClass,
} from "@/lib/doctor-management-toolbar-classes";
import { skyGlassTableFrameClass, indigoGlassTableFrameClass } from "@/lib/calendar-header-action-styles";
import { violetGlassTableFrameClass } from "@/lib/violet-glass-table-frame";
import { clinicalListStatsStripClass } from "@/lib/clinical-list-filter-toolbar-classes";

/** Rose-tinted glass frame for CP notifications list table. */
export const roseGlassTableFrameClass =
  "rounded-2xl border border-rose-200/55 bg-white/90 shadow-[0_14px_48px_-12px_rgba(244,63,94,0.32)]";

export type CpEntityListTone = "sky" | "violet" | "emerald" | "slate" | "amber" | "indigo" | "rose";

/** Slate-tinted glass frame for user-admin-management list table. */
export const slateGlassTableFrameClass =
  "rounded-[28px] border border-slate-300/40 bg-gradient-to-br from-slate-500/5 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(100,116,139,0.14)]";

/** Glass table frame per entity list tone. */
export const cpEntityListTableFrameClass: Record<CpEntityListTone, string> = {
  sky: skyGlassTableFrameClass,
  violet: violetGlassTableFrameClass,
  emerald: emeraldGlassTableFrameClass,
  slate: slateGlassTableFrameClass,
  amber: amberGlassTableFrameClass,
  indigo: indigoGlassTableFrameClass,
  rose: roseGlassTableFrameClass,
};

export const cpEntityListStatsStripClass = clinicalListStatsStripClass;
