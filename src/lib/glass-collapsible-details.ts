/**
 * Shared `<details>` glass shells — appointment manual override + doctor schedule toggles.
 * Native open state avoids hydration mismatch (no useState for expand).
 */

export type GlassCollapsibleTone = "sky" | "amber" | "emerald" | "violet";

const toneShell: Record<GlassCollapsibleTone, string> = {
  sky: "border-sky-200/55 bg-sky-50/35 shadow-[0_10px_32px_rgba(2,132,199,0.08)] [&[open]_summary_.glass-collapsible-chevron]:rotate-180",
  amber:
    "border-amber-200/55 bg-amber-50/35 shadow-[0_10px_32px_rgba(245,158,11,0.1)] [&[open]_summary_.glass-collapsible-chevron]:rotate-180",
  emerald:
    "border-emerald-200/55 bg-emerald-50/35 shadow-[0_10px_32px_rgba(16,185,129,0.1)] [&[open]_summary_.glass-collapsible-chevron]:rotate-180",
  violet:
    "border-violet-200/55 bg-violet-50/35 shadow-[0_10px_32px_rgba(139,92,246,0.1)] [&[open]_summary_.glass-collapsible-chevron]:rotate-180",
};

const toneChevron: Record<GlassCollapsibleTone, string> = {
  sky: "border-sky-200/60 bg-white/90 text-sky-700 shadow-[0_4px_12px_rgba(2,132,199,0.12)]",
  amber: "border-amber-200/60 bg-white/90 text-amber-700 shadow-[0_4px_12px_rgba(245,158,11,0.14)]",
  emerald: "border-emerald-200/60 bg-white/90 text-emerald-700 shadow-[0_4px_12px_rgba(16,185,129,0.12)]",
  violet: "border-violet-200/60 bg-white/90 text-violet-700 shadow-[0_4px_12px_rgba(139,92,246,0.12)]",
};

const toneActionGlow: Record<GlassCollapsibleTone, string> = {
  sky: "border-sky-300/70 bg-gradient-to-r from-sky-500/15 via-white to-white text-sky-800 shadow-[0_8px_24px_rgba(2,132,199,0.22)] hover:shadow-[0_10px_28px_rgba(2,132,199,0.28)]",
  amber:
    "border-amber-300/70 bg-gradient-to-r from-amber-500/15 via-white to-white text-amber-900 shadow-[0_8px_24px_rgba(245,158,11,0.22)] hover:shadow-[0_10px_28px_rgba(245,158,11,0.3)]",
  emerald:
    "border-emerald-300/70 bg-gradient-to-r from-emerald-500/15 via-white to-white text-emerald-900 shadow-[0_8px_24px_rgba(16,185,129,0.2)]",
  violet:
    "border-violet-300/70 bg-gradient-to-r from-violet-500/15 via-white to-white text-violet-900 shadow-[0_8px_24px_rgba(139,92,246,0.2)]",
};

export const glassCollapsibleDetailsBaseClass =
  "rounded-2xl border p-3 backdrop-blur-md [&[open]_summary]:rounded-b-none";

export function glassCollapsibleDetailsClass(tone: GlassCollapsibleTone): string {
  return `${glassCollapsibleDetailsBaseClass} ${toneShell[tone]}`;
}

export function glassCollapsibleChevronWrapClass(tone: GlassCollapsibleTone): string {
  return `flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${toneChevron[tone]}`;
}

export function glassCollapsibleActionChipClass(tone: GlassCollapsibleTone): string {
  return `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-shadow ${toneActionGlow[tone]}`;
}

export const glassCollapsibleSummaryClass =
  "flex w-full cursor-pointer list-none items-center justify-between gap-3 rounded-xl text-sm font-medium text-gray-700 transition-colors hover:bg-white/40 [&::-webkit-details-marker]:hidden";

export const glassCollapsibleBodyClass = "mt-2 space-y-2 border-t border-inherit/40 pt-2";
