"use client";

import { Building2, Receipt, Shield, Stethoscope, Users, Wallet } from "lucide-react";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import { useOrganizationMetricsContext } from "@/context/OrganizationMetricsContext";
import { formatInvoiceMoney } from "@/lib/crud-notify-messages";

/** Stat strip under page title — reads OrganizationMetricsContext (invalidates with org list). */
export function OrganizationManagementStatsRow() {
  const { metrics, listBodyLoading } = useOrganizationMetricsContext();
  const skeleton = listBodyLoading;
  const outstanding = formatInvoiceMoney({
    amount: metrics.totalOutstandingCents,
    currency: "eur",
    unit: "cents",
  });

  return (
    <div className="grid grid-cols-1 gap-2 overflow-visible sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <PatientStatCard
        variant="violet"
        icon={Building2}
        title="Total Organisations"
        subtitle="Clinics You Can Access"
        value={metrics.totalOrgs}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="violet"
        icon={Users}
        title="Total Members"
        subtitle="Across All Organisations"
        value={metrics.totalMembers}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="sky"
        icon={Shield}
        title="Admins"
        subtitle="Organisation Administrators"
        value={metrics.totalAdmins}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="emerald"
        icon={Stethoscope}
        title="Doctors"
        subtitle="Doctor Members"
        value={metrics.totalDoctors}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="amber"
        icon={Receipt}
        title="Invoices"
        subtitle="Tagged To Organisations"
        value={metrics.totalInvoices}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="sky"
        icon={Wallet}
        title="Outstanding"
        subtitle="Draft + Sent + Overdue"
        value={metrics.totalOutstandingCents}
        valueDisplay={outstanding}
        valueSkeleton={skeleton}
      />
    </div>
  );
}
