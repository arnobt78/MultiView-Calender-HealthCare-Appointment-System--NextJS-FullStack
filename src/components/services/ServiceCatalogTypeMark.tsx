"use client";

import type { ServiceCatalogVisual } from "@/lib/service-catalog-visual";
import { AppointmentTypeBrandMark } from "@/components/shared/appointment-display/AppointmentTypeBrandMark";
import { cn } from "@/lib/utils";

type Props = {
  visual: ServiceCatalogVisual;
  className?: string;
};

/** Catalog card wrapper — resolves visual → shared light-tint brand mark. */
export function ServiceCatalogTypeMark({ visual, className }: Props) {
  return (
    <AppointmentTypeBrandMark
      icon={visual.iconName}
      color={visual.colorHex}
      size="catalog"
      className={cn(className)}
    />
  );
}
