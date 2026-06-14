import type { DoctorSettingsVariant } from "@/lib/doctor-schedule-types";
import {
  doctorSettingsGlassSelectTriggerClass,
  doctorSettingsGlassTextInputClass,
  doctorSettingsGlassTextRowClass,
} from "@/lib/doctor-settings-glass-fields";
import { glassCollapsibleActionChipClass } from "@/lib/glass-collapsible-details";
import { cn } from "@/lib/utils";

export {
  doctorSettingsGlassSelectTriggerClass,
  doctorSettingsGlassTextInputClass,
  doctorSettingsGlassTextRowClass,
};

/** Dashed add-form shells — sky weekly, amber time off, emerald types (portal uses glass glow). */
export const doctorSettingsAddFormClass: Record<"weekly" | "timeOff" | "additional", string> = {
  weekly: "space-y-3 rounded-xl border border-dashed border-sky-200 bg-sky-50/30 p-3",
  timeOff: "space-y-3 rounded-xl border border-dashed border-amber-200 bg-amber-50/30 p-3",
  additional:
    "space-y-3 rounded-2xl border border-dashed border-emerald-200/70 bg-gradient-to-br from-emerald-500/8 via-white/90 to-white/95 p-3 shadow-[0_8px_24px_rgba(16,185,129,0.12)] backdrop-blur-md",
};

export const doctorSettingsRowClass: Record<"weekly" | "timeOff", string> = {
  weekly: "flex items-center justify-between gap-2 rounded-xl border border-sky-100 bg-sky-50/40 px-3 py-2",
  timeOff: "flex items-center justify-between gap-2 rounded-xl border border-amber-100 bg-amber-50/40 px-3 py-2",
};

export function doctorSettingsSectionTitleClass(variant: DoctorSettingsVariant): string {
  return variant === "portal"
    ? "text-sm font-semibold text-gray-700"
    : "flex items-center gap-2 text-base";
}

/** Save buttons + summary chips — one visual system (font, padding, glow). */
export const doctorSettingsActionButtonClass: Record<
  "weekly" | "timeOff" | "emerald" | "violet",
  string
> = {
  weekly: cn(
    glassCollapsibleActionChipClass("sky"),
    "h-9 min-h-9 rounded-full px-4 text-sm font-semibold"
  ),
  timeOff: cn(
    glassCollapsibleActionChipClass("amber"),
    "h-9 min-h-9 rounded-full px-4 text-sm font-semibold"
  ),
  emerald: cn(
    glassCollapsibleActionChipClass("emerald"),
    "h-9 min-h-9 rounded-full px-4 text-sm font-semibold"
  ),
  violet: cn(
    glassCollapsibleActionChipClass("violet"),
    "h-9 min-h-9 rounded-full px-4 text-sm font-semibold"
  ),
};

/** @deprecated Use doctorSettingsActionButtonClass — kept for CP flat forms. */
export const doctorSettingsGlowButtonClass = doctorSettingsActionButtonClass;
