/**
 * Maps v2 trend series onto legacy flat `monthlyData` — avoids duplicate rolling-12mo queries.
 */

import type { InsightsPeriod } from "@/lib/insights/insights-period";
import type { InsightsTrendPoint } from "@/lib/insights/insights-types";

export function legacyMonthlyDataFromTrend(
  trend: InsightsTrendPoint[],
  _period: InsightsPeriod
): { month: string; count: number }[] {
  return trend.map((point) => ({ month: point.label, count: point.count }));
}
