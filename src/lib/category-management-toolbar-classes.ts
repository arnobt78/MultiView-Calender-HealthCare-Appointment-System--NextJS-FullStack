/**
 * Control-panel category list chrome — stat glow + sticky filter row (parity with patient list).
 */
import { cn } from "@/lib/utils";

export const categoryManagementStatsStripClass = "overflow-visible";

export const categoryManagementFilterToolbarClass = cn(
  "sticky z-10 flex min-h-[52px] flex-wrap items-center gap-2 overflow-visible bg-transparent"
);

/** Amber glass frame for category DataTable — not sky (appointments) or emerald (patients). */
export const amberGlassTableFrameClass =
  "rounded-2xl border border-amber-200/55 bg-white/90 shadow-[0_14px_48px_-12px_rgba(217,119,6,0.32)]";
