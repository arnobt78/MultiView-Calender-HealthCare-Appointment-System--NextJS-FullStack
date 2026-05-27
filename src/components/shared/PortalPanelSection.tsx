"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { portalPanelSectionHeadingClass } from "@/lib/page-chrome-classes";
import { PortalPanelCountBadge } from "@/components/shared/PortalPanelCountBadge";
import { PortalPanelSubsectionHeader } from "@/components/shared/PortalPanelSubsectionHeader";
import { cn, toSentenceCaseSubtitle, toTitleCaseLabel } from "@/lib/utils";

/** Shared portal panel shell — matches patient-portal in-card sections (no `CardHeader` strip). */
export const portalPanelCardClass =
  "overflow-hidden rounded-[24px] border border-slate-200/80 bg-card shadow-[0_8px_32px_rgba(99,102,241,0.12)]";

type PortalPanelSectionProps = {
  id?: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  /** Icon circle border/background, e.g. `border-blue-100 bg-blue-50 [&_svg]:text-blue-500` */
  iconClassName?: string;
  count?: number | string;
  countSkeleton?: boolean;
  /** Count pill beside title (My Patients / Upcoming); default trailing for schedule panels. */
  countInline?: boolean;
  /** `stacked`: tall icon tile spans title + subtitle (`PortalPanelSubsectionHeader`). */
  headerVariant?: "inline" | "stacked";
  /** When set, replaces default title/subtitle/count row (e.g. insights Appointments toolbar). */
  headerSlot?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

/**
 * White in-card section — title row + body inside one `CardContent` (fixes headers appearing
 * outside the panel when `CardHeader` + gradient classes were used on doctor portal).
 */
export function PortalPanelSection({
  id,
  title,
  subtitle,
  icon: Icon,
  iconClassName = "border-sky-100 bg-sky-50 [&_svg]:text-sky-500",
  count,
  countSkeleton = false,
  countInline = false,
  headerVariant = "inline",
  headerSlot,
  children,
  className,
  contentClassName,
}: PortalPanelSectionProps) {
  const headingId = id ?? undefined;
  const useStackedHeader =
    !headerSlot && headerVariant === "stacked" && subtitle != null && subtitle !== "";
  const displayTitle = toTitleCaseLabel(title);
  const displaySubtitle = subtitle ? toSentenceCaseSubtitle(subtitle) : undefined;

  return (
    <Card className={cn(portalPanelCardClass, className)}>
      <CardContent className={cn("p-4 text-gray-700 sm:p-6", contentClassName)}>
        <section aria-labelledby={headingId}>
          {headerSlot ? <div className="mb-3">{headerSlot}</div> : null}
          {!headerSlot && useStackedHeader ? (
            <PortalPanelSubsectionHeader
              id={headingId}
              title={displayTitle}
              subtitle={displaySubtitle}
              icon={Icon}
              iconClassName={iconClassName}
              count={count}
              countSkeleton={countSkeleton}
              className="mb-3"
            />
          ) : !headerSlot ? (
            <>
              <h3 id={headingId} className={portalPanelSectionHeadingClass}>
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                    iconClassName
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="min-w-0">{displayTitle}</span>
                {count !== undefined && countInline ? (
                  countSkeleton ? (
                    <Skeleton className="h-5 w-10 shrink-0 rounded-full" aria-hidden />
                  ) : (
                    <PortalPanelCountBadge>{count}</PortalPanelCountBadge>
                  )
                ) : null}
                {count !== undefined && !countInline ? (
                  countSkeleton ? (
                    <Skeleton className="ml-auto h-5 w-12 rounded-full" aria-hidden />
                  ) : (
                    <PortalPanelCountBadge className="ml-auto">{count}</PortalPanelCountBadge>
                  )
                ) : null}
              </h3>
              {displaySubtitle ? (
                <p className="-mt-1 mb-3 text-xs text-sky-600/90">{displaySubtitle}</p>
              ) : null}
            </>
          ) : null}
          {children}
        </section>
      </CardContent>
    </Card>
  );
}
