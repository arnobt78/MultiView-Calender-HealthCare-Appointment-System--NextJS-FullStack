"use client";

import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { doctorSettingsActionButtonClass } from "@/components/shared/doctor-settings/doctor-settings-classes";
import type { GlassCollapsibleTone } from "@/lib/glass-collapsible-details";
import { cn, toTitleCaseLabel } from "@/lib/utils";

type Props = {
  tone: GlassCollapsibleTone;
  icon: LucideIcon;
  label: string;
  pending?: boolean;
  className?: string;
};

const toneToAction: Record<GlassCollapsibleTone, keyof typeof doctorSettingsActionButtonClass> = {
  sky: "weekly",
  amber: "timeOff",
  emerald: "emerald",
  violet: "violet",
};

/** Visual chip inside `<summary>` — matches Save button styling (parent `<details>` handles expand). */
export function GlassDoctorSettingsActionChip({
  tone,
  icon: Icon,
  label,
  pending = false,
  className,
}: Props) {
  const actionTone = toneToAction[tone] ?? "weekly";
  return (
    <span className={cn(doctorSettingsActionButtonClass[actionTone], "pointer-events-none", className)}>
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        <Icon className="h-3.5 w-3.5" aria-hidden />
      )}
      {toTitleCaseLabel(label)}
    </span>
  );
}
