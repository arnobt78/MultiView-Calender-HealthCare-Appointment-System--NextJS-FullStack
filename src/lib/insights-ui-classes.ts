/**
 * Insights /analytics page glass tokens — aligned with docs/UI_STYLING_GUIDE.md.
 */

/** Toolbar wrapping period + scope segmented controls. */
export const insightsFilterToolbarGlassClass =
  "flex flex-col gap-2 rounded-[20px] bg-gradient-to-br from-sky-500/10 via-white/90 to-white/95 p-2 shadow-[0_18px_48px_rgba(2,132,199,0.22)] backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-end";

/** Scope-only chrome toolbar — no outer border ring. */
export const insightsScopeToolbarClass =
  "flex flex-wrap items-center justify-end gap-2 rounded-[20px] bg-gradient-to-br from-sky-500/10 via-white/90 to-white/95 p-2 shadow-[0_18px_48px_rgba(2,132,199,0.18)] backdrop-blur-sm";

/** Period controls row inside Appointments section. */
export const insightsAppointmentsPeriodRowClass =
  "mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between";

/** Inner segmented group shell. */
export const insightsSegmentGroupClass =
  "flex flex-wrap items-center gap-1 rounded-xl border border-sky-200/60 bg-white/50 p-0.5 backdrop-blur-sm";

/** Active segment pill — sky gradient + glow. */
export const insightsSegmentActiveClass =
  "border border-sky-400/40 bg-gradient-to-r from-sky-500/75 via-sky-500/55 to-sky-400/35 text-white shadow-[0_12px_28px_rgba(2,132,199,0.35)] hover:from-sky-500/85 hover:via-sky-500/65";

/** Inactive segment — gray-700 label, sky hover wash. */
export const insightsSegmentInactiveClass =
  "border border-transparent bg-transparent text-gray-700 hover:border-sky-200/50 hover:bg-sky-500/10 hover:text-sky-800";

/** KPI strip: 4 cards per row from md up (incl. 1920×1080); 2 cols on narrow viewports. */
export const analyticsOverviewGridClass =
  "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4";

/** Scope hint line in page header — sky accent. */
export const insightsScopeHintClass = "font-medium text-sky-600";

export const insightsScopeBodyClass = "text-gray-700";

/** Recharts tooltip layer — above glass analytics cards, below fixed navbar. */
export const analyticsChartTooltipZClass = "z-[90]";

/** Chart card header — matches `PortalPanelSubsectionHeader` / doctor-portal subsection tiles. */
export const analyticsChartPanelIconTileClass =
  "flex w-10 shrink-0 items-center justify-center self-stretch rounded-xl border border-sky-100 bg-sky-50 [&_svg]:text-sky-600";

export const analyticsChartPanelTitleClass = "text-sm font-medium text-gray-800";

export const analyticsChartPanelSubtitleClass = "text-xs leading-snug text-muted-foreground";
