"use client";

/**
 * SSR fallback when portal prefetch fails — real panel chrome; only bodies pulse (CP-style).
 */

import { Skeleton } from "@/components/ui/skeleton";
import { PortalPanelSection } from "@/components/shared/PortalPanelSection";
import { PortalPanelSubsectionHeader } from "@/components/shared/PortalPanelSubsectionHeader";
import { PortalDoctorChromeHeader } from "@/components/shared/PortalDoctorChromeHeader";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import {
  doctorPortalBillingPanelClass,
  doctorPortalPatientsPanelClass,
  doctorPortalPanelPairGridClass,
} from "@/lib/doctor-portal-layout";
import { DOCTOR_PORTAL_PATIENTS_SUBTITLE } from "@/lib/doctor-portal-patients-display";
import { appPortalSectionRootClass } from "@/lib/section-page-layout";
import { doctorSettingsGlassPanelShadowClass } from "@/lib/doctor-settings-glass-surfaces";
import { GLOBAL_APPOINTMENT_TYPES_TITLE } from "@/lib/doctor-portal-schedule-copy";
import { DOCTOR_PORTAL_VISIT_TYPE_COPY } from "@/lib/doctor-portal-visit-type-copy";
import { ADDITIONAL_APPOINTMENT_TYPES_TITLE } from "@/lib/doctor-portal-schedule-copy";
import {
  Calendar,
  CalendarCheck,
  CalendarClock,
  Clock,
  Layers,
  Receipt,
  Stethoscope,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { portalPanelCardClass } from "@/components/shared/PortalPanelSection";

function ListBodyPulse({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-2xl" aria-hidden />
      ))}
    </div>
  );
}

export function DoctorPortalPageSkeleton() {
  return (
    <div className={appPortalSectionRootClass} aria-busy="true" aria-label="Loading doctor portal">
      <PortalDoctorChromeHeader doctor={undefined} profileLoading />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <PatientStatCard
          variant="sky"
          icon={Calendar}
          title="Today"
          subtitle="Appointments scheduled today"
          value={0}
          valueSkeleton
        />
        <PatientStatCard
          variant="violet"
          icon={CalendarClock}
          title="This Week"
          subtitle="Mon–Sun window"
          value={0}
          valueSkeleton
        />
        <PatientStatCard
          variant="emerald"
          icon={CalendarCheck}
          title="This Month"
          subtitle="Calendar month total"
          value={0}
          valueSkeleton
        />
        <PatientStatCard
          variant="amber"
          icon={Clock}
          title="Pending"
          subtitle="Awaiting completion"
          value={0}
          valueSkeleton
        />
      </div>

      <div className={doctorPortalPanelPairGridClass}>
        <PortalPanelSection
          title="Today's Schedule"
          icon={Calendar}
          iconClassName="border-blue-100 bg-blue-50 [&_svg]:text-blue-500"
          countSkeleton
          countInline
        >
          <ListBodyPulse rows={3} />
        </PortalPanelSection>
        <PortalPanelSection
          title="Upcoming Appointments"
          icon={CalendarClock}
          iconClassName="border-indigo-100 bg-indigo-50 [&_svg]:text-indigo-600"
          countSkeleton
          countInline
        >
          <ListBodyPulse rows={4} />
        </PortalPanelSection>
      </div>

      <div className={doctorPortalPanelPairGridClass}>
        <Card className={portalPanelCardClass}>
          <CardContent className="p-4">
            <Skeleton className="mb-3 h-10 w-full rounded-xl" aria-hidden />
            <ListBodyPulse rows={2} />
          </CardContent>
        </Card>
        <PortalPanelSection
          title={GLOBAL_APPOINTMENT_TYPES_TITLE}
          subtitle={DOCTOR_PORTAL_VISIT_TYPE_COPY.patientTypesSubtitle}
          headerVariant="stacked"
          icon={Layers}
          iconClassName="border-violet-100 bg-violet-50 [&_svg]:text-violet-600"
          countSkeleton
          className={doctorSettingsGlassPanelShadowClass("violet")}
        >
          <ListBodyPulse rows={4} />
        </PortalPanelSection>
      </div>

      <div className={doctorPortalPanelPairGridClass}>
        <Card className={portalPanelCardClass}>
          <CardContent className="p-4">
            <Skeleton className="mb-3 h-10 w-full rounded-xl" aria-hidden />
            <ListBodyPulse rows={2} />
          </CardContent>
        </Card>
        <Card
          className={`${portalPanelCardClass} ${doctorSettingsGlassPanelShadowClass("emerald")}`}
        >
          <CardContent className="p-4">
            <PortalPanelSubsectionHeader
              title={ADDITIONAL_APPOINTMENT_TYPES_TITLE}
              subtitle={DOCTOR_PORTAL_VISIT_TYPE_COPY.additionalTypesSubtitle}
              icon={Stethoscope}
              iconClassName="border-emerald-100 bg-emerald-50 [&_svg]:text-emerald-600"
              countSkeleton
            />
            <ListBodyPulse rows={2} />
          </CardContent>
        </Card>
      </div>

      <PortalPanelSection
        title="Related Billing"
        subtitle="Invoices for visits you own or treat — counts by payment status"
        headerVariant="stacked"
        icon={Receipt}
        iconClassName="border-sky-100 bg-sky-50 [&_svg]:text-sky-600"
        countSkeleton
        statusChipSkeleton
        className={doctorPortalBillingPanelClass}
      >
        <Skeleton className="mb-3 h-10 w-full rounded-xl" aria-hidden />
        <ListBodyPulse rows={3} />
      </PortalPanelSection>

      <PortalPanelSection
        id="dp-my-patients"
        title="Related Patients"
        subtitle={DOCTOR_PORTAL_PATIENTS_SUBTITLE}
        headerVariant="stacked"
        icon={Users}
        iconClassName="border-emerald-100 bg-emerald-50 [&_svg]:text-emerald-600"
        countSkeleton
        statusChipSkeleton
        className={doctorPortalPatientsPanelClass}
        contentClassName="pt-0"
      >
        <Skeleton className="mb-3 h-10 w-full rounded-xl" aria-hidden />
        <ListBodyPulse rows={4} />
      </PortalPanelSection>
    </div>
  );
}
