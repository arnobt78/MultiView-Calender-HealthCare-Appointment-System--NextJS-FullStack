/**
 * Staff create/edit appointment dialog — glass section chrome.
 * Picker scroll/tiles: `bookingPickerScrollClass` in patient-booking-dialog-styles (shared with patient step 1).
 */
import { cn } from "@/lib/utils";

const staffAppointmentGlassShellClass = cn(
  "rounded-2xl border border-sky-200/55 bg-sky-50/35 p-3",
  "shadow-[0_10px_32px_rgba(2,132,199,0.12)] backdrop-blur-md"
);

export const staffAppointmentGlassSectionClass = cn(staffAppointmentGlassShellClass, "space-y-3");

/** Collapsible pickers — no `space-y-3` (avoids 12px gap under summary); reset UA summary margin. */
export const staffAppointmentCollapsibleDetailsClass = cn(
  staffAppointmentGlassShellClass,
  "[&[open]_summary_.staff-appt-section-chevron]:rotate-180",
  "[&>summary]:mb-0"
);

/** Full-width shell inside staff glass sections — picker scroll uses `bookingPickerScrollClass`. */
export const staffAppointmentPickerShellClass = "w-full min-w-0";

/** Shared `h-11` row — Client/Category/Status Select triggers and staff custom pickers. */
export const staffAppointmentGlassRowControlBase = cn(
  "h-11 min-h-[2.75rem] w-full min-w-0 rounded-2xl border border-sky-200/50 bg-white/75 px-3 py-0 text-sm leading-none text-gray-700 shadow-[0_8px_24px_rgba(2,132,199,0.14)] backdrop-blur-md transition-colors"
);

/** Placeholder copy — matches `data-[placeholder]:text-gray-500` on glass Radix Select triggers. */
export const staffAppointmentGlassSelectPlaceholderClass = "text-gray-500";

/**
 * Chevron on glass Select triggers (`select.tsx` `ChevronDownIcon`) and staff custom pickers.
 * `text-muted-foreground` + `opacity-50` — do not use `text-gray-500` on the icon alone.
 */
export const staffAppointmentGlassSelectChevronClass =
  "size-4 shrink-0 opacity-50 text-muted-foreground pointer-events-none";

/** Trigger value slot — same truncation as `[&_[data-slot=select-value]]` on `glassSelectTriggerClass`. */
export const staffAppointmentGlassSelectValueClass =
  "min-w-0 flex-1 truncate text-left line-clamp-1";

/** Same tokens as `glassSelectTriggerClass` in `AppointmentDialogGeneralSection`. */
export const staffAppointmentGlassSelectTriggerClass = cn(
  staffAppointmentGlassRowControlBase,
  "flex cursor-pointer items-center justify-between gap-2 hover:bg-white/90 focus-visible:border-sky-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/40",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  "[&_svg:not([class*='text-'])]:text-muted-foreground"
);

/** @deprecated Use `staffAppointmentGlassSelectTriggerClass` — alias kept for imports. */
export const staffAppointmentDropdownTriggerClass = staffAppointmentGlassSelectTriggerClass;

/** Panel under open staff picker trigger (doctor / visit-type lists). */
export const staffAppointmentDropdownPanelClass = cn(
  staffAppointmentPickerShellClass,
  "rounded-2xl border border-sky-200/55 bg-sky-50/35 p-2 shadow-[0_10px_28px_rgba(2,132,199,0.1)]"
);
