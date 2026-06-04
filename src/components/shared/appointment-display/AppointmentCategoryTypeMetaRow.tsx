"use client";

import type { ReactNode } from "react";
import { AppointmentCardMetaRow } from "@/components/shared/AppointmentCardMetaRow";
import { CategoryInlineLink } from "@/components/shared/CategoryInlineLink";
import { AppointmentTypeGlassBadge } from "@/components/shared/appointment-display/AppointmentTypeGlassBadge";
import { Clock3, Euro, Tags } from "@/components/shared/appointment-card-icons";
import {
  formatAppointmentTypeDurationLabel,
  resolveAppointmentTypeDisplayName,
  resolveAppointmentTypeDurationMinutes,
  type AppointmentTypeDisplaySource,
} from "@/lib/appointment-type-display";
import { formatVisitFeeEurLabel } from "@/lib/appointment-visit-fee-display";
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
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
            <Euro className="h-3 w-3 shrink-0" aria-hidden />
            {formatVisitFeeEurLabel(feeCents)}
            {showFeeEstimateHint ? (
              <span className="ml-0.5 text-[9px] font-normal text-emerald-500/90">· est.</span>
            ) : null}
          </span>
        ) : null}
      </span>
    </AppointmentCardMetaRow>
  );
}
