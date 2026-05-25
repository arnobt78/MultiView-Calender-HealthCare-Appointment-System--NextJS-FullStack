"use client";

/**
 * DoctorPortalPage — client-side portal for authenticated doctors.
 *
 * Layout: portal doctor chrome → metric stat row → schedule / visit types panels →
 * scoped patient table (CP `PatientManagement` variant) → upcoming appointments.
 *
 * Cache: `useLayoutEffect` seeds `queryKeys.doctorPortal.all` and always seeds
 * `queryKeys.patients.all` (roster array, may be empty) from SSR before first paint.
 * Inline skeleton — chrome and section titles
 * stay mounted; only data slots pulse (`portalLoading = isLoading && !data`).
 */

import { useState, useLayoutEffect } from "react";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isPast, parseISO } from "date-fns";
import { queryKeys } from "@/lib/query-keys";
import {
  invalidateAppointmentTypeDerived,
} from "@/lib/query-client";
import { apiClient, handleApiError } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import type { DoctorPortalData, AppointmentType, Appointment } from "@/types/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { PortalDoctorChromeHeader } from "@/components/shared/PortalDoctorChromeHeader";
import { PortalPanelSection } from "@/components/shared/PortalPanelSection";
import { DoctorPortalStatsRow } from "@/components/doctor-portal/DoctorPortalStatsRow";
import { PatientManagementInner } from "@/components/control-panel/PatientManagement";
import { PatientListFiltersProvider } from "@/components/control-panel/PatientListFiltersContext";
import {
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Users,
  Video,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_META: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
  done: {
    cls: "calendar-glass-badge-emerald",
    icon: <CalendarCheck className="h-3 w-3" />,
    label: "Done",
  },
  pending: {
    cls: "calendar-glass-badge-amber",
    icon: <CalendarClock className="h-3 w-3" />,
    label: "Pending",
  },
  alert: {
    cls: "calendar-glass-badge-rose",
    icon: <CalendarX className="h-3 w-3" />,
    label: "Alert",
  },
};

function AppointmentRow({ appt }: { appt: Appointment }) {
  const start = parseISO(appt.start);
  const end = parseISO(appt.end);
  const meta = STATUS_META[appt.status ?? "pending"] ?? STATUS_META.pending;
  const overdue = isPast(end) && appt.status !== "done";

  return (
    <div className="flex items-start gap-2 border-b border-border/40 py-3 last:border-0">
      <div className="w-16 flex-shrink-0 text-right">
        <p className="text-xs font-semibold text-foreground">{format(start, "HH:mm")}</p>
        <p className="text-[10px] text-muted-foreground">{format(end, "HH:mm")}</p>
      </div>
      <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary/60" />
      <div className="min-w-0 flex-1">
        <RoleEntityLink
          kind="appointment"
          id={appt.id}
          label={appt.title}
          className="block truncate text-sm font-medium"
        />
        {appt.location ? (
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {appt.location}
          </p>
        ) : null}
        {appt.chief_complaint ? (
          <p className="truncate text-[11px] text-muted-foreground">{appt.chief_complaint}</p>
        ) : null}
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
            meta.cls
          )}
        >
          {meta.icon}
          {meta.label}
        </span>
        {appt.is_telehealth ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-200/60 bg-sky-100/80 px-2 py-0.5 text-[10px] font-medium text-sky-700">
            <Video className="h-3 w-3" />
            Telehealth
          </span>
        ) : null}
        {overdue ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-red-200/60 bg-red-100/80 px-2 py-0.5 text-[10px] font-medium text-red-700">
            <AlertCircle className="h-3 w-3" />
            Overdue
          </span>
        ) : null}
      </div>
    </div>
  );
}

interface TypeToggleProps {
  type: AppointmentType;
  isEnabled: boolean;
  isPending: boolean;
  onToggle: (typeId: string, enabled: boolean) => void;
}

function TypeToggle({ type, isEnabled, isPending, onToggle }: TypeToggleProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl border p-3 transition-colors",
        isEnabled ? "border-primary/20 bg-primary/5" : "border-border/40 bg-muted/30 opacity-70"
      )}
    >
      <input
        id={`type-${type.id}`}
        type="checkbox"
        checked={isEnabled}
        disabled={isPending}
        onChange={(e) => onToggle(type.id, e.target.checked)}
        className="h-4 w-4 flex-shrink-0 cursor-pointer rounded accent-primary"
      />
      <Label htmlFor={`type-${type.id}`} className="min-w-0 flex-1 cursor-pointer">
        <span className="block truncate text-sm font-medium">{type.name}</span>
        <span className="text-[11px] text-muted-foreground">
          {type.duration_minutes} min
          {type.is_telehealth ? " · Telehealth" : ""}
        </span>
      </Label>
      {type.is_telehealth ? <Video className="h-3.5 w-3.5 flex-shrink-0 text-sky-500" /> : null}
    </div>
  );
}

interface DoctorPortalPageProps {
  initialData: DoctorPortalData | null;
}

export default function DoctorPortalPage({ initialData }: DoctorPortalPageProps) {
  const queryClient = useQueryClient();
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [patientSectionCount, setPatientSectionCount] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (initialData != null) {
      queryClient.setQueryData(queryKeys.doctorPortal.all, initialData);
    }
    // Always seed roster cache (including []) so doctor-portal patient table avoids a loading flash.
    queryClient.setQueryData(queryKeys.patients.all, initialData?.patients ?? []);
  }, [queryClient, initialData]);

  const { data, isLoading } = useQuery<DoctorPortalData | undefined>({
    queryKey: queryKeys.doctorPortal.all,
    queryFn: () => apiClient<DoctorPortalData>("/api/doctor-portal"),
    initialData: initialData ?? undefined,
    staleTime: 3 * 60 * 1000,
  });

  const portalLoading = isLoading && !data;
  const profileLoading = portalLoading || !data?.doctor;

  const toggleMutation = useMutation({
    mutationFn: (vars: { doctor_id: string; appointment_type_id: string; is_enabled: boolean }) =>
      apiClient("/api/appointment-types/doctor-config", {
        method: "POST",
        body: JSON.stringify(vars),
      }),
    onSuccess: async () => {
      await invalidateAppointmentTypeDerived(queryClient);
    },
    onError: (e) => handleApiError(e, "Failed to update type setting"),
  });

  async function handleToggle(typeId: string, enabled: boolean) {
    if (!data?.doctor?.id) return;
    setTogglingIds((prev) => new Set(prev).add(typeId));
    try {
      await toggleMutation.mutateAsync({
        doctor_id: data.doctor.id,
        appointment_type_id: typeId,
        is_enabled: enabled,
      });
      notify.crud({
        action: enabled ? "created" : "deleted",
        entity: "Visit type",
        detail: enabled ? "Enabled for your patients." : "Disabled for new bookings.",
      });
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(typeId);
        return next;
      });
    }
  }

  const doctor = data?.doctor;
  const todayAppts = data?.todayAppointments ?? [];
  const upcomingAppts = data?.upcomingAppointments ?? [];
  const allTypes = data?.allGlobalTypes ?? [];

  const isTypeEnabled = (typeId: string) => {
    const cfg = data?.typeConfigs.find((c) => c.appointment_type_id === typeId);
    return cfg ? cfg.is_enabled : true;
  };

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
    <div className="space-y-4 text-gray-700">
      <PortalDoctorChromeHeader
        doctor={
          doctor
            ? {
                id: doctor.id,
                email: doctor.email,
                display_name: doctor.display_name,
                image: doctor.image,
                specialty: doctor.specialty,
              }
            : undefined
        }
        profileLoading={profileLoading}
      />

      <DoctorPortalStatsRow metrics={data?.metrics} valueSkeleton={portalLoading} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <PortalPanelSection
          id="dp-today-schedule"
          title="Today's Schedule"
          icon={Calendar}
          iconClassName="border-blue-100 bg-blue-50 [&_svg]:text-blue-500"
          count={todayCountLabel}
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
            <div>{sortedToday.map((appt) => <AppointmentRow key={appt.id} appt={appt} />)}</div>
          )}
        </PortalPanelSection>

        <PortalPanelSection
          id="dp-visit-types"
          title="Visit Types"
          subtitle="Toggle what patients can book"
          icon={Layers}
          iconClassName="border-purple-100 bg-purple-50 [&_svg]:text-purple-500"
        >
          {portalLoading ? (
            <div className="grid grid-cols-1 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-2xl" />
              ))}
            </div>
          ) : allTypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Layers className="mb-2 h-8 w-8 opacity-40" />
              <p className="text-sm">No global visit types configured</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {allTypes.map((type) => (
                <TypeToggle
                  key={type.id}
                  type={type}
                  isEnabled={isTypeEnabled(type.id)}
                  isPending={togglingIds.has(type.id)}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          )}
        </PortalPanelSection>
      </div>

      {doctor?.id ? (
        <PortalPanelSection
          id="dp-my-patients"
          title="My Patients"
          icon={Users}
          iconClassName="border-emerald-100 bg-emerald-50 [&_svg]:text-emerald-600"
          count={patientCountLabel}
          countSkeleton={portalLoading}
          contentClassName="pt-0"
        >
          <PatientListFiltersProvider
            initialPrimaryDoctorId={doctor.id}
            lockPrimaryDoctor
          >
            <PatientManagementInner
              variant="doctor-portal"
              viewerRole="doctor"
              lockedPrimaryDoctorId={doctor.id}
              onFilteredCountChange={setPatientSectionCount}
            />
          </PatientListFiltersProvider>
        </PortalPanelSection>
      ) : null}

      <PortalPanelSection
        id="dp-upcoming"
        title="Upcoming Appointments"
        icon={CalendarClock}
        iconClassName="border-indigo-100 bg-indigo-50 [&_svg]:text-indigo-500"
        count={upcomingCountLabel}
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
            {upcomingAppts.map((appt) => {
              const start = parseISO(appt.start);
              const apptIsToday = isToday(start);
              return (
                <div
                  key={appt.id}
                  className="flex items-start gap-2 border-b border-border/40 py-3 last:border-0"
                >
                  <div className="w-20 flex-shrink-0 text-right">
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {apptIsToday ? "Today" : format(start, "EEE, MMM d")}
                    </p>
                    <p className="text-xs font-semibold">{format(start, "HH:mm")}</p>
                  </div>
                  <div className="h-2 w-2 flex-shrink-0 rounded-full bg-indigo-400/60" />
                  <div className="min-w-0 flex-1">
                    <RoleEntityLink
                      kind="appointment"
                      id={appt.id}
                      label={appt.title}
                      className="block truncate text-sm font-medium"
                    />
                    {appt.chief_complaint ? (
                      <p className="truncate text-[11px] text-muted-foreground">
                        {appt.chief_complaint}
                      </p>
                    ) : null}
                  </div>
                  {appt.is_telehealth ? (
                    <span className="flex flex-shrink-0 items-center gap-1 rounded-full border border-sky-200/60 bg-sky-100/80 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                      <Video className="h-3 w-3" />
                      Telehealth
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </PortalPanelSection>
    </div>
  );
}
