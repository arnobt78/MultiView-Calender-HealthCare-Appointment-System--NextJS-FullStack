"use client";

import { Clock, Layers, Stethoscope, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ServiceCatalogRow } from "@/lib/appointment-service-catalog";
import { ServiceCatalogDoctorOffers } from "@/components/services/ServiceCatalogDoctorOffers";

type Props = {
  service: ServiceCatalogRow;
};

/** Single row in `/services` Appointment Services — global or deduped additional type. */
export function ServiceCatalogCard({ service }: Props) {
  const isGlobal = service.source === "global";
  const subtitle =
    service.description?.trim() ||
    (isGlobal
      ? null
      : `Custom visit · ${service.duration_minutes} min · slot step ${service.slot_interval_minutes} min`);

  return (
    <Card className="rounded-[16px] border bg-card shadow-[0_4px_16px_rgba(139,92,246,0.08)] hover:shadow-[0_8px_24px_rgba(139,92,246,0.16)] transition-all duration-300">
      <CardContent className="p-4 flex items-start gap-2">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 border ${
            isGlobal
              ? "bg-violet-100 border-violet-200"
              : "bg-emerald-50 border-emerald-200"
          }`}
        >
          {service.is_telehealth ? (
            <Video className="h-5 w-5 text-sky-600" aria-hidden />
          ) : isGlobal ? (
            <Layers className="h-5 w-5 text-violet-600" aria-hidden />
          ) : (
            <Stethoscope className="h-5 w-5 text-emerald-600" aria-hidden />
          )}
        </span>
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
          <div className="flex items-center gap-1.5 mt-1.5">
            <Badge variant="outline" className="text-[10px] py-0 bg-violet-50 text-violet-700 border-violet-200">
              <Clock className="h-2.5 w-2.5 mr-0.5" aria-hidden />
              {service.duration_minutes} min
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
