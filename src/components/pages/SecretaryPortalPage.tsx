"use client";

/**
 * SecretaryPortalPage — client-side portal for authenticated secretaries.
 *
 * Sections:
 *   1. Header — quick stats (today / pending / patients / doctors)
 *   2. Today's Appointments — full list, each card links to appointment detail
 *   3. Patients — searchable compact table with link to patient detail
 *   4. Doctor Directory — read-only doctor cards showing availability + types
 *   5. Recent Activities — last 20 activity log entries
 *
 * Cache seeding: useLayoutEffect sets queryKeys.secretaryPortal.all from SSR initialData
 * before first paint to eliminate loading flash.
 */

import { useState, useLayoutEffect } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, isToday } from "date-fns";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/lib/api-client";
import type { SecretaryPortalData, Appointment, Patient, DoctorRow, Activity } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  Activity as ActivityIcon,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Clock,
  MapPin,
  Search,
  Stethoscope,
  Users,
  Video,
  AlertCircle,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Glass variants
// ---------------------------------------------------------------------------

const GLASS: Record<string, string> = {
  blue: "rounded-[28px] border border-blue-400/20 bg-gradient-to-br from-blue-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(59,130,246,0.12)]",
  indigo: "rounded-[28px] border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(99,102,241,0.12)]",
  green: "rounded-[28px] border border-green-400/20 bg-gradient-to-br from-green-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(34,197,94,0.12)]",
  amber: "rounded-[28px] border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(245,158,11,0.12)]",
  purple: "rounded-[28px] border border-purple-400/20 bg-gradient-to-br from-purple-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(168,85,247,0.12)]",
  slate: "rounded-[28px] border border-slate-400/20 bg-gradient-to-br from-slate-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(100,116,139,0.1)]",
};

const STATUS_META: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
  done: { cls: "calendar-glass-badge-emerald", icon: <CalendarCheck className="h-3 w-3" />, label: "Done" },
  pending: { cls: "calendar-glass-badge-amber", icon: <CalendarClock className="h-3 w-3" />, label: "Pending" },
  alert: { cls: "calendar-glass-badge-rose", icon: <CalendarX className="h-3 w-3" />, label: "Alert" },
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

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
      <div className="flex-shrink-0 w-16 text-right">
        <p className="text-xs font-semibold">{format(start, "HH:mm")}</p>
        <p className="text-[10px] text-muted-foreground">{format(end, "HH:mm")}</p>
      </div>
      <div className="mt-1 flex-shrink-0 h-2 w-2 rounded-full bg-primary/60" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{appt.title}</p>
        {appt.location && (
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
            <MapPin className="h-3 w-3" />
            {appt.location}
          </p>
        )}
      </div>
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
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Patient row
// ---------------------------------------------------------------------------

function PatientRow({ patient }: { patient: Patient }) {
  return (
    <tr className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
      <td className="py-2.5 pr-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
            {patient.firstname[0]}{patient.lastname[0]}
          </div>
          <Link
            href={`/control-panel/patients/${patient.id}`}
            className="text-sm font-medium hover:underline text-foreground truncate max-w-[180px]"
          >
            {patient.firstname} {patient.lastname}
          </Link>
        </div>
      </td>
      <td className="py-2.5 pr-4">
        <span className="text-xs text-muted-foreground">
          {patient.email ?? "—"}
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
// Doctor card (read-only)
// ---------------------------------------------------------------------------

function DoctorCard({ doctor }: { doctor: DoctorRow }) {
  // Weekday label map
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const minToTime = (min: number) => {
    const h = Math.floor(min / 60).toString().padStart(2, "0");
    const m = (min % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  return (
    <div className={cn("p-4", GLASS.slate)}>
      <div className="flex items-center gap-3 mb-3">
        <UserAvatar
          src={doctor.image}
          alt={doctor.display_name ?? doctor.email}
          fallbackText={(doctor.display_name ?? doctor.email).slice(0, 2)}
          sizeClassName="h-10 w-10"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{doctor.display_name ?? doctor.email}</p>
          {doctor.specialty && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Stethoscope className="h-3 w-3" />
              {doctor.specialty}
            </p>
          )}
        </div>
        <Badge variant="secondary" className="ml-auto text-[10px]">
          {doctor.patient_count} patients
        </Badge>
      </div>

      {/* Availability */}
      {doctor.availabilities.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Availability</p>
          {doctor.availabilities.map((av, i) => (
            <p key={i} className="text-[11px] text-muted-foreground">
              {DAYS[av.weekday]} · {minToTime(av.start_min)} – {minToTime(av.end_min)}
            </p>
          ))}
        </div>
      )}

      {/* Appointment types */}
      {doctor.appointment_types.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {doctor.appointment_types.slice(0, 3).map((t) => (
            <span key={t.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/5 text-primary border border-primary/10">
              {t.is_telehealth && <Video className="h-2.5 w-2.5" />}
              {t.name}
            </span>
          ))}
          {doctor.appointment_types.length > 3 && (
            <span className="text-[10px] text-muted-foreground self-center">
              +{doctor.appointment_types.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity row
// ---------------------------------------------------------------------------

function ActivityRow({ activity }: { activity: Activity }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0">
      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
        <ActivityIcon className="h-3 w-3 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">{activity.content}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {format(parseISO(activity.created_at), "MMM d, HH:mm")}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface SecretaryPortalPageProps {
  initialData: SecretaryPortalData | null;
}

export default function SecretaryPortalPage({ initialData }: SecretaryPortalPageProps) {
  const queryClient = useQueryClient();

  /** Seed the secretary-portal cache synchronously before first paint. */
  useLayoutEffect(() => {
    if (initialData != null) {
      queryClient.setQueryData(queryKeys.secretaryPortal.all, initialData);
    }
  }, [queryClient, initialData]);

  const { data, isLoading } = useQuery<SecretaryPortalData>({
    queryKey: queryKeys.secretaryPortal.all,
    queryFn: () => apiClient<SecretaryPortalData>("/api/secretary-portal"),
    staleTime: 3 * 60 * 1000,
  });

  const [patientSearch, setPatientSearch] = useState("");

  const todayAppts = data?.todayAppointments ?? [];
  const upcomingAppts = data?.upcomingAppointments ?? [];
  const patients = data?.patients ?? [];
  const doctors = data?.doctors ?? [];
  const activities = data?.recentActivities ?? [];
  const metrics = data?.metrics;

  const sortedToday = [...todayAppts].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const filteredPatients = patientSearch.trim()
    ? patients.filter((p) => {
        const q = patientSearch.toLowerCase();
        return (
          p.firstname.toLowerCase().includes(q) ||
          p.lastname.toLowerCase().includes(q) ||
          (p.email ?? "").toLowerCase().includes(q)
        );
      })
    : patients;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* ------------------------------------------------------------------ */}
      {/* Header — quick stats                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className={cn("p-6", GLASS.blue)}>
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Secretary Portal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(new Date(), "EEEE, MMMM d yyyy")}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Today" value={metrics?.today} icon={<Calendar className="h-5 w-5 text-blue-500" />} color="blue" isLoading={isLoading} />
          <StatCard label="Pending" value={metrics?.pending} icon={<Clock className="h-5 w-5 text-amber-500" />} color="amber" isLoading={isLoading} />
          <StatCard label="Patients" value={metrics?.totalPatients} icon={<Users className="h-5 w-5 text-green-500" />} color="green" isLoading={isLoading} />
          <StatCard label="Doctors" value={metrics?.totalDoctors} icon={<Stethoscope className="h-5 w-5 text-indigo-500" />} color="indigo" isLoading={isLoading} />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Today's Appointments                                                  */}
      {/* ------------------------------------------------------------------ */}
      <Card className={cn("overflow-hidden", GLASS.slate)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Calendar className="h-4 w-4 text-blue-500" />
            Today&apos;s Appointments
            {!isLoading && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {sortedToday.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 px-5 pb-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 py-3">
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
              <CalendarCheck className="h-8 w-8 mb-2 text-emerald-400" />
              <p className="text-sm">No appointments scheduled today</p>
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

      {/* ------------------------------------------------------------------ */}
      {/* Upcoming Appointments                                                */}
      {/* ------------------------------------------------------------------ */}
      {upcomingAppts.length > 0 && (
        <Card className={cn("overflow-hidden", GLASS.indigo)}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <CalendarClock className="h-4 w-4 text-indigo-500" />
              Upcoming
              <Badge variant="secondary" className="ml-auto text-xs">{upcomingAppts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-5 pb-4">
            <div>
              {upcomingAppts.map((appt) => {
                const start = parseISO(appt.start);
                return (
                  <div key={appt.id} className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
                    <div className="flex-shrink-0 w-20 text-right">
                      <p className="text-[10px] font-medium text-muted-foreground">
                        {isToday(start) ? "Today" : format(start, "EEE, MMM d")}
                      </p>
                      <p className="text-xs font-semibold">{format(start, "HH:mm")}</p>
                    </div>
                    <div className="mt-0.5 flex-shrink-0 h-2 w-2 rounded-full bg-indigo-400/60" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{appt.title}</p>
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
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Two-column: Patients + Doctor Directory                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patients */}
        <Card className={cn("overflow-hidden", GLASS.green)}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Users className="h-4 w-4 text-green-500" />
              Patients
              {!isLoading && (
                <Badge variant="secondary" className="ml-auto text-xs">{patients.length}</Badge>
              )}
            </CardTitle>
            {/* Search box */}
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by name or email…"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="pl-8 h-8 text-sm rounded-xl"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)}
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <UserIcon className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">{patientSearch ? "No results" : "No patients found"}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-xs font-medium text-muted-foreground pb-2 pr-4">Name</th>
                      <th className="text-xs font-medium text-muted-foreground pb-2 pr-4">Email</th>
                      <th className="text-xs font-medium text-muted-foreground pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.slice(0, 15).map((p) => (
                      <PatientRow key={p.id} patient={p} />
                    ))}
                  </tbody>
                </table>
                {filteredPatients.length > 15 && (
                  <p className="text-xs text-muted-foreground text-center pt-3">
                    +{filteredPatients.length - 15} more — <Link href="/control-panel/patients" className="underline hover:text-foreground">View all</Link>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Doctor Directory */}
        <Card className={cn("overflow-hidden", GLASS.purple)}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Stethoscope className="h-4 w-4 text-purple-500" />
              Doctor Directory
              {!isLoading && (
                <Badge variant="secondary" className="ml-auto text-xs">{doctors.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
              </div>
            ) : doctors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Stethoscope className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No doctors found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {doctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Recent Activities                                                    */}
      {/* ------------------------------------------------------------------ */}
      <Card className={cn("overflow-hidden", GLASS.amber)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ActivityIcon className="h-4 w-4 text-amber-500" />
            Recent Activity
            {!isLoading && (
              <Badge variant="secondary" className="ml-auto text-xs">{activities.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 px-5 pb-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 py-3">
                  <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <ActivityIcon className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div>
              {activities.map((a) => (
                <ActivityRow key={a.id} activity={a} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
