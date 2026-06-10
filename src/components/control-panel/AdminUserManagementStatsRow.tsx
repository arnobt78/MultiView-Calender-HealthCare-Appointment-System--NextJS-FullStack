"use client";

import { CheckCircle2, ShieldCheck, ShieldOff, Users } from "lucide-react";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import type { User } from "@/types/types";
import { isUserAccountActive } from "@/lib/entity-active-status";

type Props = {
  users: User[];
  valueSkeleton: boolean;
};

/** KPI strip for user-admin-management — glass tiles with slate/violet/emerald/sky tones. */
export function AdminUserManagementStatsRow({ users, valueSkeleton }: Props) {
  const active = users.filter((u) => isUserAccountActive(u)).length;
  const inactive = users.length - active;
  const verified = users.filter((u) => u.email_verified === true).length;

  return (
    <div className="grid grid-cols-1 gap-2 overflow-visible sm:grid-cols-2 lg:grid-cols-4">
      <PatientStatCard
        variant="violet"
        icon={Users}
        title="Total Admins"
        subtitle="B2B Admin Accounts In Workspace"
        value={users.length}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="emerald"
        icon={CheckCircle2}
        title="Active"
        subtitle="Accounts Marked Active"
        value={active}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="amber"
        icon={ShieldOff}
        title="Inactive"
        subtitle="Deactivated Or Paused Access"
        value={inactive}
        valueSkeleton={valueSkeleton}
      />
      <PatientStatCard
        variant="sky"
        icon={ShieldCheck}
        title="Email Verified"
        subtitle="Confirmed Sign-In Email"
        value={verified}
        valueSkeleton={valueSkeleton}
      />
    </div>
  );
}
