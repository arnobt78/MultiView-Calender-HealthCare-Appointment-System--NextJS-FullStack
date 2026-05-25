"use client";

/**
 * Glass text input — neutralizes default shadcn `Input` chrome so appointment-dialog glass tokens apply.
 */

import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import {
  doctorSettingsGlassTextInputClass,
  doctorSettingsGlassTextRowClass,
} from "@/lib/doctor-settings-glass-fields";
import { cn } from "@/lib/utils";

/** Strip `Input` defaults that override glass shadow/border/focus. */
const doctorSettingsGlassInputResetClass =
  "border-input/0 bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent";

type Tone = "sky" | "amber";
type Density = "compact" | "row";

type Props = Omit<ComponentProps<typeof Input>, "className"> & {
  tone?: Tone;
  /** `row` = `h-11` (time-off forms, matches datetime-local); `compact` = `h-9` portal grid */
  density?: Density;
  className?: string;
};

export function DoctorSettingsGlassInput({
  tone = "sky",
  density = "compact",
  className,
  ...props
}: Props) {
  const glassClass =
    density === "row"
      ? tone === "amber"
        ? doctorSettingsGlassTextRowClass.amber
        : doctorSettingsGlassTextRowClass.sky
      : tone === "amber"
        ? doctorSettingsGlassTextInputClass.amber
        : doctorSettingsGlassTextInputClass.sky;

  return (
    <div className="min-w-0">
      <Input
        className={cn(doctorSettingsGlassInputResetClass, glassClass, "cursor-text", className)}
        {...props}
      />
    </div>
  );
}
