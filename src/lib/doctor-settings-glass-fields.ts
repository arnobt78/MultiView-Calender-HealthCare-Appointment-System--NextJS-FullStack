/**
 * Doctor portal schedule form controls — same glass tokens as staff appointment dialog.
 * Text + select + datetime share `staffAppointmentGlassRowControlBase` so glow matches dialog fields.
 */

import {
  staffAppointmentGlassRowControlBase,
  staffAppointmentGlassSelectTriggerClass,
} from "@/lib/appointment-dialog-ui-classes";
import { cn } from "@/lib/utils";

const glassFieldFocusSkyClass =
  "placeholder:text-gray-500 focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-200/40";

const glassFieldFocusAmberClass =
  "placeholder:text-gray-500 focus-visible:border-amber-400/50 focus-visible:ring-2 focus-visible:ring-amber-200/40";

/** Full `h-11` row — pairs with `SchedulingDatetimeRangeFields` in time-off forms. */
export const doctorSettingsGlassTextRowClass = {
  sky: cn(staffAppointmentGlassRowControlBase, "cursor-text", glassFieldFocusSkyClass),
  amber: cn(
    staffAppointmentGlassRowControlBase,
    "cursor-text border-amber-200/50 shadow-[0_8px_24px_rgba(245,158,11,0.14)]",
    glassFieldFocusAmberClass
  ),
} as const;

/** Portal density (`h-9`) — weekly day/timezone grid. */
export const doctorSettingsGlassTextInputClass = {
  sky: cn(doctorSettingsGlassTextRowClass.sky, "h-9 min-h-9 rounded-xl"),
  amber: cn(doctorSettingsGlassTextRowClass.amber, "h-9 min-h-9 rounded-xl"),
} as const;

export const doctorSettingsGlassSelectTriggerClass = cn(
  staffAppointmentGlassSelectTriggerClass,
  "h-9 min-h-9 rounded-xl data-[placeholder]:text-gray-500",
  "[&_[data-slot=select-value]]:line-clamp-1 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:text-left"
);

export const doctorSettingsCalendarPickerInsetClass =
  "relative cursor-pointer pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer";
