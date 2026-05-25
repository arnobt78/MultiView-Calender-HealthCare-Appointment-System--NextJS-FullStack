/**
 * Glass list rows + portal panel shells — violet (global visit types) and emerald (owned types).
 */

import type { GlassCollapsibleTone } from "@/lib/glass-collapsible-details";
import { cn } from "@/lib/utils";

export type DoctorSettingsGlassSurfaceTone = Extract<GlassCollapsibleTone, "violet" | "emerald">;

const listRowToneClass: Record<DoctorSettingsGlassSurfaceTone, string> = {
  violet:
    "border-violet-200/55 bg-gradient-to-br from-violet-500/8 via-white/90 to-white/95 shadow-[0_8px_24px_rgba(139,92,246,0.14)]",
  emerald:
    "border-emerald-200/55 bg-gradient-to-br from-emerald-500/8 via-white/90 to-white/95 shadow-[0_8px_24px_rgba(16,185,129,0.14)]",
};

const panelToneClass: Record<DoctorSettingsGlassSurfaceTone, string> = {
  violet: "shadow-[0_12px_40px_rgba(139,92,246,0.14)]",
  emerald: "shadow-[0_12px_40px_rgba(16,185,129,0.14)]",
};

export function doctorSettingsGlassListRowClass(
  tone: DoctorSettingsGlassSurfaceTone,
  enabled = true
): string {
  return cn(
    "flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 backdrop-blur-md transition-shadow",
    listRowToneClass[tone],
    !enabled && "opacity-75"
  );
}

export function doctorSettingsGlassPanelShadowClass(tone: DoctorSettingsGlassSurfaceTone): string {
  return panelToneClass[tone];
}

/** Native checkbox — project rule: no shadcn Checkbox. */
export function doctorSettingsGlassCheckboxClass(tone: DoctorSettingsGlassSurfaceTone): string {
  return cn(
    "h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 disabled:cursor-not-allowed",
    tone === "violet" ? "accent-violet-600" : "accent-emerald-600"
  );
}

export const doctorSettingsPortalIntroClass =
  "mb-3 text-xs leading-relaxed text-muted-foreground";
