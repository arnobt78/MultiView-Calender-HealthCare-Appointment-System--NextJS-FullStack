"use client";

/**
 * DoctorPortalPage — client-side portal for authenticated doctors.
 *
 * Layout (responsive `lg:grid-cols-2` pairs, stack on mobile):
 * chrome → stats → [Today | Upcoming] → [Weekly hours | Patient visit types] →
 * [Unavailable dates | Additional types] (`lg:2-col`) → My Patients (full width).
 *
 * Settings reuse CP APIs via `src/components/shared/doctor-settings/*` with `variant="portal"`.
 * Cache: SSR seeds `doctorPortal.all`, `patients.all`, and schedule/type query keys via `initialScheduleSettings`.
 */

import { useState, useLayoutEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Invoice } from "@/hooks/usePayments";
import { apiClient } from "@/lib/api-client";
import type { DoctorPortalData } from "@/types/types";
import type { DoctorPortalSettingsPrefetch } from "@/lib/doctor-portal-settings-prefetch";
import {
  prefetchDoctorScheduleSettings,
  seedDoctorPortalSettingsCache,
} from "@/lib/prefetch-doctor-schedule";
import { Skeleton } from "@/components/ui/skeleton";
import { appPortalSectionRootClass } from "@/lib/section-page-layout";
import { PortalDoctorChromeHeader } from "@/components/shared/PortalDoctorChromeHeader";
import { PortalPanelSection } from "@/components/shared/PortalPanelSection";
import { DoctorPortalStatsRow } from "@/components/doctor-portal/DoctorPortalStatsRow";
import { DoctorPortalInvoicesCard } from "@/components/doctor-portal/DoctorPortalInvoicesCard";
import { PatientManagementInner } from "@/components/control-panel/PatientManagement";
import { PatientListFiltersProvider } from "@/components/control-panel/PatientListFiltersContext";
import { DoctorPortalAppointmentListRow } from "@/components/shared/appointments/DoctorPortalAppointmentListRow";
import {
  DoctorPortalWeeklyHoursCard,
  DoctorPortalTimeOffCard,
  DoctorPortalAdditionalTypesCard,
  DoctorGlobalVisitTypesEditor,
} from "@/components/shared/doctor-settings";
import { useAppointmentTypesForDoctor } from "@/hooks/useAppointmentTypes";
import { doctorSettingsGlassPanelShadowClass } from "@/lib/doctor-settings-glass-surfaces";
import { GLOBAL_APPOINTMENT_TYPES_TITLE } from "@/lib/doctor-portal-schedule-copy";
import { DOCTOR_PORTAL_VISIT_TYPE_COPY } from "@/lib/doctor-portal-visit-type-copy";
import {
  Calendar,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Layers,
  Users,
} from "lucide-react";

/** Two-column portal rows — single column below `lg` for readability on narrow viewports. */
const portalPanelPairGridClass = "grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6";

interface DoctorPortalPageProps {
  initialData: DoctorPortalData | null;
  /** SSR mirror of availability + time off + appointment-types?doctorId= — avoids settings skeleton on refresh. */
  initialScheduleSettings: DoctorPortalSettingsPrefetch | null;
  /** SSR seed for doctor-scoped invoices (queryKeys.invoices.all). */
  initialInvoices?: Invoice[];
}

export default function DoctorPortalPage({
  initialData,
  initialScheduleSettings,
  initialInvoices = [],
}: DoctorPortalPageProps) {
  const queryClient = useQueryClient();
  const [patientSectionCount, setPatientSectionCount] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (initialData != null) {
      queryClient.setQueryData(queryKeys.doctorPortal.all, initialData);
    }
    queryClient.setQueryData(queryKeys.patients.all, initialData?.patients ?? []);
    const doctorId = initialData?.doctor?.id;
    if (doctorId && initialScheduleSettings) {
      seedDoctorPortalSettingsCache(queryClient, doctorId, initialScheduleSettings);
    } else if (doctorId) {
      prefetchDoctorScheduleSettings(queryClient, doctorId);
    }
    if (initialInvoices.length > 0) {
      queryClient.setQueryData(queryKeys.invoices.all, initialInvoices);
    }
  }, [queryClient, initialData, initialScheduleSettings, initialInvoices]);

  const { data, isLoading } = useQuery<DoctorPortalData | undefined>({
    queryKey: queryKeys.doctorPortal.all,
    queryFn: () => apiClient<DoctorPortalData>("/api/doctor-portal"),
    initialData: initialData ?? undefined,
    staleTime: 3 * 60 * 1000,
  });

  const portalLoading = isLoading && !data;
  const profileLoading = portalLoading || !data?.doctor;
  const doctorId = data?.doctor?.id;

  const { data: doctorTypesCatalog } = useAppointmentTypesForDoctor(doctorId, {
    initialData: initialScheduleSettings?.appointmentTypes,
  });
  const globalVisitTypeCount = useMemo(
    () => (doctorTypesCatalog?.types ?? []).filter((t) => t.user_id === null).length,
    [doctorTypesCatalog?.types]
  );

  const todayAppts = data?.todayAppointments ?? [];
  const upcomingAppts = data?.upcomingAppointments ?? [];

  const sortedToday = [...todayAppts].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const todayCountLabel =
    portalLoading ? undefined : `${sortedToday.length} appointments`;

  const upcomingCountLabel = portalLoading ? undefined : String(upcomingAppts.length);

  const patientCountLabel =
    portalLoading
      ? undefined
      : patientSectionCount != null
        ? `${patientSectionCount} total`
        : data?.patients?.length != null
          ? `${data.patients.length} total`
          : "0 total";

  return (
    <div className={appPortalSectionRootClass}>
      <PortalDoctorChromeHeader
        doctor={
          data?.doctor
            ? {
              id: data.doctor.id,
              email: data.doctor.email,
              display_name: data.doctor.display_name,
              image: data.doctor.image,
              specialty: data.doctor.specialty,
            }
            : undefined
        }
        profileLoading={profileLoading}
      />

      <DoctorPortalStatsRow metrics={data?.metrics} valueSkeleton={portalLoading} />

      <div className={portalPanelPairGridClass}>
        <PortalPanelSection
          id="dp-today-schedule"
          title="Today's Schedule"
          icon={Calendar}
          iconClassName="border-blue-100 bg-blue-50 [&_svg]:text-blue-500"
          count={todayCountLabel}
          countInline
          countSkeleton={portalLoading}
          contentClassName="pb-2"
        >
          {portalLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-2 py-3">
                  <Skeleton className="h-10 w-16 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedToday.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-400" />
              <p className="text-sm">No appointments today</p>
            </div>
          ) : (
            <div>
              {sortedToday.map((appt) => (
                <DoctorPortalAppointmentListRow key={appt.id} appt={appt} variant="today" />
              ))}
            </div>
          )}
        </PortalPanelSection>

        <PortalPanelSection
          id="dp-upcoming"
          title="Upcoming Appointments"
          icon={CalendarClock}
          iconClassName="border-indigo-100 bg-indigo-50 [&_svg]:text-indigo-600"
          count={upcomingCountLabel}
          countInline
          countSkeleton={portalLoading}
          contentClassName="pb-2"
        >
          {portalLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-2 py-3">
                  <Skeleton className="h-10 w-20 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <CalendarCheck className="mb-2 h-8 w-8 text-emerald-400" />
              <p className="text-sm">No upcoming appointments</p>
            </div>
          ) : (
            <div>
              {upcomingAppts.map((appt) => (
                <DoctorPortalAppointmentListRow key={appt.id} appt={appt} variant="upcoming" />
              ))}
            </div>
          )}
        </PortalPanelSection>
      </div>

      <div className={portalPanelPairGridClass}>
        <DoctorPortalWeeklyHoursCard
          doctorId={doctorId}
          portalLoading={portalLoading}
          initialAvailability={initialScheduleSettings?.availability}
        />

        <PortalPanelSection
          id="dp-global-visit-types"
          title={GLOBAL_APPOINTMENT_TYPES_TITLE}
          subtitle={DOCTOR_PORTAL_VISIT_TYPE_COPY.patientTypesSubtitle}
          headerVariant="stacked"
          icon={Layers}
          iconClassName="border-violet-100 bg-violet-50 [&_svg]:text-violet-600"
          count={globalVisitTypeCount}
          countSkeleton={portalLoading || !doctorId}
          className={doctorSettingsGlassPanelShadowClass("violet")}
        >
          {doctorId ? (
            <DoctorGlobalVisitTypesEditor
              doctorId={doctorId}
              variant="portal"
              initialAppointmentTypes={initialScheduleSettings?.appointmentTypes}
            />
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-2xl" />
              ))}
            </div>
          )}
        </PortalPanelSection>
      </div>

      <div className={portalPanelPairGridClass}>
        <DoctorPortalTimeOffCard
          doctorId={doctorId}
          portalLoading={portalLoading}
          initialTimeOff={initialScheduleSettings?.timeOff}
        />
        <DoctorPortalAdditionalTypesCard
          doctorId={doctorId}
          portalLoading={portalLoading}
          initialAppointmentTypes={initialScheduleSettings?.appointmentTypes}
        />
      </div>

      <DoctorPortalInvoicesCard listBodyLoading={portalLoading} />

      {doctorId ? (
        <PortalPanelSection
          id="dp-my-patients"
          title="My Patients"
          icon={Users}
          iconClassName="border-emerald-100 bg-emerald-50 [&_svg]:text-emerald-600"
          count={patientCountLabel}
          countInline
          countSkeleton={portalLoading}
          contentClassName="pt-0"
        >
          <PatientListFiltersProvider
            initialPrimaryDoctorId={doctorId}
            lockPrimaryDoctor
          >
            <PatientManagementInner
              variant="doctor-portal"
              viewerRole="doctor"
              lockedPrimaryDoctorId={doctorId}
              onFilteredCountChange={setPatientSectionCount}
            />
          </PatientListFiltersProvider>
        </PortalPanelSection>
      ) : null}
    </div>
  );
}
