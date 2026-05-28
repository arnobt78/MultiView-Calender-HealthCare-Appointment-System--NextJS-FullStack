"use client";

/**
 * Doctors insights — schedule + volume charts; org roster vs personal (my practice / drill-down).
 */

import { Activity, CalendarOff, Clock, Stethoscope } from "lucide-react";
import { AnalyticsChartCard } from "@/components/shared/analytics/AnalyticsChartCard";
import { AnalyticsBarChart } from "@/components/shared/analytics/AnalyticsBarChart";
import { AnalyticsPieChart } from "@/components/shared/analytics/AnalyticsPieChart";
import type { InsightsDoctorsSection } from "@/lib/insights/insights-types";
import type { InsightsPeriod } from "@/lib/insights/insights-period";

type Props = {
  doctors: InsightsDoctorsSection;
  chartSubtitle: string;
  period: InsightsPeriod;
  loading: boolean;
};

export function AnalyticsDoctorInsightsSection({
  doctors,
  chartSubtitle,
  period,
  loading,
}: Props) {
  const isOrg = doctors.mode === "organization";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {isOrg ? (
        <>
          <AnalyticsChartCard
            title="Appointments by doctor"
            periodSubtitle={chartSubtitle}
            detailHint="Appointment volume per doctor in the selected chart period."
            icon={Activity}
            loading={loading}
          >
            {/* wrap: labels are doctor full names — need multi-line word break */}
            <AnalyticsBarChart
              data={doctors.byDoctor.slice(0, 12).map((d) => ({
                label: d.name,
                count: d.appointmentCount,
              }))}
              emptyKind="appointments-by-doctor"
              period={period}
              xAxisLayout="wrap"
            />
          </AnalyticsChartCard>
          <AnalyticsChartCard
            title="By specialty"
            periodSubtitle={chartSubtitle}
            detailHint="Appointment volume by specialty in the selected chart period."
            icon={Stethoscope}
            loading={loading}
          >
            <AnalyticsPieChart
              data={doctors.bySpecialty.map((s) => ({
                name: s.specialty,
                count: s.count,
              }))}
              emptyKind="by-specialty"
              period={period}
            />
          </AnalyticsChartCard>
        </>
      ) : null}

      <AnalyticsChartCard
        title={isOrg ? "Weekly hours by doctor" : "Weekly availability"}
        periodSubtitle={chartSubtitle}
        detailHint={
          isOrg
            ? "Configured weekly availability hours per doctor (schedule windows)."
            : "Configured availability hours by weekday for this doctor."
        }
        icon={Clock}
        loading={loading}
      >
        {/*
          org: labels are doctor names → wrap (multi-line word break)
          personal: labels are weekday abbreviations (Mon/Tue…) → sloped (short, fits on one line)
        */}
        <AnalyticsBarChart
          data={doctors.weeklyHours}
          emptyKind="doctor-weekly-hours"
          period={period}
          xAxisLayout={isOrg ? "wrap" : "sloped"}
        />
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title={isOrg ? "Time off in period" : "Time off"}
        periodSubtitle={chartSubtitle}
        detailHint={
          isOrg
            ? "Distinct blocked days per doctor overlapping the selected chart period."
            : "Distinct blocked days for this doctor in the selected chart period."
        }
        icon={CalendarOff}
        loading={loading}
      >
        {/*
          org: labels are doctor names → wrap (multi-line word break)
          personal: labels are time-off range strings or single entry → sloped
        */}
        <AnalyticsBarChart
          data={doctors.timeOffInPeriod}
          emptyKind="doctor-time-off"
          period={period}
          xAxisLayout={isOrg ? "wrap" : "sloped"}
        />
      </AnalyticsChartCard>
    </div>
  );
}
