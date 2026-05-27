/**
 * Insights /analytics page glass tokens — aligned with docs/UI_STYLING_GUIDE.md.
 */

/** Toolbar wrapping period + scope segmented controls. */
export const insightsFilterToolbarGlassClass =
  "flex flex-col gap-2 rounded-[20px] bg-gradient-to-br from-sky-500/10 via-white/90 to-white/95 p-2 shadow-[0_18px_48px_rgba(2,132,199,0.22)] backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-end";

/** Scope-only chrome toolbar — no outer border ring. */
export const insightsScopeToolbarClass =
  "flex flex-wrap items-center justify-end gap-2 rounded-[20px] bg-gradient-to-br from-sky-500/10 via-white/90 to-white/95 p-2 shadow-[0_18px_48px_rgba(2,132,199,0.18)] backdrop-blur-sm";

/** Bare header row wrapper — keeps controls aligned without extra shell spacing. */
export const insightsBareToolbarRowClass =
  "flex flex-wrap items-center justify-end gap-2";

/** Appointments panel header — glass badges + period segment (responsive wrap). */
export const insightsAppointmentsToolbarClass =
  "flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between";

/** @deprecated Use `insightsAppointmentsToolbarClass` — kept for legacy imports. */
export const insightsAppointmentsPeriodRowClass = insightsAppointmentsToolbarClass;

/** Inner segmented group shell. */
export const insightsSegmentGroupClass =
  "flex flex-wrap items-center gap-2 rounded-full border border-slate-300/55 bg-white/70 p-1 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-md";

/** Inline controls row (label + segment buttons) with no outer shell/padding. */
export const insightsInlineControlRowClass = "flex flex-wrap items-center gap-2";

/** Active segment — sky glow + gray label (readable on glass; matches dashboard view tabs). */
export const insightsSegmentActiveClass =
  "border-sky-500/55 bg-linear-to-r from-sky-500 to-sky-700 text-white shadow-[0_12px_36px_rgba(2,132,199,0.34)] hover:from-sky-600/95 hover:to-sky-700/95 hover:text-white active:text-white";

/** Inactive segment — gray-700 label, sky hover wash. */
export const insightsSegmentInactiveClass =
  "border-slate-300/55 bg-white/70 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:border-sky-300/60 hover:bg-sky-50/80 hover:text-sky-800 hover:shadow-[0_12px_30px_rgba(2,132,199,0.16)]";

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

/** Legacy muted subtitle — prefer `insightsChartPeriodSubtitleClass` on insights charts. */
export const analyticsChartPanelSubtitleClass = "text-xs leading-snug text-muted-foreground";

/** Dynamic View-as period line under chart titles (matches page scope hint accent). */
export const insightsChartPeriodSubtitleClass =
  "text-xs leading-snug text-sky-600/90 [overflow-wrap:anywhere]";

/** Chart / table body min height — aligns empty states across insights cards. */
export const insightsChartBodyMinHeightClass = "min-h-[10rem]";

/**
 * By-status summary row — `rounded-[24px]` matches `portalPanelCardClass` (not `rounded-2xl`).
 */
export const insightsStatusSummaryRowClass =
  "flex flex-wrap items-center gap-3 rounded-[24px] border border-slate-200/80 bg-linear-to-br from-sky-500/8 via-white/90 to-white/95 px-4 py-3 shadow-[0_8px_32px_rgba(99,102,241,0.08)] backdrop-blur-sm";
