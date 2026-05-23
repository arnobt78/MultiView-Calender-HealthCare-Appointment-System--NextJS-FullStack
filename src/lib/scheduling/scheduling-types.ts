/**
 * Shared scheduling types for availability month map + day slot grid.
 * Used by API routes, hooks, and SchedulingPanel UI.
 */

export type SlotCellStatus = "available" | "booked" | "past" | "blocked";

export type SlotCell = {
  start: string;
  status: SlotCellStatus;
};

export type MonthDayStatus = "open" | "full" | "unavailable";

export type MonthDayEntry = {
  date: string;
  status: MonthDayStatus;
};

export type AvailabilityDayGrid = {
  cells: SlotCell[];
  timezone: string;
};

export type AvailabilityMonthDays = {
  days: MonthDayEntry[];
  timezone: string;
};

/** Visit-type fields that drive slot generation (mirrors AppointmentType row). */
export type SchedulingTypeConfig = {
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  slot_interval_minutes: number;
  minimum_notice_minutes: number;
};

export type AvailabilityWindow = {
  weekday: number;
  start_min: number;
  end_min: number;
  timezone: string;
};

export type SchedulingInterval = {
  start: Date;
  end: Date;
  appointmentId?: string;
};

/** Typed visit (`typeId`) or flexible booking (synthetic config from duration). */
export type SchedulingScopeKey =
  | { kind: "type"; typeId: string }
  | { kind: "flex"; durationMinutes: number };

/** Pure inputs for `buildDaySlotCells` — Vitest uses this without Prisma. */
export type DaySchedulingContext = {
  dateStr: string;
  type: SchedulingTypeConfig;
  availabilityRows: AvailabilityWindow[];
  busyIntervals: SchedulingInterval[];
  timeOffIntervals: SchedulingInterval[];
  /** Defaults to `new Date()` when omitted. */
  now?: Date;
  excludeAppointmentId?: string;
};
