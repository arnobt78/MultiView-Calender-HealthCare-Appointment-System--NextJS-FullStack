"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  insightsGlassSegmentButtonBaseClass,
  insightsSegmentActiveClass,
  insightsSegmentInactiveClass,
} from "@/lib/insights-ui-classes";
import { cn, toTitleCaseLabel } from "@/lib/utils";

export type InsightsGlassSegmentOption<T extends string> = {
  value: T;
  label: string;
  icon: LucideIcon;
  /** Hover / tooltip detail — shown via title attribute. */
  hint?: string;
};

type Props<T extends string> = {
  options: InsightsGlassSegmentOption<T>[];
  value: T;
  onChange: (next: T) => void;
  disabled?: boolean;
  ariaLabel: string;
};

/** Single-select glass pill group — period + scope toggles on /insights. */
export function InsightsGlassSegment<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  ariaLabel,
}: Props<T>) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        const Icon = opt.icon;
        return (
          <Button
            key={opt.value}
            type="button"
            size="sm"
            variant="ghost"
            title={opt.hint ?? opt.label}
            disabled={disabled}
            className={cn(
              insightsGlassSegmentButtonBaseClass,
              active ? insightsSegmentActiveClass : insightsSegmentInactiveClass
            )}
            onClick={() => onChange(opt.value)}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
            {toTitleCaseLabel(opt.label)}
          </Button>
        );
      })}
    </div>
  );
}
