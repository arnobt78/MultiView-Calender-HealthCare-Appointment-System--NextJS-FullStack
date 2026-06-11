/**
 * Add/Edit patient dialog — emerald glass chrome (parity with staff appointment dialog sky tokens).
 */
import { cn } from "@/lib/utils";

export const patientDialogShellClass =
  "flex h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] flex-col gap-0 overflow-hidden rounded-[28px] border border-emerald-400/30 bg-white p-0 shadow-[0_30px_80px_rgba(16,185,129,0.35)] backdrop-blur-sm";

export const patientDialogGlassRowControlBase = cn(
  "h-11 min-h-[2.75rem] w-full min-w-0 rounded-2xl border border-emerald-200/50 bg-white/75 px-3 py-0 text-sm leading-none text-gray-700 shadow-[0_8px_24px_rgba(16,185,129,0.14)] backdrop-blur-md transition-colors"
);

export const patientDialogGlassInputClass = cn(
  patientDialogGlassRowControlBase,
  "placeholder:text-gray-500 focus-visible:border-emerald-400/50 focus-visible:ring-2 focus-visible:ring-emerald-200/40"
);

/** Panel under open staff-style doctor picker (patient dialog). */
export const patientDialogDropdownPanelClass = cn(
  "w-full min-w-0 rounded-2xl border border-emerald-200/55 bg-emerald-50/35 p-2 shadow-[0_10px_28px_rgba(16,185,129,0.1)]"
);

export const patientDialogGlassSelectChevronClass =
  "size-4 shrink-0 opacity-50 text-muted-foreground pointer-events-none";

export const patientDialogGlassSelectPlaceholderClass = "text-gray-500";

export const patientDialogGlassSelectValueClass =
  "min-w-0 flex-1 truncate text-left line-clamp-1";

export const patientDialogGlassSelectTriggerClass = cn(
  patientDialogGlassRowControlBase,
  "flex cursor-pointer items-center justify-between gap-2 hover:bg-white/90 focus-visible:border-emerald-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/40",
  "data-[placeholder]:text-gray-500",
  "[&_[data-slot=select-value]]:line-clamp-1 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:text-left",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  "[&_svg:not([class*='text-'])]:text-muted-foreground"
);

/** Birth date — calendar picker indicator on the right (WebKit). */
export const patientDialogGlassDateInputClass = cn(
  patientDialogGlassInputClass,
  "relative cursor-pointer pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
);

export const patientDialogGlassTextareaClass = cn(
  "w-full min-w-0 rounded-2xl border border-emerald-200/50 bg-white/75 px-3 py-2 text-sm text-gray-700 shadow-[0_8px_24px_rgba(16,185,129,0.14)] backdrop-blur-md transition-colors placeholder:text-gray-500 focus-visible:border-emerald-400/50 focus-visible:ring-2 focus-visible:ring-emerald-200/40 min-h-[88px] resize-y"
);

/** Cancel — pairs with `emeraldGlassPrimaryButtonClass` on submit; cursor on token. */
export const patientDialogGlassBackButtonClass =
  "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-emerald-300/50 bg-white/75 px-4 text-sm font-medium text-emerald-900 shadow-[0_10px_28px_rgba(16,185,129,0.2)] backdrop-blur-md transition-all duration-200 hover:border-emerald-400/55 hover:bg-emerald-50/90 hover:shadow-[0_12px_34px_rgba(16,185,129,0.28)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4";
