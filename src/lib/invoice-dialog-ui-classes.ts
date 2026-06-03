/**
 * Create/Edit invoice dialog — amber glass chrome (billing tone; distinct from patient emerald + appointment sky).
 */
import { cn } from "@/lib/utils";

export const invoiceDialogShellClass =
  "flex h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] flex-col gap-0 overflow-hidden rounded-[28px] border border-amber-400/30 bg-white p-0 shadow-[0_30px_80px_rgba(245,158,11,0.35)] backdrop-blur-sm";

export const invoiceDialogGlassRowControlBase = cn(
  "h-11 min-h-[2.75rem] w-full min-w-0 rounded-2xl border border-amber-200/50 bg-white/75 px-3 py-0 text-sm leading-none text-gray-700 shadow-[0_8px_24px_rgba(245,158,11,0.14)] backdrop-blur-md transition-colors"
);

export const invoiceDialogGlassInputClass = cn(
  invoiceDialogGlassRowControlBase,
  "placeholder:text-gray-500 focus-visible:border-amber-400/50 focus-visible:ring-2 focus-visible:ring-amber-200/40"
);

export const invoiceDialogGlassTextareaClass = cn(
  "w-full min-w-0 rounded-2xl border border-amber-200/50 bg-white/75 px-3 py-2 text-sm text-gray-700 shadow-[0_8px_24px_rgba(245,158,11,0.14)] backdrop-blur-md transition-colors placeholder:text-gray-500 focus-visible:border-amber-400/50 focus-visible:ring-2 focus-visible:ring-amber-200/40 min-h-[88px] resize-y"
);

export const invoiceDialogGlassDateInputClass = cn(
  invoiceDialogGlassInputClass,
  "relative cursor-pointer pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
);

export const invoiceDialogDropdownPanelClass = cn(
  "w-full min-w-0 rounded-2xl border border-amber-200/55 bg-amber-50/35 p-2 shadow-[0_10px_28px_rgba(245,158,11,0.1)]"
);

/** Visit picker tiles — amber tint (parity with patient booking sky tiles). */
export const invoiceDialogGlassTileClass =
  "w-full text-left rounded-2xl border border-amber-200/60 bg-white p-3 shadow-[0_10px_30px_rgba(245,158,11,0.12)] transition-all hover:border-amber-300/70 hover:shadow-[0_14px_34px_rgba(245,158,11,0.18)]";

export const invoiceDialogGlassTileSelectedClass =
  "border-amber-500/80 bg-amber-50/90 ring-1 ring-amber-400/60 shadow-[0_12px_36px_rgba(245,158,11,0.22)]";

export const invoiceDialogSummaryCardClass =
  "rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/90 via-white to-white p-4 text-sm shadow-[0_10px_30px_rgba(245,158,11,0.12)]";

export const invoiceDialogPickerScrollClass = cn(
  "w-full max-h-[min(42vh,420px)] overflow-y-auto overflow-x-hidden overscroll-contain",
  "space-y-2 px-1 py-1 [scrollbar-gutter:stable]"
);

/** Cancel — pairs with `amberGlassPrimaryButtonClass` on submit. */
export const invoiceDialogGlassBackButtonClass =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-amber-300/50 bg-white/75 px-4 text-sm font-medium text-amber-900 shadow-[0_10px_28px_rgba(245,158,11,0.2)] backdrop-blur-md transition-all duration-200 hover:border-amber-400/55 hover:bg-amber-50/90 hover:shadow-[0_12px_34px_rgba(245,158,11,0.28)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4";

export const invoiceDialogSectionHeadingClass =
  "text-xs font-semibold uppercase tracking-wide text-amber-900/80";
