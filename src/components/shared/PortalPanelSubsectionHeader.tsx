"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PortalPanelCountBadge } from "@/components/shared/PortalPanelCountBadge";
import { PortalPanelStatusOutlineChip } from "@/components/shared/PortalPanelStatusOutlineChip";
import { cn, toSentenceCaseSubtitle, toTitleCaseLabel } from "@/lib/utils";

type PortalPanelSubsectionHeaderProps = {
  title: string | ReactNode;
  subtitle?: ReactNode;
  icon: LucideIcon;
  iconClassName?: string;
  id?: string;
  className?: string;
  count?: number | string;
  countSkeleton?: boolean;
  /** Same flex row as title + count (Today KPI) — wraps on narrow screens. */
  statusChip?: ReactNode;
  statusChipSkeleton?: boolean;
  headerActions?: ReactNode;
  /** When true, actions sit right of title block; icon tile stretches to title + subtitle height. */
  headerActionsSeparateRow?: boolean;
};

/**
 * Title row: title · count pill · status chip · (optional action) — one `flex-wrap` line.
 * Subtitle on the next line (Weekly Hours / billing parity).
 */
export function PortalPanelSubsectionHeader({
  title,
  subtitle,
  icon: Icon,
  iconClassName = "border-sky-100 bg-sky-50 [&_svg]:text-sky-600",
  id,
  className,
  count,
  countSkeleton = false,
  statusChip,
  statusChipSkeleton = false,
  headerActions,
  headerActionsSeparateRow = false,
}: PortalPanelSubsectionHeaderProps) {
  const titleBlock = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <h3
          id={id}
          className="flex shrink-0 items-center gap-2 text-sm font-semibold text-gray-700"
        >
          <span className="min-w-0">
            {typeof title === "string" ? toTitleCaseLabel(title) : title}
          </span>
          {count !== undefined ? (
            countSkeleton ? (
              <Skeleton className="h-5 w-8 shrink-0 rounded-full" aria-hidden />
            ) : (
              <PortalPanelCountBadge>{count}</PortalPanelCountBadge>
            )
          ) : null}
        </h3>
        {statusChipSkeleton ? (
          <Skeleton className="h-5 w-48 shrink-0 rounded-full" aria-hidden />
        ) : statusChip != null ? (
          typeof statusChip === "string" ? (
            <PortalPanelStatusOutlineChip>{statusChip}</PortalPanelStatusOutlineChip>
          ) : (
            statusChip
          )
        ) : null}
        {/* Inline actions — single control (e.g. Create button); filters use separate row below. */}
        {headerActions && !headerActionsSeparateRow ? (
          <span className="ml-auto flex shrink-0 self-start">{headerActions}</span>
        ) : null}
      </div>
      {subtitle ? (
        <p className="text-xs leading-snug text-muted-foreground">
          {typeof subtitle === "string" ? toSentenceCaseSubtitle(subtitle) : subtitle}
        </p>
      ) : null}
    </>
  );

  if (headerActions && headerActionsSeparateRow) {
    return (
      <div
        className={cn(
          "mb-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-3",
          className
        )}
      >
        <div className="flex min-w-0 flex-1 items-stretch gap-3">
          <span
            className={cn(
              "flex w-10 shrink-0 items-center justify-center self-stretch rounded-xl border",
              iconClassName
            )}
            aria-hidden
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">{titleBlock}</div>
        </div>
        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 md:w-auto">
          {headerActions}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mb-3 flex gap-3", className)}>
      <span
        className={cn(
          "flex w-10 shrink-0 items-center justify-center self-stretch rounded-xl border",
          iconClassName
        )}
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">{titleBlock}</div>
    </div>
  );
}
