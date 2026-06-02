"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { insightsStatCardPeriodHintClass } from "@/lib/insights-ui-classes";
import { cn, toSentenceCaseSubtitle, toTitleCaseLabel } from "@/lib/utils";

/** Visual presets for glass stat tiles — border tint + soft colored shadow (reusable on other dashboards). */
const VARIANT_CLASS: Record<
  "violet" | "emerald" | "sky" | "amber" | "rose",
  { shell: string; iconWrap: string }
> = {
  violet: {
    shell:
      "border-violet-400/25 bg-white/70 shadow-[0_14px_44px_rgba(139,92,246,0.2)] backdrop-blur-sm supports-[backdrop-filter]:bg-white/55",
    iconWrap: "border-violet-200/80 bg-violet-50 text-violet-700",
  },
  emerald: {
    shell:
      "border-emerald-400/25 bg-white/70 shadow-[0_14px_44px_rgba(16,185,129,0.22)] backdrop-blur-sm supports-[backdrop-filter]:bg-white/55",
    iconWrap: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
  },
  sky: {
    shell:
      "border-sky-400/25 bg-white/70 shadow-[0_14px_44px_rgba(2,132,199,0.18)] backdrop-blur-sm supports-[backdrop-filter]:bg-white/55",
    iconWrap: "border-sky-200/80 bg-sky-50 text-sky-700",
  },
  amber: {
    shell:
      "border-amber-400/30 bg-white/70 shadow-[0_14px_44px_rgba(217,119,6,0.2)] backdrop-blur-sm supports-[backdrop-filter]:bg-white/55",
    iconWrap: "border-amber-200/80 bg-amber-50 text-amber-800",
  },
  rose: {
    shell:
      "border-rose-400/30 bg-white/70 shadow-[0_14px_44px_rgba(244,63,94,0.2)] backdrop-blur-sm supports-[backdrop-filter]:bg-white/55",
    iconWrap: "border-rose-200/80 bg-rose-50 text-rose-700",
  },
};

export type PatientStatCardVariant = keyof typeof VARIANT_CLASS;

export function PatientStatCard({
  variant,
  icon: Icon,
  title,
  subtitle,
  badge,
  value,
  /** Override numeric display (e.g. currency) — still uses value for a11y when string. */
  valueDisplay,
  /** Pulse only in the numeric slot — titles/icons stay stable (avoids whole-card flicker on refetch). */
  valueSkeleton,
  /** Left-aligned period/scope hint in the value row (insights View-as filter). */
  valueRowHint,
  /** Optional tone for value row (e.g. emerald/red period-over-period). */
  valueClassName,
  /** Optional tone for title badge (e.g. green/red delta chip). */
  badgeClassName,
}: {
  variant: PatientStatCardVariant;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  /** Inline title chip — string or dashboard-style status badges. */
  badge?: ReactNode;
  value: number;
  valueDisplay?: ReactNode;
  valueSkeleton: boolean;
  valueRowHint?: string;
  valueClassName?: string;
  badgeClassName?: string;
}) {
  const v = VARIANT_CLASS[variant];
  const displayTitle = toTitleCaseLabel(title);
  const displaySubtitle = subtitle ? toSentenceCaseSubtitle(subtitle) : undefined;
  return (
    <div
      className={cn(
        "flex min-h-[108px] flex-col gap-2 rounded-2xl border px-4 py-3 transition-shadow hover:shadow-xl",
        v.shell
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border",
            v.iconWrap
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-gray-700">{displayTitle}</p>
            {badge != null ? (
              typeof badge === "string" ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-semibold tabular-nums",
                    badgeClassName ?? "font-normal text-muted-foreground"
                  )}
                >
                  {badge}
                </Badge>
              ) : (
                badge
              )
            ) : null}
          </div>
          {displaySubtitle ? (
            <p className=" text-xs leading-snug text-muted-foreground">{displaySubtitle}</p>
          ) : null}
        </div>
      </div>
      <div
        className={cn(
          "flex min-h-[2.25rem] items-end gap-2 border-t border-black/[0.04] pt-2",
          valueRowHint ? "justify-between" : "justify-end"
        )}
      >
        {valueRowHint ? (
          <span className={insightsStatCardPeriodHintClass}>{valueRowHint}</span>
        ) : null}
        {valueSkeleton ? (
          <Skeleton className="h-9 w-16 shrink-0 rounded-xl" aria-hidden />
        ) : valueDisplay != null ? (
          <div
            className={cn(
              "shrink-0 text-3xl font-semibold tabular-nums tracking-tight text-gray-700",
              valueClassName
            )}
          >
            {valueDisplay}
          </div>
        ) : (
          <span
            className={cn(
              "shrink-0 text-3xl font-semibold tabular-nums tracking-tight text-gray-700",
              valueClassName
            )}
          >
            {value}
          </span>
        )}
      </div>
    </div>
  );
}
