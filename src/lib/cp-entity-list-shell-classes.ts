/**
 * Tone tokens for ControlPanelEntityListShell — static chrome only (no data).
 */

import {
  amberGlassTableFrameClass,
} from "@/lib/category-management-toolbar-classes";
import {
  emeraldGlassTableFrameClass,
} from "@/lib/doctor-management-toolbar-classes";
import { skyGlassTableFrameClass } from "@/lib/calendar-header-action-styles";
import { clinicalListStatsStripClass } from "@/lib/clinical-list-filter-toolbar-classes";

export type CpEntityListTone = "sky" | "violet" | "emerald" | "slate" | "amber" | "indigo";

/** Slate-tinted glass frame for user-admin-management list table. */
export const slateGlassTableFrameClass =
  "rounded-[28px] border border-slate-300/40 bg-gradient-to-br from-slate-500/5 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(100,116,139,0.14)]";

/** Glass table frame per entity list tone. */
export const cpEntityListTableFrameClass: Record<CpEntityListTone, string> = {
  sky: skyGlassTableFrameClass,
  violet: skyGlassTableFrameClass,
  emerald: emeraldGlassTableFrameClass,
  slate: slateGlassTableFrameClass,
  amber: amberGlassTableFrameClass,
  indigo:
    "rounded-[28px] border bg-gradient-to-br from-indigo-500/5 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(99,102,241,0.08)]",
};

export const cpEntityListStatsStripClass = clinicalListStatsStripClass;
