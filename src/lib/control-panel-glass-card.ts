/**
 * Control panel dashboard glass card tokens — shared by overview stat tiles + queue panels.
 */

/** Reusable glass shell (insights / Top Patients parity). */
export const controlPanelDashboardPanelGlassClass =
  "rounded-[28px] border border-sky-400/20 bg-gradient-to-br from-sky-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(2,132,199,0.12)] transition-shadow hover:shadow-[0_28px_64px_rgba(2,132,199,0.16)]";

/** Stat metric tile — per-color gradient glow. */
export const controlPanelGlassCardBaseClass =
  "rounded-[28px] border bg-gradient-to-br backdrop-blur-sm";

export const CONTROL_PANEL_GLASS_CARD_VARIANT: Record<string, string> = {
  sky: "border-sky-400/20 from-sky-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(2,132,199,0.12)]",
  blue: "border-blue-400/20 from-blue-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(59,130,246,0.12)]",
  indigo: "border-indigo-400/20 from-indigo-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(99,102,241,0.12)]",
  purple: "border-purple-400/20 from-purple-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(168,85,247,0.12)]",
  violet: "border-violet-400/20 from-violet-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(139,92,246,0.12)]",
  emerald: "border-emerald-400/20 from-emerald-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(16,185,129,0.12)]",
  green: "border-green-400/20 from-green-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(34,197,94,0.12)]",
  yellow: "border-yellow-400/20 from-yellow-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(234,179,8,0.12)]",
  amber: "border-amber-400/20 from-amber-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(245,158,11,0.12)]",
  orange: "border-orange-400/20 from-orange-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(249,115,22,0.12)]",
  rose: "border-rose-400/20 from-rose-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(225,29,72,0.12)]",
  teal: "border-teal-400/20 from-teal-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(20,184,166,0.12)]",
  cyan: "border-cyan-400/20 from-cyan-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(6,182,212,0.12)]",
  slate: "border-slate-400/20 from-slate-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(100,116,139,0.12)]",
};

export const controlPanelGroupSurfaceClass = "space-y-3";

/** Tight vertical stack inside a queue item (no row dividers). */
export const controlPanelDashboardQueueItemStackClass = "flex min-w-0 flex-col gap-1";

/** Datetime + place + telehealth — single responsive wrap row. */
export const controlPanelDashboardScheduleMetaRowClass =
  "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5";

/** List item in Recently Created — divider between appointments only. */
export const controlPanelDashboardListRowClass =
  `${controlPanelDashboardQueueItemStackClass} border-b border-slate-100/90 py-2 last:border-0`;

/** Insights-style parallel queue cards — equal height in lg row. */
export const controlPanelDashboardQueueGridClass =
  "grid gap-4 lg:grid-cols-2 lg:items-stretch";

/** Responsive min height so both panels align on tall viewports. */
export const controlPanelDashboardQueueCardShellClass =
  "flex h-full min-h-[min(18rem,42vh)] flex-col";

export function getControlPanelCardVariantClass(color: string): string {
  const match = color.match(/bg-([a-z]+)-/);
  const variantKey = match?.[1] ?? "sky";
  return CONTROL_PANEL_GLASS_CARD_VARIANT[variantKey] ?? CONTROL_PANEL_GLASS_CARD_VARIANT.sky;
}
