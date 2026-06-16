/**
 * Shared visit meta chips — telehealth queue headers + appointment detail Visit Overview row.
 * Single height/token so type, fee, status, and telehealth badges align on one wrap row.
 */

import { cn } from "@/lib/utils";

/** Responsive inline row under section titles. */
export const appointmentVisitMetaBadgeRowClass =
  "flex min-w-0 flex-wrap items-center gap-2";

/** Unified chip box — h-6 matches telehealth queue header chips. */
export const appointmentVisitMetaChipClass =
  "inline-flex h-6 min-h-6 max-w-full min-w-0 items-center gap-1 rounded-full px-2 text-[10px] font-normal leading-none";

/** Visit type chip — violet glass on detail + queue. */
export const appointmentVisitMetaTypeChipClass = cn(
  appointmentVisitMetaChipClass,
  "border border-violet-200/70 bg-violet-50/80 text-violet-800 shadow-[0_2px_8px_rgba(139,92,246,0.12)]"
);

/** Visit fee chip — emerald glass; pairs with type chip height. */
export const appointmentVisitMetaFeeChipClass = cn(
  appointmentVisitMetaChipClass,
  "border border-emerald-200/70 bg-emerald-50/80 text-emerald-700 shadow-[0_2px_8px_rgba(16,185,129,0.15)]"
);

/** Billing chip placeholder — only when queryKeys.invoices.all cache is cold. */
export const appointmentVisitMetaBillingChipSkeletonClass = cn(
  appointmentVisitMetaChipClass,
  "h-6 w-14 animate-pulse border border-slate-200/70 bg-slate-100/80"
);

/**
 * Up Next hero — shared glass pill sizing for time, status, fee, billing, telehealth.
 * Pairs with semantic `calendar-glass-badge-*` color tokens (same glow as Alert/Draft).
 */
export const appointmentVisitMetaHeroGlassChipClass =
  "calendar-glass-badge h-6 min-h-6 shrink-0 gap-1 py-0 text-[10px] font-normal leading-none [&_svg]:h-3 [&_svg]:w-3";

/** Up Next hero — time · status · fee · billing left; telehealth right. */
export const appointmentVisitMetaUpNextHeroRowClass =
  "flex w-full min-w-0 items-center justify-between gap-2";

export const appointmentVisitMetaUpNextHeroLeftClass =
  "flex min-w-0 flex-1 flex-wrap items-center gap-2";
