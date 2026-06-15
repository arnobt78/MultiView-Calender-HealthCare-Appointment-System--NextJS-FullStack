"use client";

import { CategoryInlineLink } from "@/components/shared/CategoryInlineLink";
import { DashboardDoctorIdentityInline } from "@/components/control-panel/dashboard/DashboardDoctorIdentityInline";
import type {
  TelehealthQueueCategory,
} from "@/lib/telehealth-queue-display";
import type { DashboardOverviewQueueDoctor } from "@/lib/dashboard-overview-queue";
import { cn } from "@/lib/utils";

type Props = {
  doctor: DashboardOverviewQueueDoctor | null;
  category: TelehealthQueueCategory | null;
  /** `stacked` = Up Next hero; `inline` = schedule list row (doctor + category same line). */
  layout?: "stacked" | "inline";
  className?: string;
};

/**
 * Treating physician + appointment category — stacked (Up Next) or inline (schedule list).
 */
export function TelehealthQueueDoctorCategoryBlock({
  doctor,
  category,
  layout = "stacked",
  className,
}: Props) {
  if (!doctor && !category) return null;

  const inline = layout === "inline";

  return (
    <div
      className={cn(
        "min-w-0",
        inline
          ? "flex flex-wrap items-center gap-x-3 gap-y-1"
          : "space-y-1.5",
        className
      )}
    >
      {doctor ? <DashboardDoctorIdentityInline doctor={doctor} /> : null}
      {category ? (
        <CategoryInlineLink
          categoryId={category.id}
          label={category.label}
          color={category.color}
          icon={category.icon}
          markSize="compact"
          wrapLabel
        />
      ) : null}
    </div>
  );
}
