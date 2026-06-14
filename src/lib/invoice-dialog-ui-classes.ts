/**
 * Create/Edit invoice dialog — violet glass chrome (billing tone; matches invoice detail).
 */
import { cn } from "@/lib/utils";

export const invoiceDialogShellClass =
  "flex h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] flex-col gap-0 overflow-hidden rounded-[28px] border border-violet-400/30 bg-white p-0 shadow-[0_30px_80px_rgba(139,92,246,0.35)] backdrop-blur-sm";

export const invoiceDialogGlassRowControlBase = cn(
  "h-11 min-h-[2.75rem] w-full min-w-0 rounded-2xl border border-violet-200/50 bg-white/75 px-3 py-0 text-sm leading-none text-gray-700 shadow-[0_8px_24px_rgba(139,92,246,0.14)] backdrop-blur-md transition-colors"
);

export const invoiceDialogGlassInputClass = cn(
  invoiceDialogGlassRowControlBase,
  "placeholder:text-gray-500 focus-visible:border-violet-400/50 focus-visible:ring-2 focus-visible:ring-violet-200/40"
);

export const invoiceDialogGlassTextareaClass = cn(
  "w-full min-w-0 rounded-2xl border border-violet-200/50 bg-white/75 px-3 py-2 text-sm text-gray-700 shadow-[0_8px_24px_rgba(139,92,246,0.14)] backdrop-blur-md transition-colors placeholder:text-gray-500 focus-visible:border-violet-400/50 focus-visible:ring-2 focus-visible:ring-violet-200/40 min-h-[88px] resize-y"
);

export const invoiceDialogGlassDateInputClass = cn(
  invoiceDialogGlassInputClass,
  "relative cursor-pointer pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
);

export const invoiceDialogDropdownPanelClass = cn(
  "w-full min-w-0 rounded-2xl border border-violet-200/55 bg-violet-50/35 p-2 shadow-[0_10px_28px_rgba(139,92,246,0.1)]"
);

/** StaffAppointmentPickerField violet tone — matches invoice glass inputs. */
export const invoiceDialogGlassSelectTriggerClass = cn(
  invoiceDialogGlassRowControlBase,
  "flex cursor-pointer items-center justify-between gap-2 text-left"
);

export const invoiceDialogGlassSelectChevronClass =
  "size-4 shrink-0 opacity-50 text-muted-foreground pointer-events-none";

export const invoiceDialogGlassSelectPlaceholderClass = "text-gray-500";

export const invoiceDialogGlassSelectValueClass =
  "min-w-0 flex-1 truncate text-left font-medium text-gray-700";

/** Visit picker tiles — violet tint (parity with invoice detail cards). */
export const invoiceDialogGlassTileClass =
  "w-full text-left rounded-2xl border border-violet-200/60 bg-white p-3 shadow-[0_10px_30px_rgba(139,92,246,0.12)] transition-all hover:border-violet-300/70 hover:shadow-[0_14px_34px_rgba(139,92,246,0.18)]";

export const invoiceDialogGlassTileSelectedClass =
  "border-violet-500/80 bg-violet-50/90 ring-1 ring-violet-400/60 shadow-[0_12px_36px_rgba(139,92,246,0.22)]";

export const invoiceDialogSummaryCardClass =
  "rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50/90 via-white to-white p-4 text-sm shadow-[0_10px_30px_rgba(139,92,246,0.12)]";

export const invoiceDialogPickerScrollClass = cn(
  "w-full max-h-[min(42vh,420px)] overflow-y-auto overflow-x-hidden overscroll-contain",
  "space-y-2 px-1 py-1 [scrollbar-gutter:stable]"
);

/** Cancel — pairs with `violetGlassPrimaryButtonClass` on submit; cursor on token. */
export const invoiceDialogGlassBackButtonClass =
  "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-violet-300/50 bg-white/75 px-4 text-sm font-medium text-violet-900 shadow-[0_10px_28px_rgba(139,92,246,0.2)] backdrop-blur-md transition-all duration-200 hover:border-violet-400/55 hover:bg-violet-50/90 hover:shadow-[0_12px_34px_rgba(139,92,246,0.28)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4";

export const invoiceDialogSectionHeadingClass =
  "text-xs font-semibold uppercase tracking-wide text-violet-900/80";
