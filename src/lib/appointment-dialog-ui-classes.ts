/**
 * Staff create/edit appointment dialog — glass section chrome.
 * Picker scroll/tiles: `bookingPickerScrollClass` in patient-booking-dialog-styles (shared with patient step 1).
 */
import { cn } from "@/lib/utils";

export const staffAppointmentGlassSectionClass = cn(
  "space-y-3 rounded-2xl border border-sky-200/55 bg-sky-50/35 p-3",
  "shadow-[0_10px_32px_rgba(2,132,199,0.12)] backdrop-blur-md"
);

/** Full-width shell inside staff glass sections — picker scroll uses `bookingPickerScrollClass`. */
export const staffAppointmentPickerShellClass = "w-full min-w-0";
