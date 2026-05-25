import type { DoctorSettingsVariant } from "@/lib/doctor-schedule-types";

/** Dashed add-form shells — sky weekly, amber time off, emerald types. */
export const doctorSettingsAddFormClass: Record<"weekly" | "timeOff" | "additional", string> = {
  weekly: "space-y-3 rounded-xl border border-dashed border-sky-200 bg-sky-50/30 p-3",
  timeOff: "space-y-3 rounded-xl border border-dashed border-amber-200 bg-amber-50/30 p-3",
  additional: "rounded-lg border border-dashed border-emerald-200/80 bg-white/60 p-3",
};

export const doctorSettingsRowClass: Record<"weekly" | "timeOff", string> = {
  weekly: "flex items-center justify-between gap-2 rounded-xl border border-sky-100 bg-sky-50/40 px-3 py-2",
  timeOff: "flex items-center justify-between gap-2 rounded-xl border border-amber-100 bg-amber-50/40 px-3 py-2",
};

export function doctorSettingsSectionTitleClass(variant: DoctorSettingsVariant): string {
  return variant === "portal"
    ? "text-sm font-semibold text-gray-800"
    : "flex items-center gap-2 text-base";
}
