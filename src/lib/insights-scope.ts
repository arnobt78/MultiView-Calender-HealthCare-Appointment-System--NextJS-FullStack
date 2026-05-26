/**
 * Re-export barrel — keep @/lib/insights-scope imports stable while implementation lives in src/lib/insights/.
 */
export * from "./insights/insights-scope";
export { DEFAULT_INSIGHTS_PERIOD, type InsightsPeriod } from "./insights/insights-period";
