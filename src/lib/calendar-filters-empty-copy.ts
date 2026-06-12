/**
 * Dashboard calendar — empty list copy when appointments exist but filters hide all rows.
 */

import {
  CALENDAR_CLINICAL_ROLE_ALL,
  type CalendarClinicalRoleFilter,
} from "@/lib/calendar-clinical-role-filter";
import {
  appointmentCalendarStatusFilterOptions,
  calendarClinicalRoleFilterOptions,
  findFilterOptionLabel,
} from "@/lib/filter-select-option-presets";

const CALENDAR_STATUS_OPTIONS = appointmentCalendarStatusFilterOptions();
const CALENDAR_ROLE_OPTIONS = calendarClinicalRoleFilterOptions();

export type CalendarFilterEmptyChipIcon =
  | "search"
  | "visits"
  | "category"
  | "patient"
  | "date"
  | "status"
  | "month";

export type CalendarFilterEmptyChip = {
  icon: CalendarFilterEmptyChipIcon;
  label: string;
};

export type CalendarFiltersEmptyCopyInput = {
  search: string;
  category: string | null;
  patient: string | null;
  date: string | null;
  status: string | null;
  month: string | null;
  clinicalRole: CalendarClinicalRoleFilter;
  categoryLabel?: string | null;
  patientLabel?: string | null;
  monthLabel?: string | null;
  totalAppointments: number;
};

export type CalendarFiltersEmptyCopy = {
  title: string;
  description: string;
  chips: CalendarFilterEmptyChip[];
};

function formatDateFilterLabel(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function formatMonthFilterLabel(monthYm: string, monthLabel?: string | null): string {
  if (monthLabel?.trim()) return monthLabel.trim();
  const [year, part] = monthYm.split("-");
  const m = Number(part);
  const y = Number(year);
  if (!Number.isFinite(m) || !Number.isFinite(y)) return monthYm;
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
    new Date(y, m - 1, 1)
  );
}

/** Build title, description, and chip list for the filtered-empty dashboard state. */
export function buildCalendarFiltersEmptyCopy(
  input: CalendarFiltersEmptyCopyInput
): CalendarFiltersEmptyCopy {
  const chips: CalendarFilterEmptyChip[] = [];
  const searchTrim = input.search.trim();

  if (searchTrim) {
    chips.push({ icon: "search", label: `Search: “${searchTrim}”` });
  }
  if (input.clinicalRole !== CALENDAR_CLINICAL_ROLE_ALL) {
    chips.push({
      icon: "visits",
      label: findFilterOptionLabel(
        CALENDAR_ROLE_OPTIONS,
        input.clinicalRole,
        "All My Visits"
      ),
    });
  }
  if (input.category && input.categoryLabel) {
    chips.push({ icon: "category", label: input.categoryLabel });
  }
  if (input.patient && input.patientLabel) {
    chips.push({ icon: "patient", label: input.patientLabel });
  }
  if (input.date) {
    chips.push({ icon: "date", label: formatDateFilterLabel(input.date) });
  }
  if (input.status) {
    chips.push({
      icon: "status",
      label: findFilterOptionLabel(
        CALENDAR_STATUS_OPTIONS,
        input.status,
        input.status
      ),
    });
  }
  if (input.month) {
    chips.push({
      icon: "month",
      label: formatMonthFilterLabel(input.month, input.monthLabel),
    });
  }

  const hidden = Math.max(0, input.totalAppointments);
  const hiddenLine =
    hidden === 1
      ? "1 appointment is hidden by your filters."
      : `${hidden} appointments are hidden by your filters.`;

  if (chips.length === 0) {
    return {
      title: "No appointments match",
      description: hiddenLine,
      chips,
    };
  }

  if (chips.length === 1 && chips[0]!.icon === "search") {
    return {
      title: "No search results",
      description: `Nothing matches “${searchTrim}”. ${hiddenLine}`,
      chips,
    };
  }

  return {
    title: "No appointments match your filters",
    description: `${hiddenLine} Adjust or clear the filters below.`,
    chips,
  };
}
