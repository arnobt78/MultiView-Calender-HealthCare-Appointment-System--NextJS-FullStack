/**
 * Organization create/edit dialog — indigo glass chrome (CP organization-management tone).
 */
import { cn } from "@/lib/utils";
import { indigoGlassBackButtonClass } from "@/lib/calendar-header-action-styles";

export const organizationDialogShellClass =
  "flex h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] flex-col gap-0 overflow-hidden rounded-[28px] border border-indigo-400/30 bg-white p-0 shadow-[0_30px_80px_rgba(99,102,241,0.35)] backdrop-blur-sm";

export const organizationDialogGlassRowControlBase = cn(
  "h-11 min-h-[2.75rem] w-full min-w-0 rounded-2xl border border-indigo-200/50 bg-white/75 px-3 py-0 text-sm leading-none text-gray-700 shadow-[0_8px_24px_rgba(99,102,241,0.14)] backdrop-blur-md transition-colors"
);

export const organizationDialogGlassInputClass = cn(
  organizationDialogGlassRowControlBase,
  "placeholder:text-gray-500 focus-visible:border-indigo-400/50 focus-visible:ring-2 focus-visible:ring-indigo-200/40"
);

export const organizationDialogGlassSelectTriggerClass = cn(
  organizationDialogGlassRowControlBase,
  "flex cursor-pointer items-center justify-between gap-2 hover:bg-white/90 focus-visible:border-indigo-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200/40",
  "data-[placeholder]:text-gray-500"
);

export const organizationDialogDropdownPanelClass = cn(
  "w-full min-w-0 rounded-2xl border border-indigo-200/55 bg-indigo-50/35 p-2 shadow-[0_10px_28px_rgba(99,102,241,0.1)]"
);

/** Cancel — pairs with `indigoGlassPrimaryButtonClass` on submit; cursor on token. */
export const organizationDialogGlassBackButtonClass = indigoGlassBackButtonClass;

export const organizationDialogFooterStripClass =
  "shrink-0 space-y-3 border-t border-indigo-200/60 bg-indigo-50/40 px-6 py-4";

export const organizationDialogHeaderIconTileClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-indigo-200/70 bg-indigo-50 text-indigo-700";
