"use client";

/**
 * AdminPortalPage — clinic-wide overview for authenticated admins.
 *
 * SSR: `page.tsx` prefetches `queryKeys.adminPortal.all` + invoices; `useLayoutEffect` seeds cache before paint.
 * Invalidation: `invalidateAdminPortal` on appointment/patient/doctor/invoice CRUD (see query-client.ts).
 */

import { useLayoutEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/lib/api-client";
import type { AdminPortalData } from "@/types/types";
import type { Invoice } from "@/hooks/usePayments";
import { seedInvoicesListCacheFromSsr } from "@/lib/invoices-query-ssr-seed";
import { useQueryBodyLoading } from "@/lib/query-body-loading";
import { PortalPageChrome } from "@/components/shared/PortalPageChrome";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import { AdminPortalAppointmentsPanel } from "@/components/admin-portal/AdminPortalAppointmentsPanel";
import { AdminPortalDoctorDirectoryPanel } from "@/components/admin-portal/AdminPortalDoctorDirectoryPanel";
import { appPortalSectionRootClass } from "@/lib/section-page-layout";
import { doctorPortalPanelPairGridClass } from "@/lib/doctor-portal-layout";
import { formatCalendarListDayHeadline } from "@/lib/calendar-date-display";
import {
  AlertCircle,
  AlertTriangle,
  BadgeDollarSign,
  Calendar,
  CalendarClock,
  Clock,
  Stethoscope,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

type AdminPortalPageProps = {
  initialData: AdminPortalData | null;
  /** SSR seed for invoice badges on appointment rows. */
  initialInvoices?: Invoice[] | null;
};

export default function AdminPortalPage({
  initialData,
  initialInvoices = null,
}: AdminPortalPageProps) {
  const queryClient = useQueryClient();

  useMemo(() => {
    seedInvoicesListCacheFromSsr(queryClient, initialInvoices ?? undefined);
    return null;
  }, [queryClient, initialInvoices]);

  useLayoutEffect(() => {
    if (initialData != null) {
      queryClient.setQueryData(queryKeys.adminPortal.all, initialData);
    }
    seedInvoicesListCacheFromSsr(queryClient, initialInvoices ?? undefined);
  }, [queryClient, initialData, initialInvoices]);

  const { data, isLoading } = useQuery<AdminPortalData>({
    queryKey: queryKeys.adminPortal.all,
    queryFn: () => apiClient<AdminPortalData>("/api/admin-portal"),
    staleTime: 3 * 60 * 1000,
    initialData: initialData ?? undefined,
  });

  const hasCache = initialData != null || data != null;
  const kpiLoading = isLoading && !hasCache;
  const listBodyLoading = useQueryBodyLoading(queryKeys.adminPortal.all, isLoading);

  const overview = data?.overview;
  const doctors = data?.doctors ?? [];
  const appointments = data?.appointments ?? data?.recentAppointments ?? [];
  const todayLabel = formatCalendarListDayHeadline(new Date());

  return (
    <div className={cn(appPortalSectionRootClass, "mx-auto max-w-9xl")}>
      <PortalPageChrome
        route="admin_portal"
        description={`Clinic-wide overview · ${todayLabel}`}
      />

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <PatientStatCard variant="sky" icon={Calendar} title="Total Appointments" subtitle="All-time scheduled visits" value={overview?.totalAppointments ?? 0} valueSkeleton={kpiLoading} />
        <PatientStatCard variant="violet" icon={CalendarClock} title="Today" subtitle="Appointments scheduled today" value={overview?.todayAppointments ?? 0} valueSkeleton={kpiLoading} />
        <PatientStatCard variant="emerald" icon={Users} title="Total Patients" subtitle="Registered patient records" value={overview?.totalPatients ?? 0} valueSkeleton={kpiLoading} />
        <PatientStatCard variant="violet" icon={Stethoscope} title="Total Doctors" subtitle="Active doctor profiles" value={overview?.totalDoctors ?? 0} valueSkeleton={kpiLoading} />
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <PatientStatCard variant="amber" icon={Clock} title="Pending" subtitle="Awaiting completion" value={overview?.pendingAppointments ?? 0} valueSkeleton={kpiLoading} />
        <PatientStatCard variant="rose" icon={AlertTriangle} title="Overdue" subtitle="Past due appointments" value={overview?.overdueAppointments ?? 0} valueSkeleton={kpiLoading} />
        <PatientStatCard
          variant="emerald"
          icon={BadgeDollarSign}
          title="Revenue Collected"
          subtitle="Paid invoice total"
          value={overview?.paidRevenueCents ?? 0}
          valueDisplay={formatCents(overview?.paidRevenueCents ?? 0)}
          valueSkeleton={kpiLoading}
        />
        <PatientStatCard
          variant="amber"
          icon={AlertCircle}
          title="Outstanding"
          subtitle="Unpaid invoice balance"
          value={overview?.outstandingRevenueCents ?? 0}
          valueDisplay={formatCents(overview?.outstandingRevenueCents ?? 0)}
          valueSkeleton={kpiLoading}
        />
      </div>

      <div className={doctorPortalPanelPairGridClass}>
        <AdminPortalAppointmentsPanel appointments={appointments} listLoading={listBodyLoading} />
        <AdminPortalDoctorDirectoryPanel doctors={doctors} listLoading={listBodyLoading} />
      </div>
    </div>
  );
}
