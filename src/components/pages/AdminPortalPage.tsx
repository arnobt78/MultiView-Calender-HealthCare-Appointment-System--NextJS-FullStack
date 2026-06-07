"use client";

/**
 * AdminPortalPage — client-side portal for authenticated admins.
 *
 * Sections:
 *   1. Global Overview — KPI cards (appointments, patients, doctors, revenue, pending, overdue)
 *   2. Doctor Directory — summary cards with specialty, patient count, office location
 *   3. Recent Appointments — last 15 appointments across all users
 *
 * Cache seeding: useLayoutEffect sets queryKeys.adminPortal.all from SSR initialData
 * before first paint so KPI cards render immediately with no loading flash.
 *
 * Stale data: `invalidateAdminPortal` (see `src/lib/query-client.ts`) runs after appointment CRUD,
 * assignee/activity edits, entity mutations, and doctor visit-type toggles so this page refetches in place.
 *
 * Date strings: `parseISO` / `format` come from `date-fns` v4, which ships its own TypeScript types
 * (do not install the legacy `@types/date-fns` package alongside v4 — it shadows real exports and causes TS2305).
 */

import { useLayoutEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/lib/api-client";
import type { AdminPortalData, Appointment, DoctorRow } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { appPortalSectionRootClass } from "@/lib/section-page-layout";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { appointmentDetailHref, doctorDetailHref } from "@/lib/entity-routes";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BadgeDollarSign,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Clock,
  CreditCard,
  MapPin,
  Stethoscope,
  Users,
  Video,
} from "lucide-react";
import { AppointmentListVisitFeeBadge } from "@/components/shared/appointment-display/AppointmentListVisitFeeBadge";
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
  red: "rounded-[28px] border border-red-400/20 bg-gradient-to-br from-red-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(225,29,72,0.12)]",
  emerald: "rounded-[28px] border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(16,185,129,0.12)]",
  slate: "rounded-[28px] border border-slate-400/20 bg-gradient-to-br from-slate-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(100,116,139,0.1)]",
};

const STATUS_META: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
  done: { cls: "calendar-glass-badge-emerald", icon: <CalendarCheck className="h-3 w-3" />, label: "Done" },
  pending: { cls: "calendar-glass-badge-amber", icon: <CalendarClock className="h-3 w-3" />, label: "Pending" },
  alert: { cls: "calendar-glass-badge-rose", icon: <CalendarX className="h-3 w-3" />, label: "Alert" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format cents as currency string (USD) */
function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

// ---------------------------------------------------------------------------
// KPI stat card
// ---------------------------------------------------------------------------

interface KpiCardProps {
  label: string;
  value: string | number | undefined;
  icon: React.ReactNode;
  color: string;
  isLoading: boolean;
  sub?: string;
}

function KpiCard({ label, value, icon, color, isLoading, sub }: KpiCardProps) {
  return (
    <div className={cn("p-5 flex items-center gap-2", GLASS[color])}>
      <div className="flex-shrink-0 rounded-2xl bg-white/60 p-3 shadow-sm">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {isLoading ? (
          <Skeleton className="mt-1 h-7 w-16" />
        ) : (
          <p className="text-2xl font-bold tracking-tight">{value ?? 0}</p>
        )}
        {sub && <p className="text-[10px] text-muted-foreground ">{sub}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Appointment row (recent)
// ---------------------------------------------------------------------------

function RecentAppointmentRow({ appt }: { appt: Appointment & { patient_name?: string | null; owner_display?: string | null } }) {
  const start = parseISO(appt.start);
  const meta = STATUS_META[appt.status ?? "pending"] ?? STATUS_META.pending;

  return (
    <div className="flex items-start gap-2 py-3 border-b border-border/40 last:border-0">
      <div className="flex-shrink-0 w-20 text-right">
        <p className="text-[10px] text-muted-foreground">{format(start, "MMM d")}</p>
        <p className="text-xs font-semibold">{format(start, "HH:mm")}</p>
      </div>
      <div className=" flex-shrink-0 h-2 w-2 rounded-full bg-primary/60" />
      <div className="flex-1 min-w-0">
        <EntityTitleLink
          href={appointmentDetailHref("admin", appt.id)}
          label={appt.title}
          className="text-sm font-medium block truncate"
        />
        <div className="flex items-center gap-2 flex-wrap ">
          {(appt as { patient_name?: string | null }).patient_name && (
            <span className="text-[11px] text-muted-foreground">
              Patient: {(appt as { patient_name?: string | null }).patient_name}
            </span>
          )}
          {(appt as { owner_display?: string | null }).owner_display && (
            <span className="text-[11px] text-muted-foreground">
              · Dr. {(appt as { owner_display?: string | null }).owner_display}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-normal", meta.cls)}>
          {meta.icon}
          {meta.label}
        </span>
        {appt.is_telehealth && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-normal bg-sky-100/80 text-sky-700 border border-sky-200/60">
            <Video className="h-3 w-3" />
            Telehealth
          </span>
        )}
        <AppointmentListVisitFeeBadge
          appointmentTypePriceCents={appt.appointment_type_price_cents}
          doctorConsultationFeeCents={appt.doctor_consultation_fee_cents}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Doctor summary card
// ---------------------------------------------------------------------------

function DoctorSummaryCard({ doctor }: { doctor: DoctorRow }) {
  return (
    <div className={cn("p-4 flex flex-col gap-2", GLASS.slate)}>
      <div className="flex items-center gap-2">
        <UserAvatar
          src={doctor.image}
          alt={doctor.display_name ?? doctor.email}
          fallbackText={(doctor.display_name ?? doctor.email).slice(0, 2)}
          sizeClassName="h-10 w-10"
          className="flex-shrink-0"
        />
        <div className="min-w-0">
          <EntityTitleLink
            href={doctorDetailHref("admin", doctor.id)}
            label={doctor.display_name ?? doctor.email}
            className="text-sm font-semibold block truncate"
          />
          {doctor.specialty && (
            <DoctorSpecialtyBadge specialty={doctor.specialty} className="" />
          )}
        </div>
        <Badge variant="secondary" className="ml-auto text-[10px] flex-shrink-0">
          {doctor.patient_count} pts
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
        {doctor.office_location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {doctor.office_location}
          </span>
        )}
        {doctor.consultation_fee != null && (
          <span className="flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            {formatCents(doctor.consultation_fee)}
          </span>
        )}
        {doctor.years_of_experience != null && (
          <span>{doctor.years_of_experience}y exp</span>
        )}
      </div>

      {doctor.appointment_types.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {doctor.appointment_types.slice(0, 3).map((t) => (
            <span key={t.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-normal bg-primary/5 text-primary border border-primary/10">
              {t.is_telehealth && <Video className="h-2.5 w-2.5" />}
              {t.name}
            </span>
          ))}
          {doctor.appointment_types.length > 3 && (
            <span className="text-[10px] text-muted-foreground self-center">
              +{doctor.appointment_types.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface AdminPortalPageProps {
  initialData: AdminPortalData | null;
}

export default function AdminPortalPage({ initialData }: AdminPortalPageProps) {
  const queryClient = useQueryClient();

  /** Seed the admin-portal cache synchronously before first paint. */
  useLayoutEffect(() => {
    if (initialData != null) {
      queryClient.setQueryData(queryKeys.adminPortal.all, initialData);
    }
  }, [queryClient, initialData]);

  const { data, isLoading } = useQuery<AdminPortalData>({
    queryKey: queryKeys.adminPortal.all,
    queryFn: () => apiClient<AdminPortalData>("/api/admin-portal"),
    staleTime: 3 * 60 * 1000,
  });

  const overview = data?.overview;
  const doctors = data?.doctors ?? [];
  const recent = data?.recentAppointments ?? [];

  return (
    <div className={cn(appPortalSectionRootClass, "max-w-9xl mx-auto")}>
      {/* ------------------------------------------------------------------ */}
      {/* Page header                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className={cn("p-6", GLASS.blue)}>
        <div className="mb-1">
          <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-sm text-muted-foreground ">
            Clinic-wide overview · {format(new Date(), "EEEE, MMMM d yyyy")}
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Global KPI cards                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Total Appointments"
          value={overview?.totalAppointments}
          icon={<Calendar className="h-5 w-5 text-blue-500" />}
          color="blue"
          isLoading={isLoading}
        />
        <KpiCard
          label="Today"
          value={overview?.todayAppointments}
          icon={<CalendarClock className="h-5 w-5 text-indigo-500" />}
          color="indigo"
          isLoading={isLoading}
        />
        <KpiCard
          label="Total Patients"
          value={overview?.totalPatients}
          icon={<Users className="h-5 w-5 text-green-500" />}
          color="green"
          isLoading={isLoading}
        />
        <KpiCard
          label="Total Doctors"
          value={overview?.totalDoctors}
          icon={<Stethoscope className="h-5 w-5 text-purple-500" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Pending"
          value={overview?.pendingAppointments}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          color="amber"
          isLoading={isLoading}
        />
        <KpiCard
          label="Overdue"
          value={overview?.overdueAppointments}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          color="red"
          isLoading={isLoading}
        />
        <KpiCard
          label="Revenue Collected"
          value={isLoading ? undefined : formatCents(overview?.paidRevenueCents ?? 0)}
          icon={<BadgeDollarSign className="h-5 w-5 text-emerald-500" />}
          color="emerald"
          isLoading={isLoading}
        />
        <KpiCard
          label="Outstanding"
          value={isLoading ? undefined : formatCents(overview?.outstandingRevenueCents ?? 0)}
          icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
          color="amber"
          isLoading={isLoading}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Two-column: Recent Appointments + Doctor Directory                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <Card className={cn("overflow-hidden", GLASS.slate)}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Activity className="h-4 w-4 text-slate-500" />
              Recent Appointments
              {!isLoading && (
                <Badge variant="secondary" className="ml-auto text-xs">{recent.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-5 pb-4">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-2 py-3">
                    <Skeleton className="h-10 w-20 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CalendarCheck className="h-8 w-8 mb-2 text-emerald-400" />
                <p className="text-sm">No appointments yet</p>
              </div>
            ) : (
              <div>
                {recent.map((appt) => (
                  <RecentAppointmentRow key={appt.id} appt={appt as Appointment & { patient_name?: string | null; owner_display?: string | null }} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Doctor Directory */}
        <Card className={cn("overflow-hidden", GLASS.purple)}>
          <CardHeader className="pb-2">
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
                <p className="text-sm">No doctors registered</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {doctors.map((d) => <DoctorSummaryCard key={d.id} doctor={d} />)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
