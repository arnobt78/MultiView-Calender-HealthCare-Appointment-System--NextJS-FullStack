/** Shared calendar grid — outer/month grid use globals (.calendar-grid-*); inner lines stay Tailwind tokens. */

export const calendarGridShell = "calendar-grid-outer";

export const calendarGridMonthShell =
  "calendar-grid-outer-inset flex min-h-0 flex-1 flex-col";

export const calendarGridMonthWeekdaysStrip =
  "calendar-grid-month-weekdays text-sm";

export const calendarGridMonthGrid = "calendar-grid-month-body";

export const calendarGridMonthSidePanel =
  "h-fit w-full md:sticky md:top-0 md:w-[350px]";

export const calendarGridDayRow =
  "flex min-h-16 border-b border-border last:border-b-0";

export const calendarGridDayTimeGutter =
  "w-14 shrink-0 bg-gray-50 pt-1 pr-2 text-right text-[11px] text-muted-foreground";

export const calendarGridMonthWeekdayHeader =
  "flex h-10 min-h-10 items-center justify-center gap-2 bg-gray-50 px-2 py-1 text-center font-medium text-gray-600 flex-wrap";

export const calendarGridDaySlot =
  "relative min-h-0 flex-1 border-l border-border";

export const calendarGridHalfHourLine =
  "pointer-events-none absolute top-1/2 right-0 left-0 border-t border-dashed border-muted-foreground/20";

export const calendarGridWeekOuterShell =
  "week-scroll-container calendar-grid-outer-inset";

export const calendarGridWeekHeaderCell =
  "flex h-10 min-h-10 items-center justify-center gap-2 border-b border-r border-border bg-gray-50 px-2 py-1 text-center font-medium text-gray-600 week-day-header flex-wrap";

export const calendarGridWeekStickyCorner =
  "h-10 border-b border-r border-border bg-gray-50 week-sticky-corner";

export const calendarGridWeekHourCell =
  "border-b border-r border-border bg-gray-50 px-2 py-2 text-xs text-gray-500 week-hour-cell";

export const calendarGridWeekSlotCell =
  "relative border-b border-r border-border week-slot-cell";
