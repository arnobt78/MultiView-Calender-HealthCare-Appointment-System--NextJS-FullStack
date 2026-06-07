"use client";

import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatAppointmentTypeChipMeta } from "@/lib/appointment-type-scheduling-meta";
import type { ServiceCatalogRow } from "@/lib/appointment-service-catalog";
import { serviceCatalogCardClass } from "@/lib/service-catalog-card-ui-classes";
import { resolveServiceCatalogVisual } from "@/lib/service-catalog-visual";
import { ServiceCatalogDoctorOffers } from "@/components/services/ServiceCatalogDoctorOffers";
import { ServiceCatalogTypeMark } from "@/components/services/ServiceCatalogTypeMark";
import { VisitFeeBadge } from "@/components/shared/billing/VisitFeeBadge";

type Props = {
  service: ServiceCatalogRow;
};

/** Single row in `/services` Appointment Services — per-type icon/color + hue-matched glow. */
export function ServiceCatalogCard({ service }: Props) {
  const isGlobal = service.source === "global";
  const visual = resolveServiceCatalogVisual(service);
  const schedulingMeta = formatAppointmentTypeChipMeta({
    duration_minutes: service.duration_minutes,
    buffer_before_minutes: service.buffer_before_minutes,
    buffer_after_minutes: service.buffer_after_minutes,
    slot_interval_minutes: service.slot_interval_minutes,
    is_global: isGlobal,
  });
  const subtitle =
    service.description?.trim() ||
    (isGlobal ? schedulingMeta : `${schedulingMeta}`);

  return (
    <Card className={serviceCatalogCardClass(visual.glowVariant)}>
      <CardContent className="p-4 flex items-start gap-3">
        <ServiceCatalogTypeMark visual={visual} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold text-sm leading-tight text-gray-700">{service.name}</p>
            <Badge
              variant="outline"
              className={`text-[10px] py-0 ${
                isGlobal
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              {isGlobal ? "Global" : "Additional"}
            </Badge>
          </div>
          {subtitle ? (
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{subtitle}</p>
          ) : null}
          {!isGlobal && service.doctor_offers?.length ? (
            <ServiceCatalogDoctorOffers offers={service.doctor_offers} />
          ) : null}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <Badge variant="outline" className="text-[10px] py-0 bg-violet-50 text-violet-700 border-violet-200">
              <Clock className="h-2.5 w-2.5 mr-0.5" aria-hidden />
              {service.duration_minutes} min
            </Badge>
            <VisitFeeBadge size="services" priceCents={service.price_cents} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
