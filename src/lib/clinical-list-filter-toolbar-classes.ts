/**
 * Shared sticky filter row for control-panel entity lists (patient/category/doctor).
 * Transparent shell — stat card glows bleed through; inputs keep their own white surfaces.
 */
import { cn } from "@/lib/utils";

export const clinicalListStatsStripClass = "overflow-visible";

export const clinicalListFilterToolbarClass = cn(
  "sticky z-10 flex min-h-[52px] flex-wrap items-center gap-2 overflow-visible bg-transparent"
);

/** Reset chip — pushed to the trailing edge via `ml-auto` in `ClinicalListFilterToolbar`. */
export const clinicalListFilterResetButtonClass =
  "ml-auto h-10 shrink-0 px-4 [&_svg]:size-4";
