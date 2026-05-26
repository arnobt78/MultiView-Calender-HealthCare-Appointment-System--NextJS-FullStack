"use client";

/**
 * Doctor portal — additional appointment types (pairs with Unavailable Dates in `lg:grid-cols-2`).
 */

import { useMemo } from "react";
import { Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { portalPanelCardClass } from "@/components/shared/PortalPanelSection";
import { PortalPanelSubsectionHeader } from "@/components/shared/PortalPanelSubsectionHeader";
import { DoctorAdditionalTypesEditor } from "@/components/shared/doctor-settings/DoctorAdditionalTypesEditor";
import { useAppointmentTypesForDoctor } from "@/hooks/useAppointmentTypes";
import { doctorSettingsGlassPanelShadowClass } from "@/lib/doctor-settings-glass-surfaces";
import { ADDITIONAL_APPOINTMENT_TYPES_TITLE } from "@/lib/doctor-portal-schedule-copy";
import { DOCTOR_PORTAL_VISIT_TYPE_COPY } from "@/lib/doctor-portal-visit-type-copy";
import type { DoctorAppointmentTypesQueryData } from "@/lib/doctor-portal-settings-prefetch";
import { cn } from "@/lib/utils";

type Props = {
  doctorId: string | undefined;
  portalLoading?: boolean;
  initialAppointmentTypes?: DoctorAppointmentTypesQueryData;
};

export function DoctorPortalAdditionalTypesCard({
  doctorId,
  portalLoading,
  initialAppointmentTypes,
}: Props) {
  const { data: typesData } = useAppointmentTypesForDoctor(doctorId, {
    initialData: initialAppointmentTypes,
  });
  const ownedTypeCount = useMemo(
    () => (typesData?.types ?? []).filter((t) => t.user_id === doctorId).length,
    [typesData?.types, doctorId]
  );
  const countSkeleton = Boolean(portalLoading || !doctorId);

  return (
    <Card
      id="dp-additional-types"
      className={cn(portalPanelCardClass, doctorSettingsGlassPanelShadowClass("emerald"))}
    >
      <CardContent className="p-4 text-gray-700 sm:p-6">
        {portalLoading || !doctorId ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <section aria-labelledby="dp-additional-types-heading">
            <PortalPanelSubsectionHeader
              id="dp-additional-types-heading"
              title={ADDITIONAL_APPOINTMENT_TYPES_TITLE}
              subtitle={DOCTOR_PORTAL_VISIT_TYPE_COPY.additionalTypesSubtitle}
              icon={Stethoscope}
              iconClassName="border-emerald-100 bg-emerald-50 [&_svg]:text-emerald-600"
              count={ownedTypeCount}
              countSkeleton={countSkeleton}
            />
            <DoctorAdditionalTypesEditor
              doctorId={doctorId}
              variant="portal"
              layout="collapsible"
              initialAppointmentTypes={initialAppointmentTypes}
            />
          </section>
        )}
      </CardContent>
    </Card>
  );
}
