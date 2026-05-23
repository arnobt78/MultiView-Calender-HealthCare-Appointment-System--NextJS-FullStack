/**
 * Single source of truth for cal.com-style slot grids and month day status.
 * `computeAvailabilitySlots` in availability-slots.ts filters to available ISO starts only.
 */

import {
  addMinutes,
  endOfMonth,
  format,
  isBefore,
  max as maxDate,
  min as minDate,
  parseISO,
  startOfMonth,
} from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import type { PrismaClient } from "@prisma/client";
import { flexibleSchedulingTypeConfig, isFlexDurationMinutes } from "@/lib/scheduling/flexible-type-config";
import type {
  AvailabilityDayGrid,
  AvailabilityMonthDays,
  DaySchedulingContext,
  MonthDayEntry,
  MonthDayStatus,
  SchedulingInterval,
  SchedulingScopeKey,
  SchedulingTypeConfig,
  SlotCell,
  SlotCellStatus,
} from "@/lib/scheduling/scheduling-types";

export type {
  AvailabilityDayGrid,
  AvailabilityMonthDays,
  DaySchedulingContext,
  MonthDayEntry,
  MonthDayStatus,
  SlotCell,
  SlotCellStatus,
} from "@/lib/scheduling/scheduling-types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH = /^\d{4}-\d{2}$/;
const MAX_SLOTS = 256;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** JS weekday 0=Sun..6=Sat in `tz` on calendar `dateStr`. */
export function getJsWeekdayInTimezone(dateStr: string, tz: string): number {
  const instant = parseISO(`${dateStr}T12:00:00.000Z`);
  const isoDow = Number(formatInTimeZone(instant, tz, "i"));
  return isoDow === 7 ? 0 : isoDow;
}

export function wallClockToUtc(dateStr: string, minutesFromMidnight: number, tz: string): Date {
  const h = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  return fromZonedTime(`${dateStr} ${pad2(h)}:${pad2(m)}:00`, tz);
}

type Interval = { start: Date; end: Date };

function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

function isBusyOverlap(
  slotIv: Interval,
  busy: SchedulingInterval[],
  excludeAppointmentId?: string
): boolean {
  for (const b of busy) {
    if (excludeAppointmentId && b.appointmentId === excludeAppointmentId) continue;
    if (overlaps(slotIv, b)) return true;
  }
  return false;
}

function resolveDayTimezone(rows: DaySchedulingContext["availabilityRows"]): string {
  return rows[0]?.timezone ?? "UTC";
}

function dayRowsForDate(
  dateStr: string,
  availabilityRows: DaySchedulingContext["availabilityRows"]
): DaySchedulingContext["availabilityRows"] {
  if (availabilityRows.length === 0) return [];
  const tz0 = availabilityRows[0].timezone;
  const weekday = getJsWeekdayInTimezone(dateStr, tz0);
  return availabilityRows.filter((r) => r.weekday === weekday);
}

/**
 * Emits every candidate slot start for the day with status (available / booked / past / blocked).
 */
export function buildDaySlotCells(ctx: DaySchedulingContext): AvailabilityDayGrid {
  const { dateStr, type, availabilityRows, busyIntervals, timeOffIntervals } = ctx;

  if (!ISO_DATE.test(dateStr)) {
    return { cells: [], timezone: "UTC" };
  }

  const dayRows = dayRowsForDate(dateStr, availabilityRows);
  if (dayRows.length === 0) {
    const tz = resolveDayTimezone(availabilityRows);
    return { cells: [], timezone: tz };
  }

  const tz = dayRows[0].timezone;
  const duration = type.duration_minutes;
  const bufBefore = type.buffer_before_minutes;
  const bufAfter = type.buffer_after_minutes;
  const interval = Math.max(5, type.slot_interval_minutes);
  const minNotice = type.minimum_notice_minutes;

  const dayStart = wallClockToUtc(dateStr, 0, tz);
  const dayEnd = wallClockToUtc(dateStr, 24 * 60 - 1, tz);

  const busy: SchedulingInterval[] = busyIntervals.map((b) => ({
    start: addMinutes(b.start, -bufBefore),
    end: addMinutes(b.end, bufAfter),
    appointmentId: b.appointmentId,
  }));

  const now = ctx.now ?? new Date();
  const earliestSlotStart = addMinutes(now, minNotice);
  const excludeId = ctx.excludeAppointmentId;

  const cells: SlotCell[] = [];

  for (const row of dayRows) {
    const ws = wallClockToUtc(dateStr, row.start_min, tz);
    const we = wallClockToUtc(dateStr, row.end_min, tz);
    if (!(ws < we)) continue;

    const wStart = maxDate([ws, dayStart]);
    const wEnd = minDate([we, dayEnd]);
    if (!(wStart < wEnd)) continue;

    let t = wStart;
    for (let guard = 0; guard < MAX_SLOTS; guard++) {
      const slotStart = t;
      const slotEnd = addMinutes(t, duration);
      if (slotEnd > wEnd) break;

      const slotIv: Interval = { start: slotStart, end: slotEnd };
      let status: SlotCellStatus = "available";

      if (isBefore(slotStart, earliestSlotStart)) {
        status = "past";
      } else if (isBusyOverlap(slotIv, busy, excludeId)) {
        status = "booked";
      } else {
        for (const o of timeOffIntervals) {
          if (overlaps(slotIv, o)) {
            status = "blocked";
            break;
          }
        }
      }

      cells.push({ start: slotStart.toISOString(), status });
      t = addMinutes(t, interval);
    }
  }

  cells.sort((a, b) => a.start.localeCompare(b.start));
  return { cells, timezone: tz };
}

export function monthDayStatusFromCells(cells: SlotCell[]): MonthDayStatus {
  if (cells.length === 0) return "unavailable";
  if (cells.some((c) => c.status === "available")) return "open";
  return "full";
}

function eachDateInMonth(monthYm: string): string[] {
  const [y, m] = monthYm.split("-").map(Number);
  const start = startOfMonth(new Date(y, m - 1, 1));
  const end = endOfMonth(start);
  const out: string[] = [];
  let d = start;
  while (d <= end) {
    out.push(format(d, "yyyy-MM-dd"));
    d = addMinutes(d, 24 * 60);
  }
  return out;
}

export function buildMonthDayEntries(
  monthYm: string,
  availabilityRows: DaySchedulingContext["availabilityRows"],
  type: SchedulingTypeConfig,
  busyByDate: Map<string, SchedulingInterval[]>,
  timeOffIntervals: SchedulingInterval[],
  opts?: { now?: Date; excludeAppointmentId?: string }
): AvailabilityMonthDays {
  if (!ISO_MONTH.test(monthYm) || availabilityRows.length === 0) {
    return { days: [], timezone: "UTC" };
  }

  const tz = availabilityRows[0].timezone;
  const todayStr = format(opts?.now ?? new Date(), "yyyy-MM-dd");
  const days: MonthDayEntry[] = [];

  for (const dateStr of eachDateInMonth(monthYm)) {
    if (dateStr < todayStr) {
      days.push({ date: dateStr, status: "unavailable" });
      continue;
    }

    const { cells } = buildDaySlotCells({
      dateStr,
      type,
      availabilityRows,
      busyIntervals: busyByDate.get(dateStr) ?? [],
      timeOffIntervals,
      now: opts?.now,
      excludeAppointmentId: opts?.excludeAppointmentId,
    });

    days.push({ date: dateStr, status: monthDayStatusFromCells(cells) });
  }

  return { days, timezone: tz };
}

async function loadTypeConfig(
  prisma: PrismaClient,
  doctorId: string,
  typeId: string
): Promise<SchedulingTypeConfig | null> {
  const type = await prisma.appointmentType.findFirst({
    where: {
      id: typeId,
      OR: [{ user_id: doctorId }, { user_id: null }],
    },
    select: {
      duration_minutes: true,
      buffer_before_minutes: true,
      buffer_after_minutes: true,
      slot_interval_minutes: true,
      minimum_notice_minutes: true,
    },
  });
  if (!type) return null;
  return {
    duration_minutes: type.duration_minutes,
    buffer_before_minutes: type.buffer_before_minutes,
    buffer_after_minutes: type.buffer_after_minutes,
    slot_interval_minutes: type.slot_interval_minutes,
    minimum_notice_minutes: type.minimum_notice_minutes,
  };
}

async function loadAvailabilityRows(prisma: PrismaClient, doctorId: string) {
  return prisma.doctorAvailability.findMany({
    where: { user_id: doctorId },
    select: { weekday: true, start_min: true, end_min: true, timezone: true },
  });
}

async function loadBusyForRange(
  prisma: PrismaClient,
  doctorId: string,
  rangeStart: Date,
  rangeEnd: Date
): Promise<SchedulingInterval[]> {
  const appts = await prisma.appointment.findMany({
    where: {
      owner_id: doctorId,
      start: { lt: addMinutes(rangeEnd, 1) },
      end: { gt: rangeStart },
    },
    select: { id: true, start: true, end: true },
  });
  return appts.map((a) => ({
    start: a.start,
    end: a.end,
    appointmentId: a.id,
  }));
}

async function loadTimeOffForRange(
  prisma: PrismaClient,
  doctorId: string,
  rangeStart: Date,
  rangeEnd: Date
): Promise<SchedulingInterval[]> {
  const offs = await prisma.doctorTimeOff.findMany({
    where: {
      user_id: doctorId,
      starts_at: { lt: addMinutes(rangeEnd, 1) },
      ends_at: { gt: rangeStart },
    },
    select: { starts_at: true, ends_at: true },
  });
  return offs.map((o) => ({ start: o.starts_at, end: o.ends_at }));
}

function groupBusyByDate(
  busy: SchedulingInterval[],
  tz: string,
  monthYm: string
): Map<string, SchedulingInterval[]> {
  const map = new Map<string, SchedulingInterval[]>();
  for (const dateStr of eachDateInMonth(monthYm)) {
    const dayStart = wallClockToUtc(dateStr, 0, tz);
    const dayEnd = wallClockToUtc(dateStr, 24 * 60 - 1, tz);
    const dayBusy = busy.filter((b) => b.start < addMinutes(dayEnd, 1) && b.end > dayStart);
    map.set(dateStr, dayBusy);
  }
  return map;
}

export async function computeDaySlotGrid(
  prisma: PrismaClient,
  params: {
    doctorId: string;
    dateStr: string;
    typeId: string;
    excludeAppointmentId?: string;
  }
): Promise<AvailabilityDayGrid> {
  const { doctorId, dateStr, typeId, excludeAppointmentId } = params;

  if (!ISO_DATE.test(dateStr)) {
    return { cells: [], timezone: "UTC" };
  }

  const type = await loadTypeConfig(prisma, doctorId, typeId);
  if (!type) return { cells: [], timezone: "UTC" };

  const availabilityRows = await loadAvailabilityRows(prisma, doctorId);
  if (availabilityRows.length === 0) {
    return { cells: [], timezone: "UTC" };
  }

  const tz = availabilityRows[0].timezone;
  const dayStart = wallClockToUtc(dateStr, 0, tz);
  const dayEnd = wallClockToUtc(dateStr, 24 * 60 - 1, tz);

  const [busyIntervals, timeOffIntervals] = await Promise.all([
    loadBusyForRange(prisma, doctorId, dayStart, dayEnd),
    loadTimeOffForRange(prisma, doctorId, dayStart, dayEnd),
  ]);

  return buildDaySlotCells({
    dateStr,
    type,
    availabilityRows,
    busyIntervals,
    timeOffIntervals,
    excludeAppointmentId,
  });
}

async function resolveSchedulingTypeForMonth(
  prisma: PrismaClient,
  doctorId: string,
  schedulingScope: SchedulingScopeKey
): Promise<SchedulingTypeConfig | null> {
  if (schedulingScope.kind === "flex") {
    if (!isFlexDurationMinutes(schedulingScope.durationMinutes)) return null;
    return flexibleSchedulingTypeConfig(schedulingScope.durationMinutes);
  }
  return loadTypeConfig(prisma, doctorId, schedulingScope.typeId);
}

export async function getBookableDatesInMonth(
  prisma: PrismaClient,
  params: {
    doctorId: string;
    monthYm: string;
    excludeAppointmentId?: string;
    schedulingScope: SchedulingScopeKey;
  }
): Promise<AvailabilityMonthDays> {
  const { doctorId, monthYm, excludeAppointmentId, schedulingScope } = params;

  if (!ISO_MONTH.test(monthYm)) {
    return { days: [], timezone: "UTC" };
  }

  const type = await resolveSchedulingTypeForMonth(prisma, doctorId, schedulingScope);
  if (!type) return { days: [], timezone: "UTC" };

  const availabilityRows = await loadAvailabilityRows(prisma, doctorId);
  if (availabilityRows.length === 0) {
    return { days: [], timezone: "UTC" };
  }

  const tz = availabilityRows[0].timezone;
  const dates = eachDateInMonth(monthYm);
  const rangeStart = wallClockToUtc(dates[0], 0, tz);
  const rangeEnd = wallClockToUtc(dates[dates.length - 1], 24 * 60 - 1, tz);

  const [busy, timeOff] = await Promise.all([
    loadBusyForRange(prisma, doctorId, rangeStart, rangeEnd),
    loadTimeOffForRange(prisma, doctorId, rangeStart, rangeEnd),
  ]);

  const busyByDate = groupBusyByDate(busy, tz, monthYm);

  return buildMonthDayEntries(monthYm, availabilityRows, type, busyByDate, timeOff, {
    excludeAppointmentId,
  });
}
