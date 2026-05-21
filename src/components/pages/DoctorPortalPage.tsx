"use client";

/**
 * DoctorPortalPage — client-side portal for authenticated doctors.
 *
 * Sections:
 *   1. Header — avatar, name, specialty, quick-stats row (today / week / month / pending)
 *   2. Today's Schedule — timeline list sorted by start time
 *   3. Appointment Types Manager — checkbox grid calling POST /api/appointment-types/doctor-config
 *   4. My Patients — compact table of patients where primary_doctor_id = doctor
 *   5. Upcoming Appointments — next appointments beyond today
 *
 * Cache seeding: useLayoutEffect sets queryKeys.doctorPortal.all from SSR initialData before
 * first paint, so the useQuery below finds data immediately with no loading flash.
 *
 * Invalidation: type-config toggles call invalidateAppointmentTypeDerived + invalidateDoctorPortal
 * so slot pickers and the portal header metrics update without navigation.
 * Shared appointment / activity flows also call `invalidateDoctorPortal` from `src/lib/query-client.ts`.
 *
 * Date strings: `date-fns` v4 provides `parseISO` typings natively; do not add `@types/date-fns` (TS2305 risk).
 */

import { useState, useLayoutEffect } from "react";
import Link from "next/link";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isPast, parseISO } from "date-fns";
import { queryKeys } from "@/lib/query-keys";
import {
  invalidateAppointmentTypeDerived,
  invalidateDoctorPortal,
} from "@/lib/query-client";
import { apiClient, handleApiError } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import type { DoctorPortalData, AppointmentType, Patient, Appointment } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Stethoscope,
  Users,
  Video,
  AlertCircle,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Glass card variants (matches AnalyticsPage / DashboardOverview style)
// ---------------------------------------------------------------------------

const GLASS: Record<string, string> = {
  blue: "rounded-[28px] border border-blue-400/20 bg-gradient-to-br from-blue-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(59,130,246,0.12)]",
  indigo: "rounded-[28px] border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(99,102,241,0.12)]",
  green: "rounded-[28px] border border-green-400/20 bg-gradient-to-br from-green-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(34,197,94,0.12)]",
  amber: "rounded-[28px] border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(245,158,11,0.12)]",
  purple: "rounded-[28px] border border-purple-400/20 bg-gradient-to-br from-purple-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(168,85,247,0.12)]",
  slate: "rounded-[28px] border border-slate-400/20 bg-gradient-to-br from-slate-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(100,116,139,0.1)]",
};

// ---------------------------------------------------------------------------
// Status badge meta
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
  color: string;
  isLoading: boolean;
}

function StatCard({ label, value, icon, color, isLoading }: StatCardProps) {
  return (
    <div className={cn("p-5 flex items-center gap-4", GLASS[color])}>
      <div className="flex-shrink-0 rounded-2xl bg-white/60 p-3 shadow-sm">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {isLoading ? (
          <Skeleton className="mt-1 h-7 w-12" />
        ) : (
          <p className="text-2xl font-bold tracking-tight">{value ?? 0}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Appointment row
// ---------------------------------------------------------------------------

function AppointmentRow({ appt }: { appt: Appointment }) {
  const start = parseISO(appt.start);
  const end = parseISO(appt.end);
  const meta = STATUS_META[appt.status ?? "pending"] ?? STATUS_META.pending;
  const overdue = isPast(end) && appt.status !== "done";

  return (
    <div className="flex items-start gap-2 py-3 border-b border-border/40 last:border-0">
      {/* Time column */}
      <div className="flex-shrink-0 w-16 text-right">
        <p className="text-xs font-semibold text-foreground">{format(start, "HH:mm")}</p>
        <p className="text-[10px] text-muted-foreground">{format(end, "HH:mm")}</p>
      </div>
      {/* Color dot */}
      <div className="mt-1 flex-shrink-0 h-2 w-2 rounded-full bg-primary/60" />
      {/* Body */}
      <div className="flex-1 min-w-0">
        <RoleEntityLink
          kind="appointment"
          id={appt.id}
          label={appt.title}
          className="text-sm font-medium block truncate"
        />
        {appt.location && (
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground ">
            <MapPin className="h-3 w-3" />
            {appt.location}
          </p>
        )}
        {appt.chief_complaint && (
          <p className="text-[11px] text-muted-foreground  truncate">
            {appt.chief_complaint}
          </p>
        )}
      </div>
      {/* Badges */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium", meta.cls)}>
          {meta.icon}
          {meta.label}
        </span>
        {appt.is_telehealth && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-100/80 text-sky-700 border border-sky-200/60">
            <Video className="h-3 w-3" />
            Telehealth
          </span>
        )}
        {overdue && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100/80 text-red-700 border border-red-200/60">
            <AlertCircle className="h-3 w-3" />
            Overdue
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Appointment Type checkbox
// ---------------------------------------------------------------------------

interface TypeToggleProps {
  type: AppointmentType;
  isEnabled: boolean;
  doctorId: string;
  isPending: boolean;
  onToggle: (typeId: string, enabled: boolean) => void;
}

function TypeToggle({ type, isEnabled, doctorId: _doctorId, isPending, onToggle }: TypeToggleProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 p-3 rounded-2xl border transition-colors",
      isEnabled
        ? "border-primary/20 bg-primary/5"
        : "border-border/40 bg-muted/30 opacity-70"
    )}>
      {/* Native checkbox — no shadcn/ui dependency required */}
      <input
        id={`type-${type.id}`}
        type="checkbox"
        checked={isEnabled}
        disabled={isPending}
        onChange={(e) => onToggle(type.id, e.target.checked)}
        className="flex-shrink-0 h-4 w-4 rounded cursor-pointer accent-primary"
      />
      <Label htmlFor={`type-${type.id}`} className="flex-1 cursor-pointer min-w-0">
        <span className="text-sm font-medium block truncate">{type.name}</span>
        <span className="text-[11px] text-muted-foreground">
          {type.duration_minutes} min
          {type.is_telehealth && " · Telehealth"}
        </span>
      </Label>
      {type.is_telehealth && (
        <Video className="h-3.5 w-3.5 text-sky-500 flex-shrink-0" />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Patient table row
// ---------------------------------------------------------------------------

function PatientRow({ patient }: { patient: Patient }) {
  const fullName = `${patient.firstname} ${patient.lastname}`;
  return (
    <tr className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
      <td className="py-2.5 pr-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
            {patient.firstname[0]}{patient.lastname[0]}
          </div>
          <RoleEntityLink
            kind="patient"
            id={patient.id}
            label={fullName}
            className="text-sm font-medium truncate max-w-[180px]"
          />
        </div>
      </td>
      <td className="py-2.5 pr-4">
        <span className="text-xs text-muted-foreground">
          {patient.birth_date
            ? format(parseISO(patient.birth_date), "MMM d, yyyy")
            : "—"}
        </span>
      </td>
      <td className="py-2.5">
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
          patient.active
            ? "bg-emerald-100/80 text-emerald-700 border border-emerald-200/60"
            : "bg-muted text-muted-foreground border border-border/40"
        )}>
          {patient.active ? "Active" : "Inactive"}
        </span>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface DoctorPortalPageProps {
  initialData: DoctorPortalData | null;
}

export default function DoctorPortalPage({ initialData }: DoctorPortalPageProps) {
  const queryClient = useQueryClient();

  /** Seed the doctor-portal cache synchronously before first paint to eliminate loading flash. */
  useLayoutEffect(() => {
    if (initialData != null) {
      queryClient.setQueryData(queryKeys.doctorPortal.all, initialData);
    }
  }, [queryClient, initialData]);

  const { data, isLoading } = useQuery<DoctorPortalData>({
    queryKey: queryKeys.doctorPortal.all,
    queryFn: () => apiClient<DoctorPortalData>("/api/doctor-portal"),
    staleTime: 3 * 60 * 1000,
  });

  // Local state for optimistic checkbox updates — keyed by type ID
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  // Compute enabled set from cached type configs
  const enabledTypeIds = new Set(
    (data?.typeConfigs ?? [])
      .filter((c) => c.is_enabled)
      .map((c) => c.appointment_type_id)
  );

  // For types without a config row, default to enabled (absence = enabled)
  const isTypeEnabled = (typeId: string) => {
    const cfg = data?.typeConfigs.find((c) => c.appointment_type_id === typeId);
    return cfg ? cfg.is_enabled : true;
  };

  const toggleMutation = useMutation({
    mutationFn: (vars: { doctor_id: string; appointment_type_id: string; is_enabled: boolean }) =>
      apiClient("/api/appointment-types/doctor-config", {
        method: "POST",
        body: JSON.stringify(vars),
      }),
    onSuccess: async () => {
      await Promise.all([
        invalidateAppointmentTypeDerived(queryClient),
        invalidateDoctorPortal(queryClient),
      ]);
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
      notify.crud({ action: enabled ? "created" : "deleted", entity: "Visit type", detail: enabled ? "Enabled for your patients." : "Disabled for new bookings." });
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
  const patients = data?.patients ?? [];
  const allTypes = data?.allGlobalTypes ?? [];
  const metrics = data?.metrics;

  const sortedToday = [...todayAppts].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return (
    <div className="space-y-4 max-w-9xl mx-auto">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className={cn("p-6", GLASS.blue)}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {isLoading ? (
              <Skeleton className="h-20 w-20 rounded-full" />
            ) : (
              <UserAvatar
                src={doctor?.image}
                alt={doctor?.display_name ?? "Doctor"}
                fallbackText={(doctor?.display_name ?? "DR").slice(0, 2)}
                sizeClassName="h-20 w-20"
              />
            )}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold tracking-tight truncate">
                  {doctor?.display_name ?? "Doctor"}
                </h1>
                {doctor?.specialty && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground ">
                    <Stethoscope className="h-3.5 w-3.5" />
                    {doctor.specialty}
                  </p>
                )}
                {doctor?.department && (
                  <p className="text-xs text-muted-foreground ">{doctor.department}</p>
                )}
              </>
            )}
          </div>
          {/* Date chip */}
          <div className="flex-shrink-0 text-right">
            <p className="text-xs font-medium text-muted-foreground">Today</p>
            <p className="text-sm font-semibold">{format(new Date(), "EEE, MMM d yyyy")}</p>
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <StatCard label="Today" value={metrics?.today} icon={<Calendar className="h-5 w-5 text-blue-500" />} color="blue" isLoading={isLoading} />
          <StatCard label="This Week" value={metrics?.thisWeek} icon={<CalendarClock className="h-5 w-5 text-indigo-500" />} color="indigo" isLoading={isLoading} />
          <StatCard label="This Month" value={metrics?.thisMonth} icon={<CalendarCheck className="h-5 w-5 text-green-500" />} color="green" isLoading={isLoading} />
          <StatCard label="Pending" value={metrics?.pending} icon={<Clock className="h-5 w-5 text-amber-500" />} color="amber" isLoading={isLoading} />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Two-column layout: Today's Schedule + Appointment Types              */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card className={cn("overflow-hidden", GLASS.slate)}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Calendar className="h-4 w-4 text-blue-500" />
              Today&apos;s Schedule
              {!isLoading && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {sortedToday.length} appointments
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-5 pb-4">
            {isLoading ? (
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
                <CheckCircle2 className="h-8 w-8 mb-2 text-emerald-400" />
                <p className="text-sm">No appointments today</p>
              </div>
            ) : (
              <div>
                {sortedToday.map((appt) => (
                  <AppointmentRow key={appt.id} appt={appt} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointment Types Manager */}
        <Card className={cn("overflow-hidden", GLASS.purple)}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Layers className="h-4 w-4 text-purple-500" />
              Visit Types
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                Toggle what patients can book
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 gap-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-2xl" />)}
              </div>
            ) : allTypes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Layers className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No global visit types configured</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {allTypes.map((type) => (
                  <TypeToggle
                    key={type.id}
                    type={type}
                    isEnabled={isTypeEnabled(type.id)}
                    doctorId={doctor?.id ?? ""}
                    isPending={togglingIds.has(type.id)}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* My Patients                                                          */}
      {/* ------------------------------------------------------------------ */}
      <Card className={cn("overflow-hidden", GLASS.green)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Users className="h-4 w-4 text-green-500" />
            My Patients
            {!isLoading && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {patients.length} total
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)}
            </div>
          ) : patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <UserIcon className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No patients assigned yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-xs font-medium text-muted-foreground pb-2 pr-4">Name</th>
                    <th className="text-xs font-medium text-muted-foreground pb-2 pr-4">Date of Birth</th>
                    <th className="text-xs font-medium text-muted-foreground pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.slice(0, 20).map((p) => (
                    <PatientRow key={p.id} patient={p} />
                  ))}
                </tbody>
              </table>
              {patients.length > 20 && (
                <p className="text-xs text-muted-foreground text-center pt-3">
                  +{patients.length - 20} more patients in your panel
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Upcoming Appointments                                                */}
      {/* ------------------------------------------------------------------ */}
      <Card className={cn("overflow-hidden", GLASS.indigo)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CalendarClock className="h-4 w-4 text-indigo-500" />
            Upcoming Appointments
            {!isLoading && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {upcomingAppts.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 px-5 pb-4">
          {isLoading ? (
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
              <CalendarCheck className="h-8 w-8 mb-2 text-emerald-400" />
              <p className="text-sm">No upcoming appointments</p>
            </div>
          ) : (
            <div>
              {upcomingAppts.map((appt) => {
                const start = parseISO(appt.start);
                const apptIsToday = isToday(start);
                return (
                  <div key={appt.id} className="flex items-start gap-2 py-3 border-b border-border/40 last:border-0">
                    <div className="flex-shrink-0 w-20 text-right">
                      <p className="text-[10px] font-medium text-muted-foreground">
                        {apptIsToday ? "Today" : format(start, "EEE, MMM d")}
                      </p>
                      <p className="text-xs font-semibold">{format(start, "HH:mm")}</p>
                    </div>
                    <div className=" flex-shrink-0 h-2 w-2 rounded-full bg-indigo-400/60" />
                    <div className="flex-1 min-w-0">
                      <RoleEntityLink
                        kind="appointment"
                        id={appt.id}
                        label={appt.title}
                        className="text-sm font-medium block truncate"
                      />
                      {appt.chief_complaint && (
                        <p className="text-[11px] text-muted-foreground truncate">{appt.chief_complaint}</p>
                      )}
                    </div>
                    {appt.is_telehealth && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-100/80 text-sky-700 border border-sky-200/60 flex-shrink-0">
                        <Video className="h-3 w-3" />
                        Telehealth
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
