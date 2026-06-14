/**
 * Google Calendar events preview — client-side toolbar filter presets (cached events array).
 */

import { Calendar, CalendarClock, CalendarDays, MapPin, MapPinOff } from "lucide-react";
import type { FilterSelectOption } from "@/components/shared/filters/FilterSelect";

/** Time window relative to now. */
export type GoogleCalendarEventWindowFilter = "all" | "upcoming" | "past" | "next7";

/** All-day vs timed events. */
export type GoogleCalendarEventScheduleFilter = "all" | "all_day" | "timed";

/** Location presence. */
export type GoogleCalendarEventLocationFilter = "all" | "with_location" | "no_location";

export const GOOGLE_CALENDAR_EVENT_WINDOW_OPTIONS: readonly FilterSelectOption<GoogleCalendarEventWindowFilter>[] =
  [
    { value: "all", label: "All Events", icon: Calendar, iconClassName: "text-sky-600" },
    {
      value: "upcoming",
      label: "Upcoming",
      icon: CalendarClock,
      iconClassName: "text-emerald-600",
    },
    { value: "past", label: "Past", icon: CalendarDays, iconClassName: "text-slate-600" },
    {
      value: "next7",
      label: "Next 7 Days",
      icon: CalendarClock,
      iconClassName: "text-indigo-600",
    },
  ];

export const GOOGLE_CALENDAR_EVENT_SCHEDULE_OPTIONS: readonly FilterSelectOption<GoogleCalendarEventScheduleFilter>[] =
  [
    { value: "all", label: "All Types", icon: Calendar, iconClassName: "text-sky-600" },
    {
      value: "all_day",
      label: "All-Day",
      icon: CalendarDays,
      iconClassName: "text-violet-600",
    },
    {
      value: "timed",
      label: "Timed",
      icon: CalendarClock,
      iconClassName: "text-blue-600",
    },
  ];

export const GOOGLE_CALENDAR_EVENT_LOCATION_OPTIONS: readonly FilterSelectOption<GoogleCalendarEventLocationFilter>[] =
  [
    { value: "all", label: "Any Location", icon: MapPin, iconClassName: "text-sky-600" },
    {
      value: "with_location",
      label: "With Location",
      icon: MapPin,
      iconClassName: "text-emerald-600",
    },
    {
      value: "no_location",
      label: "No Location",
      icon: MapPinOff,
      iconClassName: "text-slate-500",
    },
  ];

export const DEFAULT_GOOGLE_CALENDAR_EVENT_FILTERS = {
  window: "all" as GoogleCalendarEventWindowFilter,
  schedule: "all" as GoogleCalendarEventScheduleFilter,
  location: "all" as GoogleCalendarEventLocationFilter,
  search: "",
};

export function hasActiveGoogleCalendarEventFilters(filters: {
  window: GoogleCalendarEventWindowFilter;
  schedule: GoogleCalendarEventScheduleFilter;
  location: GoogleCalendarEventLocationFilter;
  search: string;
}): boolean {
  return (
    filters.window !== "all" ||
    filters.schedule !== "all" ||
    filters.location !== "all" ||
    filters.search.trim().length > 0
  );
}
