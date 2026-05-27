/**
 * Insights chart empty states — detect zero series, placeholder axes, per-card copy.
 * Client + chart wrappers only; no API/query changes.
 */

import type { InsightsPeriod } from "@/lib/insights/insights-period";
import { trendBucketCount } from "@/lib/insights/insights-period";

/** Mirrors insights appointment/revenue/doctor chart cards on /insights. */
export type AnalyticsChartEmptyKind =
  | "volume-trend"
  | "busiest-weekday"
  | "status-over-time"
  | "by-category"
  | "visit-types"
  | "paid-revenue"
  | "invoice-status"
  | "age-distribution"
  | "appointments-by-doctor"
  | "by-specialty"
  | "doctor-weekly-hours"
  | "doctor-time-off";

export type AnalyticsChartEmptyCopy = {
  title: string;
  description: string;
  /** Lucide icon key resolved in AnalyticsChartEmptyOverlay */
  iconName: AnalyticsChartEmptyIconName;
};

export type AnalyticsChartEmptyIconName =
  | "bar-chart"
  | "calendar"
  | "layers"
  | "folder"
  | "pie"
  | "dollar"
  | "receipt"
  | "user"
  | "activity"
  | "stethoscope";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const GENERIC_BAR_PLACEHOLDERS = ["—", "—", "—"] as const;

type CountRow = { count?: number };
type StackedRow = { done?: number; pending?: number; alert?: number };

function rowTotal(row: CountRow & StackedRow): number {
  if ("done" in row || "pending" in row || "alert" in row) {
    return (row.done ?? 0) + (row.pending ?? 0) + (row.alert ?? 0);
  }
  return row.count ?? 0;
}

/** True when series is missing or every bucket/slice is zero. */
export function isAnalyticsCountSeriesEmpty(
  data: ReadonlyArray<CountRow & StackedRow> | null | undefined
): boolean {
  if (!data || data.length === 0) return true;
  return data.every((row) => rowTotal(row) === 0);
}

/** Professional empty copy keyed to each insights chart card title. */
export function getAnalyticsChartEmptyCopy(kind: AnalyticsChartEmptyKind): AnalyticsChartEmptyCopy {
  switch (kind) {
    case "volume-trend":
      return {
        iconName: "bar-chart",
        title: "No appointments in this period",
        description: "Volume will appear here when visits are scheduled in the selected range.",
      };
    case "busiest-weekday":
      return {
        iconName: "calendar",
        title: "No weekday activity yet",
        description: "Busiest days will rank here once appointments exist in this period.",
      };
    case "status-over-time":
      return {
        iconName: "layers",
        title: "No status history for this period",
        description: "Done, pending, and alert buckets will stack here as visits are recorded.",
      };
    case "by-category":
      return {
        iconName: "folder",
        title: "No category breakdown",
        description: "Categories will chart here when appointments use categories in this period.",
      };
    case "visit-types":
      return {
        iconName: "pie",
        title: "No visit type mix",
        description: "Visit types will show here when typed appointments exist in this period.",
      };
    case "paid-revenue":
      return {
        iconName: "dollar",
        title: "No paid revenue in this period",
        description: "Paid invoice totals will trend here when payments are recorded.",
      };
    case "invoice-status":
      return {
        iconName: "receipt",
        title: "No invoices in this period",
        description: "Invoice status counts will appear when invoices are created in this range.",
      };
    case "age-distribution":
      return {
        iconName: "user",
        title: "No patient age data",
        description: "Age buckets will fill when patients with birth dates have visits in this period.",
      };
    case "appointments-by-doctor":
      return {
        iconName: "activity",
        title: "No doctor volume in this period",
        description: "Per-doctor appointment counts will display for the organization in this range.",
      };
    case "by-specialty":
      return {
        iconName: "stethoscope",
        title: "No specialty breakdown",
        description: "Specialty mix will chart here when doctors have appointments in this period.",
      };
    case "doctor-weekly-hours":
      return {
        iconName: "activity",
        title: "No availability configured",
        description: "Weekly hours will chart here when doctors set availability windows.",
      };
    case "doctor-time-off":
      return {
        iconName: "calendar",
        title: "No time off in this period",
        description: "Blocked days will appear when doctors record time away in this range.",
      };
  }
}

export type AnalyticsLinePlaceholderPoint = { label: string; count: number };
export type AnalyticsStackedPlaceholderPoint = {
  month: string;
  done: number;
  pending: number;
  alert: number;
};
export type AnalyticsPiePlaceholderPoint = { name: string; count: number };

function buildTrendPlaceholderLabels(period: InsightsPeriod, now: Date): string[] {
  if (period === "day") {
    return Array.from({ length: 24 }, (_, h) => `${h}:00`);
  }
  if (period === "week") {
    return [...WEEKDAY_LABELS];
  }
  if (period === "all") {
    const year = now.getFullYear();
    return Array.from({ length: trendBucketCount("all", now) }, (_, i) =>
      String(year - (trendBucketCount("all", now) - 1 - i))
    );
  }
  if (period === "year") {
    return Array.from({ length: 12 }, (_, monthIndex) =>
      new Date(now.getFullYear(), monthIndex, 1).toLocaleDateString("en", {
        month: "short",
        year: "2-digit",
      })
    );
  }
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const dayStart = new Date(year, month, i + 1);
    return dayStart.toLocaleDateString("en", { month: "short", day: "numeric" });
  });
}

function buildStatusOverTimePlaceholder(period: InsightsPeriod, now: Date): AnalyticsStackedPlaceholderPoint[] {
  return buildTrendPlaceholderLabels(period, now).map((month) => ({
    month,
    done: 0,
    pending: 0,
    alert: 0,
  }));
}

/**
 * Zero-count skeleton rows so Cartesian charts keep grid/axes when the real series is empty.
 * Pie kinds return [] — overlay only (no misleading slices).
 */
export function buildAnalyticsPlaceholderAxisData(
  kind: AnalyticsChartEmptyKind,
  period: InsightsPeriod,
  now = new Date()
): AnalyticsLinePlaceholderPoint[] | AnalyticsStackedPlaceholderPoint[] | AnalyticsPiePlaceholderPoint[] {
  switch (kind) {
    case "volume-trend":
    case "paid-revenue":
      return buildTrendPlaceholderLabels(period, now).map((label) => ({ label, count: 0 }));
    case "busiest-weekday":
      return WEEKDAY_LABELS.map((label) => ({ label, count: 0 }));
    case "status-over-time":
      return buildStatusOverTimePlaceholder(period, now);
    case "by-category":
    case "invoice-status":
    case "age-distribution":
    case "appointments-by-doctor":
    case "doctor-weekly-hours":
    case "doctor-time-off":
      return GENERIC_BAR_PLACEHOLDERS.map((label) => ({ label, count: 0 }));
    case "visit-types":
    case "by-specialty":
      return [];
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

/** Expected bucket count for trend-style charts — must stay aligned with insights-aggregate. */
export function analyticsPlaceholderTrendBucketCount(period: InsightsPeriod, now = new Date()): number {
  return trendBucketCount(period, now);
}
