/**
 * Sky glass shell + form controls for patient booking dialog (matches AppointmentDialog / GlobalSearch).
 */
import { cn } from "@/lib/utils";

/** `!flex` / `!overflow-hidden` override Radix DialogContent defaults (`grid`, `overflow-y-auto`) so inner panels scroll. */
export const patientBookingDialogContentClass =
  "!flex h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] flex-col gap-0 !overflow-hidden rounded-[28px] border border-sky-400/30 bg-white p-0 shadow-[0_30px_80px_rgba(2,132,199,0.35)] backdrop-blur-sm";

export const patientBookingGlassInputClass = cn(
  "border-sky-200/70 bg-white/90 shadow-[0_8px_24px_rgba(2,132,199,0.08)]",
  "focus-visible:border-sky-400 focus-visible:ring-sky-500/30"
);

export const patientBookingGlassSelectTriggerClass = cn(
  patientBookingGlassInputClass,
  "cursor-pointer"
);

/** Type / slot selection tiles — Quick Actions card rhythm with sky tint. */
export const patientBookingGlassTileClass =
  "w-full text-left rounded-2xl border border-sky-200/60 bg-white p-4 shadow-[0_10px_30px_rgba(2,132,199,0.12)] transition-all hover:border-sky-300/70 hover:shadow-[0_14px_34px_rgba(2,132,199,0.18)]";

export const patientBookingGlassTileSelectedClass =
  "border-sky-500/80 bg-sky-50/90 ring-1 ring-sky-400/60 shadow-[0_12px_36px_rgba(2,132,199,0.22)]";

export const patientBookingSummaryCardClass =
  "rounded-2xl border border-sky-200/60 bg-gradient-to-br from-sky-50/90 via-white to-white p-4 text-sm shadow-[0_10px_30px_rgba(2,132,199,0.12)] space-y-1.5";

/**
 * Scroll panel that grows to the dialog footer — doctor picker + appointment type lists.
 * Parent chain must be `flex min-h-0 flex-1 flex-col`.
 */
export const patientBookingFillScrollPanelClass =
  "min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-3";
