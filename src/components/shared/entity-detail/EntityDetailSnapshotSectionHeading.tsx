"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PortalPanelCountBadge } from "@/components/shared/PortalPanelCountBadge";
import { entityDetailSectionIconCircleClass } from "@/lib/patient-detail-ui-classes";
import { cn } from "@/lib/utils";

type EntityDetailSnapshotSectionHeadingProps = {
  icon: LucideIcon;
  iconClassName?: string;
  children: ReactNode;
  /** Full total for badge — not limited to table row cap. */
  count?: number;
  countSkeleton?: boolean;
  className?: string;
};

/**
 * Snapshot table section title — inline `PortalPanelCountBadge` (doctor-portal panel parity).
 * Used on patient detail Related Appointments + Invoices; category detail uses outline Badge in its tone shell.
 */
export function EntityDetailSnapshotSectionHeading({
  icon: Icon,
  iconClassName = "h-3.5 w-3.5 text-sky-600",
  children,
  count,
  countSkeleton = false,
  className,
}: EntityDetailSnapshotSectionHeadingProps) {
  return (
    <h3 className={cn("flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-700", className)}>
      <span className={entityDetailSectionIconCircleClass}>
        <Icon className={iconClassName} aria-hidden />
      </span>
      <span className="min-w-0">{children}</span>
      {count !== undefined ? (
        countSkeleton ? (
          <Skeleton className="h-5 w-10 shrink-0 rounded-full" aria-hidden />
        ) : (
          <PortalPanelCountBadge>{count}</PortalPanelCountBadge>
        )
      ) : null}
    </h3>
  );
}
