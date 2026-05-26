/** Glass shells for analytics chart cards — sky variant per UI_STYLING_GUIDE. */
export const analyticsChartGlassClass =
  "rounded-[28px] border border-sky-400/20 bg-gradient-to-br from-sky-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(2,132,199,0.12)] transition-shadow hover:shadow-[0_28px_64px_rgba(2,132,199,0.16)]";

export const analyticsChartTitleClass = "text-lg font-semibold text-gray-700";

export const analyticsChartDescriptionClass = "text-sm text-sky-600/90";

/** Theme tokens are oklch in globals.css — use var() directly, not hsl(var()). */
export const ANALYTICS_CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export const analyticsChartConfigColor = (n: 1 | 2 | 3 | 4 | 5) =>
  ANALYTICS_CHART_COLORS[n - 1];
