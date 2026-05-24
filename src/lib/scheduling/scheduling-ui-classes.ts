/**
 * Shared Tailwind tokens for scheduling month picker + slot chip grid (patient + staff).
 */
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const schedulingCalendarNavButtonClass = cn(
  buttonVariants({ variant: "outline" }),
  "relative static size-8 shrink-0 border-sky-200/80 bg-white/90 p-0 opacity-100 shadow-none",
  "hover:border-sky-400 hover:bg-sky-50 hover:opacity-100",
  "disabled:pointer-events-none disabled:opacity-40"
);

/** shadcn Calendar classNames — sky circles; nav is custom via SchedulingMonthCaptionBar. */
export const schedulingMonthCalendarClassNames = {
  months: "flex w-full flex-col",
  month: "flex w-full flex-col gap-2",
  month_caption: "mb-0 flex w-full items-center justify-between gap-2 px-0.5",
  caption_label: "flex-1 text-center text-sm font-semibold text-sky-900",
  nav: "hidden",
  button_previous: schedulingCalendarNavButtonClass,
  button_next: schedulingCalendarNavButtonClass,
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday: "text-muted-foreground w-9 font-medium text-[0.75rem]",
  week: "flex w-full mt-1",
  day: "p-0 text-center",
  day_button: cn(
    "size-9 rounded-full p-0 font-normal transition-colors",
    "hover:bg-sky-100 hover:text-sky-950"
  ),
  /** RD v10: `selected` / `data-selected` live on the Day gridcell — style the inner button via `[&_button]`. */
  selected: cn(
    "[&_button]:!bg-sky-600 [&_button]:!text-white [&_button]:font-semibold",
    "[&_button]:!ring-0 [&_button]:!ring-offset-0",
    "[&_button]:shadow-[0_4px_14px_rgba(2,132,199,0.35)]",
    "[&_button]:hover:!bg-sky-600 [&_button]:hover:!text-white"
  ),
  /** Today = soft sky ring; user-picked day uses `selected` (wins when same day). */
  today: cn(
    "[&_button]:bg-sky-200/95 [&_button]:text-sky-950 [&_button]:font-semibold",
    "[&_button]:ring-2 [&_button]:ring-sky-500/75 [&_button]:ring-offset-1"
  ),
  outside: "text-muted-foreground/60",
  disabled: "text-muted-foreground opacity-40",
  hidden: "invisible",
} as const;

/** Max 4 columns — avoids 7–10 skinny chips on wide booking dialogs. */
export const schedulingSlotGridClass = {
  rail: "grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  default: "grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-3xl",
} as const;

/**
 * Padding on the `overflow-y-auto` scroll root — chip shadows paint inside this inset (negative-
 * margin bleed does not escape overflow clipping).
 */
/** Inset inside scroll *content* box — chip shadow must not cross the inner padding edge. */
export const schedulingSlotGridScrollInsetClass = "px-4 py-2";

/**
 * Grid cell wrapper — inset so `box-shadow` stays inside the scroll content box (not the padding box).
 */
export const schedulingSlotChipCellClass = "min-w-0 overflow-visible p-2";

/** @deprecated Negative-margin bleed is clipped by overflow scrollports — use scroll inset + chip cell. */
export const schedulingSlotScrollShadowBleedClass = schedulingSlotGridScrollInsetClass;

/** @deprecated */
export const schedulingSlotScrollShadowBleedRailClass = schedulingSlotGridScrollInsetClass;

/** @deprecated Flex items force overflow:auto — use `schedulingSlotGridScrollInsetClass` on scroll. */
export const schedulingSplitSlotsRailFlexBleedClass = "";

/** Typed slot chip — selected state outer glow. */
export const schedulingSlotChipSelectedClass =
  "border-sky-500 bg-sky-600 text-white shadow-[0_8px_20px_rgba(2,132,199,0.35)]";

export const schedulingSlotChipAvailableClass =
  "border-sky-200/80 bg-white/90 text-sky-900 hover:border-sky-400 hover:bg-sky-50";

export const schedulingSlotChipDisabledClass =
  "cursor-not-allowed border-slate-200/80 bg-slate-50/90 text-slate-400 opacity-70";

/** Scroll shell for slot grids — avoid `overflow-x-hidden` so horizontal glow is not clipped. */
export const schedulingSlotGridScrollClass = {
  rail: cn(
    "min-h-0 flex-1 overflow-y-auto overscroll-contain",
    schedulingSlotGridScrollInsetClass,
    "[scrollbar-gutter:stable]"
  ),
  default: cn(
    "overflow-y-auto overscroll-contain",
    schedulingSlotGridScrollInsetClass,
    "[scrollbar-gutter:stable]"
  ),
  defaultCapped: cn(
    "max-h-56 overflow-y-auto overscroll-contain",
    schedulingSlotGridScrollInsetClass,
    "[scrollbar-gutter:stable]"
  ),
} as const;

/** Slot rail height when parent uses fillLayout (dialog step 2 / staff dialog). */
export const schedulingSplitSlotsRailBoundsClass =
  "min-h-[160px] max-h-[min(48vh,26rem)] sm:max-h-[min(52vh,28rem)]";
