"use client";

import type { ReactNode } from "react";
import { AppointmentCardMetaRow } from "@/components/shared/AppointmentCardMetaRow";
import { CategoryInlineLink } from "@/components/shared/CategoryInlineLink";
import { AppointmentTypeGlassBadge } from "@/components/shared/appointment-display/AppointmentTypeGlassBadge";
import { VisitFeeBadge } from "@/components/shared/billing/VisitFeeBadge";
import { Clock3, Tags } from "@/components/shared/appointment-card-icons";
import {
  formatAppointmentTypeDurationLabel,
  resolveAppointmentTypeDisplayName,
  resolveAppointmentTypeDurationMinutes,
  type AppointmentTypeDisplaySource,
} from "@/lib/appointment-type-display";
import { cn } from "@/lib/utils";

type CategoryProps = {
  categoryId: string;
  label: string;
  color?: string | null;
  icon?: string | null;
  wrapLabel?: boolean;
};

type Props = {
  /** Omit when only visit type / fee should show (no category FK). */
  category?: CategoryProps | null;
  appointment: AppointmentTypeDisplaySource;
  displayFeeCents?: number | null;
  showFeeEstimateHint?: boolean;
  timeRangeLabel?: string | null;
  wrap?: boolean;
  className?: string;
  icon?: ReactNode;
};

/**
 * One responsive row: category link (optional) + visit type + duration + fee (+ optional time).
 */
export function AppointmentCategoryTypeMetaRow({
  category,
  appointment,
  displayFeeCents,
  showFeeEstimateHint = false,
  timeRangeLabel,
  wrap = true,
  className,
  icon,
}: Props) {
  const typeName = resolveAppointmentTypeDisplayName(appointment);
  const durationLabel = formatAppointmentTypeDurationLabel(
    resolveAppointmentTypeDurationMinutes(appointment)
  );
  const feeCents = displayFeeCents ?? 0;
  const showFee = feeCents > 0;
  const hasCategory = Boolean(category?.categoryId && category?.label);
  const hasContent = hasCategory || Boolean(typeName) || showFee || Boolean(timeRangeLabel);

  if (!hasContent) return null;

  const rowLabel = hasCategory ? "Category:" : "Visit type:";

  return (
    <AppointmentCardMetaRow
      icon={icon ?? <Tags className="h-3.5 w-3.5" />}
      label={rowLabel}
      wrap={wrap}
      className={cn("flex w-full min-w-0 items-center", className)}
    >
      <span className="inline-flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        {hasCategory && category ? (
          <CategoryInlineLink
            categoryId={category.categoryId}
            label={category.label}
            color={category.color}
            icon={category.icon}
            wrapLabel={category.wrapLabel ?? wrap}
            className="inline-flex items-center"
          />
        ) : null}
        {typeName ? (
          <AppointmentTypeGlassBadge name={typeName} durationLabel={durationLabel} />
        ) : null}
        {timeRangeLabel ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600">
            <Clock3 className="h-3 w-3 shrink-0 text-gray-400" aria-hidden />
            {timeRangeLabel}
          </span>
        ) : null}
        {showFee ? (
          <VisitFeeBadge
            size="cardMeta"
            priceCents={feeCents}
            showEstimateHint={showFeeEstimateHint}
          />
        ) : null}
      </span>
    </AppointmentCardMetaRow>
  );
}
