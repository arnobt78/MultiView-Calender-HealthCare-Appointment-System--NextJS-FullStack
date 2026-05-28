/**
 * Doctor schedule + volume aggregates for /insights Doctors section.
 * Org-wide admin: roster charts; personal scope: single doctor (my practice / drill-down).
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { InsightsPeriod } from "@/lib/insights/insights-period";
import {
  resolveInsightsAppointmentStartFilter,
  resolveInsightsPaidAtFilter,
  resolveInsightsTimeOffOverlapFilter,
} from "@/lib/insights/insights-period-filter";
import type { InsightsDoctorRow, InsightsDoctorsSection, InsightsTrendPoint } from "@/lib/insights/insights-types";
const DOCTOR_CHART_TOP_N = 12;
const SHORT_DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type DoctorTarget = {
  id: string;
  display_name: string | null;
  email: string | null;
  specialty: string | null;
};

function resolveDoctorDisplayName(doc: DoctorTarget): string {
  return doc.display_name?.trim() || doc.email?.trim() || "Doctor";
}

/** Sum configured weekly availability hours from DoctorAvailability windows. */
function sumWeeklyAvailabilityHours(
  windows: { start_min: number; end_min: number }[]
): number {
  const totalMinutes = windows.reduce(
    (acc, w) => acc + Math.max(0, w.end_min - w.start_min),
    0
  );
  return Math.round((totalMinutes / 60) * 10) / 10;
}

/** Count distinct calendar days covered by time-off blocks overlapping [rangeStart, rangeEnd]. */
function countTimeOffDaysInRange(
  blocks: { starts_at: Date; ends_at: Date }[],
  rangeStart: Date,
  rangeEnd: Date
): number {
  const days = new Set<string>();
  for (const block of blocks) {
    const overlapStart = block.starts_at > rangeStart ? block.starts_at : rangeStart;
    const overlapEnd = block.ends_at < rangeEnd ? block.ends_at : rangeEnd;
    if (overlapStart > overlapEnd) continue;
    const cursor = new Date(
      overlapStart.getFullYear(),
      overlapStart.getMonth(),
      overlapStart.getDate()
    );
    const endDay = new Date(
      overlapEnd.getFullYear(),
      overlapEnd.getMonth(),
      overlapEnd.getDate()
    );
    while (cursor <= endDay) {
      days.add(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return days.size;
}

/** All-time — every calendar day in each time-off block (no period clip). */
function countTimeOffDaysAllTime(blocks: { starts_at: Date; ends_at: Date }[]): number {
  const days = new Set<string>();
  for (const block of blocks) {
    const cursor = new Date(
      block.starts_at.getFullYear(),
      block.starts_at.getMonth(),
      block.starts_at.getDate()
    );
    const endDay = new Date(
      block.ends_at.getFullYear(),
      block.ends_at.getMonth(),
      block.ends_at.getDate()
    );
    while (cursor <= endDay) {
      days.add(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return days.size;
}

async function loadDoctorTargets(
  organizationWide: boolean,
  filterOwnerId: string
): Promise<DoctorTarget[]> {
  if (organizationWide) {
    return prisma.user.findMany({
      where: { role: "doctor" },
      select: { id: true, display_name: true, email: true, specialty: true },
    });
  }
  const doc = await prisma.user.findFirst({
    where: { id: filterOwnerId, role: "doctor" },
    select: { id: true, display_name: true, email: true, specialty: true },
  });
  return doc ? [doc] : [];
}

async function buildDoctorRow(
  doc: DoctorTarget,
  period: InsightsPeriod,
  now: Date
): Promise<InsightsDoctorRow> {
  const startFilter = resolveInsightsAppointmentStartFilter(period, now);
  const paidFilter = resolveInsightsPaidAtFilter(period, now);
  const timeOffOverlap = resolveInsightsTimeOffOverlapFilter(period, now);

  const apptWhere: Prisma.AppointmentWhereInput = { owner_id: doc.id };
  if (startFilter) {
    apptWhere.start = { gte: startFilter.gte, lte: startFilter.lte };
  }

  const paidWhere: Prisma.InvoiceWhereInput = {
    user_id: doc.id,
    status: "paid",
  };
  if (paidFilter) {
    paidWhere.paid_at = { gte: paidFilter.gte, lte: paidFilter.lte };
  }

  const timeOffWhere: Prisma.DoctorTimeOffWhereInput = { user_id: doc.id };
  if (timeOffOverlap) {
    timeOffWhere.starts_at = { lte: timeOffOverlap.rangeEnd };
    timeOffWhere.ends_at = { gte: timeOffOverlap.rangeStart };
  }

  const [appointmentCount, revenueAgg, availability, timeOffBlocks] = await Promise.all([
    prisma.appointment.count({ where: apptWhere }),
    prisma.invoice.aggregate({ where: paidWhere, _sum: { amount: true } }),
    prisma.doctorAvailability.findMany({
      where: { user_id: doc.id },
      select: { start_min: true, end_min: true, weekday: true },
    }),
    prisma.doctorTimeOff.findMany({
      where: timeOffWhere,
      select: { starts_at: true, ends_at: true },
    }),
  ]);

  return {
    doctorId: doc.id,
    name: resolveDoctorDisplayName(doc),
    specialty: doc.specialty,
    appointmentCount,
    revenueCents: revenueAgg._sum.amount ?? 0,
    weeklyHours: sumWeeklyAvailabilityHours(availability),
    timeOffDaysInPeriod: timeOffOverlap
      ? countTimeOffDaysInRange(
          timeOffBlocks,
          timeOffOverlap.rangeStart,
          timeOffOverlap.rangeEnd
        )
      : countTimeOffDaysAllTime(timeOffBlocks),
  };
}

function buildWeeklyHoursChart(
  mode: InsightsDoctorsSection["mode"],
  rows: InsightsDoctorRow[],
  availabilityByDoctor: Map<string, { weekday: number; start_min: number; end_min: number }[]>
): InsightsTrendPoint[] {
  if (mode === "organization") {
    return [...rows]
      .sort((a, b) => b.weeklyHours - a.weeklyHours)
      .slice(0, DOCTOR_CHART_TOP_N)
      .map((row) => ({
        label: row.name,
        count: Math.round(row.weeklyHours * 10) / 10,
      }));
  }

  const windows = availabilityByDoctor.get(rows[0]?.doctorId ?? "") ?? [];
  const hoursByWeekday = new Map<number, number>();
  for (const w of windows) {
    const hours = Math.max(0, w.end_min - w.start_min) / 60;
    hoursByWeekday.set(w.weekday, (hoursByWeekday.get(w.weekday) ?? 0) + hours);
  }
  return SHORT_DAY_LABELS.map((label, weekday) => ({
    label,
    count: Math.round((hoursByWeekday.get(weekday) ?? 0) * 10) / 10,
  }));
}

function buildTimeOffChart(
  mode: InsightsDoctorsSection["mode"],
  rows: InsightsDoctorRow[]
): InsightsTrendPoint[] {
  if (mode === "personal") {
    const total = rows[0]?.timeOffDaysInPeriod ?? 0;
    return total > 0 ? [{ label: rows[0]?.name ?? "Doctor", count: total }] : [];
  }
  return [...rows]
    .sort((a, b) => b.timeOffDaysInPeriod - a.timeOffDaysInPeriod)
    .slice(0, DOCTOR_CHART_TOP_N)
    .map((row) => ({
      label: row.name,
      count: row.timeOffDaysInPeriod,
    }));
}

/**
 * Staff-only doctors section — null when no doctor targets (e.g. invalid filterOwnerId).
 */
export async function fetchDoctorInsightsSection(opts: {
  organizationWide: boolean;
  filterOwnerId: string;
  period: InsightsPeriod;
  now: Date;
}): Promise<InsightsDoctorsSection | null> {
  const { organizationWide, filterOwnerId, period, now } = opts;
  const targets = await loadDoctorTargets(organizationWide, filterOwnerId);
  if (targets.length === 0) return null;

  const mode: InsightsDoctorsSection["mode"] = organizationWide
    ? "organization"
    : "personal";

  const rows = await Promise.all(
    targets.map((doc) => buildDoctorRow(doc, period, now))
  );
  rows.sort((a, b) => b.appointmentCount - a.appointmentCount);

  const specialtyCounts: Record<string, number> = {};
  for (const row of rows) {
    const key = row.specialty?.trim() || "Unspecified";
    specialtyCounts[key] = (specialtyCounts[key] ?? 0) + row.appointmentCount;
  }

  const doctorIds = rows.map((r) => r.doctorId);
  const availabilityRows = await prisma.doctorAvailability.findMany({
    where: { user_id: { in: doctorIds } },
    select: { user_id: true, weekday: true, start_min: true, end_min: true },
  });
  const availabilityByDoctor = new Map<
    string,
    { weekday: number; start_min: number; end_min: number }[]
  >();
  for (const row of availabilityRows) {
    const list = availabilityByDoctor.get(row.user_id) ?? [];
    list.push({
      weekday: row.weekday,
      start_min: row.start_min,
      end_min: row.end_min,
    });
    availabilityByDoctor.set(row.user_id, list);
  }

  return {
    mode,
    byDoctor: rows,
    bySpecialty: Object.entries(specialtyCounts).map(([specialty, count]) => ({
      specialty,
      count,
    })),
    weeklyHours: buildWeeklyHoursChart(mode, rows, availabilityByDoctor),
    timeOffInPeriod: buildTimeOffChart(mode, rows),
  };
}

/** @deprecated Use fetchDoctorInsightsSection — kept for existing aggregate tests. */
export async function fetchDoctorBreakdown(
  organizationWide: boolean,
  period: InsightsPeriod,
  now: Date
): Promise<
  | {
      doctorId: string;
      name: string;
      specialty: string | null;
      appointmentCount: number;
      revenueCents: number;
    }[]
  | null
> {
  if (!organizationWide) return null;

  const section = await fetchDoctorInsightsSection({
    organizationWide: true,
    filterOwnerId: "",
    period,
    now,
  });
  if (!section) return null;
  return section.byDoctor.map(
    ({ doctorId, name, specialty, appointmentCount, revenueCents }) => ({
      doctorId,
      name,
      specialty,
      appointmentCount,
      revenueCents,
    })
  );
}
