/**
 * Telehealth queue — violet glass tokens (CP chrome tone: violet).
 */

import {
  CONTROL_PANEL_GLASS_CARD_VARIANT,
  controlPanelGlassCardBaseClass,
} from "@/lib/control-panel-glass-card";
import { violetGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import { cn } from "@/lib/utils";

export const telehealthQueueUpNextCardClass = cn(
  controlPanelGlassCardBaseClass,
  CONTROL_PANEL_GLASS_CARD_VARIANT.violet,
  "gap-0 border-violet-400/30 shadow-[0_20px_48px_rgba(139,92,246,0.16)]"
);

export const telehealthQueueListRowClass = cn(
  "rounded-2xl border border-violet-300/40 bg-gradient-to-br from-violet-500/[0.09] via-white/92 to-white/98",
  "px-3 py-3 backdrop-blur-md",
  "shadow-[0_8px_28px_rgba(139,92,246,0.16),0_2px_10px_rgba(139,92,246,0.08)]",
  "transition-all duration-200",
  "hover:border-violet-400/50 hover:shadow-[0_14px_40px_rgba(139,92,246,0.24),0_4px_14px_rgba(139,92,246,0.12)]"
);

export const telehealthQueueListRowActiveClass = cn(
  "border-violet-400/55 bg-gradient-to-br from-violet-500/15 via-violet-50/70 to-white/95",
  "shadow-[0_14px_44px_rgba(139,92,246,0.3),0_0_0_1px_rgba(167,139,250,0.35)]",
  "hover:border-violet-500/60 hover:shadow-[0_16px_48px_rgba(139,92,246,0.34),0_0_0_1px_rgba(167,139,250,0.4)]"
);

export const telehealthQueueListRowMutedClass = cn(
  "border-slate-200/55 bg-gradient-to-br from-slate-100/50 via-white/75 to-white/85",
  "opacity-70 shadow-[0_4px_20px_rgba(100,116,139,0.12)]",
  "hover:border-slate-300/60 hover:shadow-[0_8px_28px_rgba(100,116,139,0.16)]"
);

/** Date filter tabs — violet outer glow (chrome actions slot). */
export const telehealthQueueFilterPillGroupClass = cn(
  "flex gap-2 rounded-2xl border border-violet-200/60 bg-violet-50/40 p-1 backdrop-blur-sm",
  "shadow-[0_10px_28px_rgba(139,92,246,0.22)]"
);

/** Inactive tab — transparent border keeps size stable when active border appears. */
export const telehealthQueueFilterTabInactiveClass = cn(
  "cursor-pointer rounded-xl border border-transparent px-3 py-1.5 text-xs font-medium transition-all duration-200",
  "text-violet-700/80 hover:border-violet-200/60 hover:bg-white/75 hover:text-violet-900",
  "hover:shadow-[0_6px_18px_rgba(139,92,246,0.14)]"
);

/** Active tab — text color at 50% bg + white label + violet shadow glow. */
export const telehealthQueueFilterTabActiveClass = cn(
  "cursor-pointer rounded-xl border border-violet-500/55 bg-violet-700/50 px-3 py-1.5 text-xs font-medium text-white",
  "shadow-[0_12px_36px_rgba(139,92,246,0.34)] backdrop-blur-md transition-all duration-200",
  "hover:border-violet-500/70 hover:bg-violet-700/60 hover:text-white hover:shadow-[0_14px_40px_rgba(139,92,246,0.4)]",
  "active:text-white"
);

/** Schedule list panel — sky glass (right column). */
export const telehealthQueueSchedulePanelClass = cn(
  "border-sky-400/25 shadow-[0_24px_60px_rgba(2,132,199,0.12)]"
);

export const telehealthQueueSchedulePanelIconClass =
  "border-sky-100 bg-sky-50 [&_svg]:text-sky-600";

/** Empty schedule body — dashed sky shell centered in panel. */
export const telehealthQueueScheduleEmptyShellClass = cn(
  "flex w-full max-w-sm flex-col items-center justify-center rounded-[28px]",
  "border border-dashed border-sky-200/80 bg-sky-50/30 p-6 text-center"
);

/** KPI strip — 1 → 2 → 4 columns (rose total all-time card). */
export const telehealthQueueStatsGridClass =
  "grid grid-cols-1 gap-2 overflow-visible sm:grid-cols-2 lg:grid-cols-4";

/** Up Next — full-width violet glass Join. */
export const telehealthQueueJoinButtonClass = cn(
  violetGlassPrimaryButtonClass,
  "h-11 w-full justify-center text-sm font-semibold"
);

/** Schedule list row — compact violet glass Join. */
export const telehealthQueueJoinButtonSmClass = cn(
  violetGlassPrimaryButtonClass,
  "h-9 px-3 text-xs font-semibold"
);

export const telehealthQueueGridClass = "grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6";

export const telehealthQueueUpNextColumnClass =
  "lg:col-span-1 border-b border-violet-100/80 pb-6 lg:border-b-0 lg:border-r lg:pr-6 lg:pb-0";

export const telehealthQueueScheduleColumnClass = "lg:col-span-2 min-w-0";

export const telehealthQueueLivePulseDotClass = "relative inline-flex h-3 w-3";

export const telehealthQueueSectionTitleClass =
  "mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800";

/** Up Next header chips — shared height for time, status, telehealth. */
export const telehealthQueueHeaderChipClass =
  "inline-flex h-6 min-h-6 items-center gap-1 rounded-full px-2 text-[10px] font-normal leading-none";

export const telehealthQueueTelehealthHeaderBadgeClass = cn(
  telehealthQueueHeaderChipClass,
  "border-sky-200/60 bg-sky-100/80 text-sky-700 [&_svg]:size-3"
);
