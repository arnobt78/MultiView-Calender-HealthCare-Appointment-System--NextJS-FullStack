/**
 * Control-panel patient list chrome — stat glow must paint over the filter row without a solid bar clipping it.
 */
import { cn } from "@/lib/utils";

/** Wraps KPI stat grid — allow colored card shadows to extend below the row. */
export const patientManagementStatsStripClass = "overflow-visible";

/**
 * Sticky search + FilterSelect row — transparent (no bg/backdrop) so stat card outer glows bleed through.
 * Individual inputs keep their own white surfaces via `FilterSelect` / search `Input`.
 */
export const patientManagementFilterToolbarClass = cn(
  "sticky z-10 flex min-h-[52px] flex-wrap items-center gap-2 overflow-visible bg-transparent"
);
