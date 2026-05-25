"use client";

/**
 * Glass text input — neutralizes default shadcn `Input` chrome so appointment-dialog glass tokens apply.
 */

import { useEffect, useRef, type ComponentProps } from "react";
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
  /** Debug session — logs computed box-shadow when reason field mounts */
  debugFieldId?: string;
};

export function DoctorSettingsGlassInput({
  tone = "sky",
  density = "compact",
  className,
  debugFieldId,
  ...props
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glassClass =
    density === "row"
      ? tone === "amber"
        ? doctorSettingsGlassTextRowClass.amber
        : doctorSettingsGlassTextRowClass.sky
      : tone === "amber"
        ? doctorSettingsGlassTextInputClass.amber
        : doctorSettingsGlassTextInputClass.sky;

  useEffect(() => {
    if (!debugFieldId || !wrapRef.current) return;
    const el = wrapRef.current.querySelector("input");
    if (!el) return;
    const cs = getComputedStyle(el);
    // #region agent log
    fetch("http://127.0.0.1:7938/ingest/15849825-35e9-4832-9975-ca3563c056ec", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8bb90b" },
      body: JSON.stringify({
        sessionId: "8bb90b",
        runId: "pre-fix",
        hypothesisId: "H1-H4",
        location: "DoctorSettingsGlassInput.tsx:useEffect",
        message: "glass input computed styles",
        data: {
          debugFieldId,
          tone,
          density,
          className: el.className,
          boxShadow: cs.boxShadow,
          borderColor: cs.borderColor,
          backgroundColor: cs.backgroundColor,
          height: cs.height,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [debugFieldId, tone, density]);

  return (
    <div ref={wrapRef} className="min-w-0">
      <Input
        className={cn(doctorSettingsGlassInputResetClass, glassClass, "cursor-text", className)}
        {...props}
      />
    </div>
  );
}
