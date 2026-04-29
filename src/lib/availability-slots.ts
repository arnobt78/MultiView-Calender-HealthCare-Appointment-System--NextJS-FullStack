import { addMinutes, isBefore, max as maxDate, min as minDate, parseISO } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import type { PrismaClient } from "@prisma/client";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
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

function wallClockToUtc(dateStr: string, minutesFromMidnight: number, tz: string): Date {
  const h = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  return fromZonedTime(`${dateStr} ${pad2(h)}:${pad2(m)}:00`, tz);
}

type Interval = { start: Date; end: Date };

function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

export async function computeAvailabilitySlots(
  prisma: PrismaClient,
  params: { doctorId: string; dateStr: string; typeId: string }
): Promise<{ slots: string[]; timezone: string }> {
  const { doctorId, dateStr, typeId } = params;

  if (!ISO_DATE.test(dateStr)) {
    return { slots: [], timezone: "UTC" };
  }

  const type = await prisma.appointmentType.findFirst({
    where: {
      id: typeId,
      OR: [{ user_id: doctorId }, { user_id: null }],
    },
  });

  if (!type) {
    return { slots: [], timezone: "UTC" };
  }

  const availRows = await prisma.doctorAvailability.findMany({
    where: { user_id: doctorId },
  });

  if (availRows.length === 0) {
    return { slots: [], timezone: "UTC" };
  }

  const tz0 = availRows[0].timezone;
  const weekday = getJsWeekdayInTimezone(dateStr, tz0);
  const dayRows = availRows.filter((r) => r.weekday === weekday);
  if (dayRows.length === 0) {
    return { slots: [], timezone: tz0 };
  }

  const tz = dayRows[0].timezone;
  const duration = type.duration_minutes;
  const bufBefore = type.buffer_before_minutes;
  const bufAfter = type.buffer_after_minutes;
  const interval = Math.max(5, type.slot_interval_minutes);
  const minNotice = type.minimum_notice_minutes;

  const dayStart = wallClockToUtc(dateStr, 0, tz);
  const dayEnd = wallClockToUtc(dateStr, 24 * 60 - 1, tz);

  const appts = await prisma.appointment.findMany({
    where: {
      user_id: doctorId,
      start: { lt: addMinutes(dayEnd, 1) },
      end: { gt: dayStart },
    },
    select: { start: true, end: true },
  });

  const busy: Interval[] = appts.map((a) => ({
    start: addMinutes(a.start, -bufBefore),
    end: addMinutes(a.end, bufAfter),
  }));

  const offs = await prisma.doctorTimeOff.findMany({
    where: {
      user_id: doctorId,
      starts_at: { lt: addMinutes(dayEnd, 1) },
      ends_at: { gt: dayStart },
    },
    select: { starts_at: true, ends_at: true },
  });

  const offBlocks: Interval[] = offs.map((o) => ({
    start: o.starts_at,
    end: o.ends_at,
  }));

  const now = new Date();
  const earliestSlotStart = addMinutes(now, minNotice);

  const slots: string[] = [];

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
      let blocked = false;
      for (const b of busy) {
        if (overlaps(slotIv, b)) {
          blocked = true;
          break;
        }
      }
      if (!blocked) {
        for (const o of offBlocks) {
          if (overlaps(slotIv, o)) {
            blocked = true;
            break;
          }
        }
      }

      if (!blocked && !isBefore(slotStart, earliestSlotStart)) {
        slots.push(slotStart.toISOString());
      }

      t = addMinutes(t, interval);
    }
  }

  slots.sort();
  return { slots, timezone: tz };
}
