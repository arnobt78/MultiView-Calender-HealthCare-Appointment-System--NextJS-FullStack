"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import {
  glassCollapsibleBodyClass,
  glassCollapsibleChevronWrapClass,
  glassCollapsibleDetailsClass,
  glassCollapsibleSummaryClass,
  type GlassCollapsibleTone,
} from "@/lib/glass-collapsible-details";
import { cn } from "@/lib/utils";

type GlassCollapsibleDetailsProps = {
  tone?: GlassCollapsibleTone;
  title: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  summaryChip?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

/**
 * Reusable native `<details>` expander — same pattern as `SchedulingManualOverride`.
 * Closed by default; chevron rotates via CSS `[open]` (hydration-safe). Ref used to close on Cancel.
 */
export const GlassCollapsibleDetails = forwardRef<HTMLDetailsElement, GlassCollapsibleDetailsProps>(
  function GlassCollapsibleDetails(
    {
      tone = "sky",
      title,
      hint,
      icon: Icon,
      summaryChip,
      children,
      className,
      bodyClassName,
    },
    ref
  ) {
    const showTitle = title !== "" && title != null;

    return (
      <details ref={ref} className={cn(glassCollapsibleDetailsClass(tone), className)}>
        <summary className={glassCollapsibleSummaryClass}>
          <span className="flex min-w-0 flex-1 items-start gap-2 text-left">
            {Icon && (showTitle || hint) ? (
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-current opacity-80" aria-hidden />
            ) : null}
            <span className="min-w-0 flex-1 leading-snug">
              {summaryChip ? (
                <span className="block">{summaryChip}</span>
              ) : showTitle ? (
                <span className="block min-w-0 font-medium text-gray-800">{title}</span>
              ) : null}
              {hint ? (
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{hint}</span>
              ) : null}
            </span>
          </span>
          <span className={glassCollapsibleChevronWrapClass(tone)} aria-hidden>
            <ChevronDown className="glass-collapsible-chevron h-4 w-4 transition-transform duration-200" />
          </span>
        </summary>
        <div className={cn(glassCollapsibleBodyClass, bodyClassName)}>{children}</div>
      </details>
    );
  }
);

GlassCollapsibleDetails.displayName = "GlassCollapsibleDetails";
