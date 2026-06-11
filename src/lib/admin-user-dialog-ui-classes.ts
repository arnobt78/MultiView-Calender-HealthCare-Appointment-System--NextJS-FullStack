/**
 * Add/Edit admin user dialog — violet glass chrome (user-admin-management tab tone).
 */
import { cn } from "@/lib/utils";

export const adminUserDialogShellClass =
  "flex h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] flex-col gap-0 overflow-hidden rounded-[28px] border border-violet-400/30 bg-white p-0 shadow-[0_30px_80px_rgba(139,92,246,0.35)] backdrop-blur-sm";

export const adminUserDialogGlassRowControlBase = cn(
  "h-11 min-h-[2.75rem] w-full min-w-0 rounded-2xl border border-violet-200/50 bg-white/75 px-3 py-0 text-sm leading-none text-gray-700 shadow-[0_8px_24px_rgba(139,92,246,0.14)] backdrop-blur-md transition-colors"
);

export const adminUserDialogGlassInputClass = cn(
  adminUserDialogGlassRowControlBase,
  "placeholder:text-gray-500 focus-visible:border-violet-400/50 focus-visible:ring-2 focus-visible:ring-violet-200/40"
);

export const adminUserDialogGlassSelectTriggerClass = cn(
  adminUserDialogGlassRowControlBase,
  "flex cursor-pointer items-center justify-between gap-2 hover:bg-white/90 focus-visible:border-violet-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/40",
  "data-[placeholder]:text-gray-500",
  "[&_[data-slot=select-value]]:line-clamp-1 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:text-left",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  "[&_svg:not([class*='text-'])]:text-muted-foreground"
);

/** Cancel — pairs with `violetGlassPrimaryButtonClass`; cursor on token. */
export const adminUserDialogGlassBackButtonClass =
  "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-violet-300/50 bg-white/75 px-4 text-sm font-medium text-violet-900 shadow-[0_10px_28px_rgba(139,92,246,0.2)] backdrop-blur-md transition-all duration-200 hover:border-violet-400/55 hover:bg-violet-50/90 hover:shadow-[0_12px_34px_rgba(139,92,246,0.28)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4";

/** Dialog header icon tile — matches violet tab chrome. */
export const adminUserDialogHeaderIconTileClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-200/70 bg-violet-50 text-violet-700";

export const adminUserDialogFooterStripClass =
  "shrink-0 space-y-3 border-t border-violet-200/60 bg-violet-50/40 px-6 py-4";

export const adminUserDialogCloseHoverClass =
  "ml-auto h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-violet-100 hover:text-violet-800";
