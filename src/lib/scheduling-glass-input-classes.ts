import {
  doctorSettingsCalendarPickerInsetClass,
  doctorSettingsGlassTextRowClass,
} from "@/lib/doctor-settings-glass-fields";
import { cn } from "@/lib/utils";

/** Datetime-local — staff dialog height; sky tone for manual override. */
export const glassDatetimeLocalInputClass = cn(
  doctorSettingsGlassTextRowClass.sky,
  doctorSettingsCalendarPickerInsetClass
);

export const glassDatetimeLocalInputClassAmber = cn(
  doctorSettingsGlassTextRowClass.amber,
  doctorSettingsCalendarPickerInsetClass
);

/** Time input — portal weekly editor (`h-9`). */
export const glassTimeInputClass = cn(
  doctorSettingsGlassTextRowClass.sky,
  "h-9 min-h-9 rounded-xl",
  doctorSettingsCalendarPickerInsetClass
);
