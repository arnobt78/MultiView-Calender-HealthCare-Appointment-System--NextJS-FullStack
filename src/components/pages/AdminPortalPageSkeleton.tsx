"use client";

/**
 * SSR fallback when admin portal prefetch fails — real chrome; pulse KPI values + list bodies only.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { PortalPageChrome } from "@/components/shared/PortalPageChrome";
import { PortalPanelSection } from "@/components/shared/PortalPanelSection";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import { appPortalSectionRootClass } from "@/lib/section-page-layout";
import { doctorPortalPanelPairGridClass } from "@/lib/doctor-portal-layout";
import { formatCalendarListDayHeadline } from "@/lib/calendar-date-display";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BadgeDollarSign,
  Calendar,
  CalendarClock,
  Clock,
  Stethoscope,
  Users,
} from "lucide-react";

function ListBodyPulse({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-2xl" aria-hidden />
      ))}
    </div>
  );
}

export function AdminPortalPageSkeleton() {
  const todayLabel = formatCalendarListDayHeadline(new Date());

  return (
    <div className={appPortalSectionRootClass} aria-busy="true" aria-label="Loading admin portal">
      <PortalPageChrome route="admin_portal" description={`Clinic-wide overview · ${todayLabel}`} />

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <PatientStatCard variant="sky" icon={Calendar} title="Total Appointments" subtitle="All-time scheduled visits" value={0} valueSkeleton />
        <PatientStatCard variant="violet" icon={CalendarClock} title="Today" subtitle="Appointments scheduled today" value={0} valueSkeleton />
        <PatientStatCard variant="emerald" icon={Users} title="Total Patients" subtitle="Registered patient records" value={0} valueSkeleton />
        <PatientStatCard variant="violet" icon={Stethoscope} title="Total Doctors" subtitle="Active doctor profiles" value={0} valueSkeleton />
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <PatientStatCard variant="amber" icon={Clock} title="Pending" subtitle="Awaiting completion" value={0} valueSkeleton />
        <PatientStatCard variant="rose" icon={AlertTriangle} title="Overdue" subtitle="Past due appointments" value={0} valueSkeleton />
        <PatientStatCard variant="emerald" icon={BadgeDollarSign} title="Revenue Collected" subtitle="Paid invoice total" value={0} valueSkeleton />
        <PatientStatCard variant="amber" icon={AlertCircle} title="Outstanding" subtitle="Unpaid invoice balance" value={0} valueSkeleton />
      </div>

      <div className={doctorPortalPanelPairGridClass}>
        <PortalPanelSection
          title="Recent Appointments"
          subtitle="Clinic-wide visits — newest first (up to 100)"
          icon={Activity}
          iconClassName="border-sky-100 bg-sky-50 [&_svg]:text-sky-600"
          countSkeleton
        >
          <ListBodyPulse rows={5} />
        </PortalPanelSection>

        <PortalPanelSection
          title="Doctor Directory"
          subtitle="Active profiles, availability, and visit types"
          icon={Stethoscope}
          iconClassName="border-violet-100 bg-violet-50 [&_svg]:text-violet-600"
          countSkeleton
        >
          <ListBodyPulse rows={3} />
        </PortalPanelSection>
      </div>
    </div>
  );
}
