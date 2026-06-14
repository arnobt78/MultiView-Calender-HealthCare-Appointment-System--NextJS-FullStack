"use client";

import { useMemo, useState } from "react";
import { CalendarRange } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { ClinicalListFilterToolbar } from "@/components/shared/filters/ClinicalListFilterToolbar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { PortalPanelSubsectionHeader } from "@/components/shared/PortalPanelSubsectionHeader";
import { ControlPanelEntityListShell } from "@/components/control-panel/ControlPanelEntityListShell";
import { buildGoogleCalendarEventColumns } from "@/components/control-panel/google-calendar/google-calendar-event-columns";
import {
  filterGoogleCalendarEvents,
  getGoogleCalendarEventSearchBlob,
} from "@/lib/google-calendar-display";
import {
  DEFAULT_GOOGLE_CALENDAR_EVENT_FILTERS,
  GOOGLE_CALENDAR_EVENT_LOCATION_OPTIONS,
  GOOGLE_CALENDAR_EVENT_SCHEDULE_OPTIONS,
  GOOGLE_CALENDAR_EVENT_WINDOW_OPTIONS,
  hasActiveGoogleCalendarEventFilters,
  type GoogleCalendarEventLocationFilter,
  type GoogleCalendarEventScheduleFilter,
  type GoogleCalendarEventWindowFilter,
} from "@/lib/google-calendar-event-filters";
import { findFilterOptionLabel } from "@/lib/filter-select-option-presets";
import { cpClinicalListTableFrameClassName } from "@/lib/cp-clinical-list-table-classes";
import {
  googleCalendarPanelCardClass,
  googleCalendarPanelCardContentClass,
} from "@/lib/google-calendar-ui-classes";
import { APP_INNER_SCROLL_STICKY_TOP_CLASS } from "@/lib/portal-z-index";
import type { GoogleCalendarEvent } from "@/types/google-calendar";
import { cn } from "@/lib/utils";

type Props = {
  events: GoogleCalendarEvent[];
  isConnected: boolean;
  listBodyLoading: boolean;
};

/** Indigo glass — preview of Google events pulled via GET /api/calendar/sync. */
export function GoogleCalendarEventsPanel({
  events,
  isConnected,
  listBodyLoading,
}: Props) {
  const [windowFilter, setWindowFilter] = useState<GoogleCalendarEventWindowFilter>(
    DEFAULT_GOOGLE_CALENDAR_EVENT_FILTERS.window
  );
  const [scheduleFilter, setScheduleFilter] = useState<GoogleCalendarEventScheduleFilter>(
    DEFAULT_GOOGLE_CALENDAR_EVENT_FILTERS.schedule
  );
  const [locationFilter, setLocationFilter] = useState<GoogleCalendarEventLocationFilter>(
    DEFAULT_GOOGLE_CALENDAR_EVENT_FILTERS.location
  );
  const [listSearch, setListSearch] = useState(DEFAULT_GOOGLE_CALENDAR_EVENT_FILTERS.search);

  const columns = useMemo(() => buildGoogleCalendarEventColumns(), []);

  const filteredEvents = useMemo(
    () =>
      filterGoogleCalendarEvents(events, {
        window: windowFilter,
        schedule: scheduleFilter,
        location: locationFilter,
        search: "",
      }),
    [events, windowFilter, scheduleFilter, locationFilter]
  );

  const hasToolbarFilters = hasActiveGoogleCalendarEventFilters({
    window: windowFilter,
    schedule: scheduleFilter,
    location: locationFilter,
    search: listSearch,
  });

  const filtersDisabled = !isConnected;

  function resetToolbar() {
    setWindowFilter(DEFAULT_GOOGLE_CALENDAR_EVENT_FILTERS.window);
    setScheduleFilter(DEFAULT_GOOGLE_CALENDAR_EVENT_FILTERS.schedule);
    setLocationFilter(DEFAULT_GOOGLE_CALENDAR_EVENT_FILTERS.location);
    setListSearch(DEFAULT_GOOGLE_CALENDAR_EVENT_FILTERS.search);
  }

  const emptyMessage = !isConnected
    ? "Connect Google Calendar to preview events."
    : hasToolbarFilters
      ? "No Google events match your filters."
      : "No Google events found in the selected window.";

  return (
    <Card className={cn(googleCalendarPanelCardClass("indigo"), "gap-0")}>
      <CardContent className={googleCalendarPanelCardContentClass}>
        <PortalPanelSubsectionHeader
          title="Google Events Preview"
          subtitle={
            isConnected
              ? "Read-only preview from your linked Google Calendar (up to 100 events)."
              : "Connect Google Calendar to load events here."
          }
          icon={CalendarRange}
          iconClassName="border-indigo-100/80 bg-indigo-50/70 [&_svg]:text-indigo-600"
          count={isConnected ? events.length : undefined}
          countSkeleton={listBodyLoading}
        />

        {/* CP list shell — toolbar above indigo table frame (patient-management parity). */}
        <ControlPanelEntityListShell
          tone="indigo"
          fullSection={false}
          toolbarSlot={
            <ClinicalListFilterToolbar
              className="mt-3"
              stickyClassName={APP_INNER_SCROLL_STICKY_TOP_CLASS}
              search={{
                value: listSearch,
                onChange: setListSearch,
                placeholder: isConnected
                  ? "Search… (title, location, date)"
                  : "Connect Google Calendar to search events",
                ariaLabel: "Search Google Calendar events",
                disabled: filtersDisabled,
              }}
              showReset={isConnected && hasToolbarFilters}
              onReset={resetToolbar}
            >
              <FilterSelect
                value={windowFilter}
                onValueChange={setWindowFilter}
                displayLabel={findFilterOptionLabel(
                  GOOGLE_CALENDAR_EVENT_WINDOW_OPTIONS,
                  windowFilter,
                  "All Events"
                )}
                size="toolbar"
                triggerClassName="max-w-[180px]"
                ariaLabel="Filter events by time window"
                options={GOOGLE_CALENDAR_EVENT_WINDOW_OPTIONS}
                disabled={filtersDisabled}
              />
              <FilterSelect
                value={scheduleFilter}
                onValueChange={setScheduleFilter}
                displayLabel={findFilterOptionLabel(
                  GOOGLE_CALENDAR_EVENT_SCHEDULE_OPTIONS,
                  scheduleFilter,
                  "All Types"
                )}
                size="toolbar"
                triggerClassName="max-w-[160px]"
                ariaLabel="Filter events by schedule type"
                options={GOOGLE_CALENDAR_EVENT_SCHEDULE_OPTIONS}
                disabled={filtersDisabled}
              />
              <FilterSelect
                value={locationFilter}
                onValueChange={setLocationFilter}
                displayLabel={findFilterOptionLabel(
                  GOOGLE_CALENDAR_EVENT_LOCATION_OPTIONS,
                  locationFilter,
                  "Any Location"
                )}
                size="toolbar"
                triggerClassName="max-w-[180px]"
                ariaLabel="Filter events by location"
                options={GOOGLE_CALENDAR_EVENT_LOCATION_OPTIONS}
                disabled={filtersDisabled}
              />
            </ClinicalListFilterToolbar>
          }
          tableSlot={
            <DataTable
              columns={columns}
              data={isConnected ? filteredEvents : []}
              isLoading={listBodyLoading}
              {...(isConnected
                ? {
                    globalFilterFn: (row: GoogleCalendarEvent, filterValue: string) => {
                      const query = filterValue.trim().toLowerCase();
                      if (!query) return true;
                      return getGoogleCalendarEventSearchBlob(row).includes(query);
                    },
                  }
                : {})}
              externalGlobalFilter={{ value: listSearch, onChange: setListSearch }}
              emptyMessage={emptyMessage}
              tableClassName="min-w-[960px] w-full"
              tableFrameClassName={cpClinicalListTableFrameClassName}
              tableLayout="auto"
              pagination={isConnected && filteredEvents.length > 10}
              pageSize={10}
            />
          }
        />
      </CardContent>
    </Card>
  );
}
