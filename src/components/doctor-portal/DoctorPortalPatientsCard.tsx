"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { PortalPanelSection } from "@/components/shared/PortalPanelSection";
import { PatientManagementInner } from "@/components/control-panel/PatientManagement";
import { PatientListFiltersProvider } from "@/components/control-panel/PatientListFiltersContext";
import { Skeleton } from "@/components/ui/skeleton";
import { doctorPortalPatientsPanelClass } from "@/lib/doctor-portal-layout";
import { PatientRosterStatusCountInlineRow } from "@/components/doctor-portal/PatientRosterStatusCountInlineRow";
import {
  countDoctorPortalPatientsByStatus,
  doctorPortalPatientsSectionTitle,
  DOCTOR_PORTAL_PATIENTS_SUBTITLE,
  filterDoctorPortalPatientRoster,
} from "@/lib/doctor-portal-patients-display";
import { queryKeys } from "@/lib/query-keys";
import { useQueryBodyLoading } from "@/lib/query-body-loading";

type Props = {
  doctorId: string | undefined;
  /** Signed-in doctor display name — drives possessive panel title. */
  doctorDisplayName?: string | null;
  /** Pulse table only — panel chrome stays mounted. */
  listBodyLoading?: boolean;
};

/**
 * Doctor-scoped patient roster — stacked header parity with Related Billing:
 * title · total count · Active/Inactive chip; muted subtitle below.
 */
export function DoctorPortalPatientsCard({
  doctorId,
  doctorDisplayName,
  listBodyLoading,
}: Props) {
  const { patients, isLoading } = usePatients();

  const roster = useMemo(
    () => filterDoctorPortalPatientRoster(patients, doctorId),
    [patients, doctorId]
  );

  const statusCounts = useMemo(
    () => countDoctorPortalPatientsByStatus(roster),
    [roster]
  );

  const statusChip = useMemo(
    () => <PatientRosterStatusCountInlineRow counts={statusCounts} />,
    [statusCounts]
  );

  const cacheBodyLoading = useQueryBodyLoading(queryKeys.patients.all, isLoading);
  const listLoading = listBodyLoading || cacheBodyLoading;

  return (
    <PortalPanelSection
      id="dp-my-patients"
      title={doctorPortalPatientsSectionTitle(doctorDisplayName)}
      subtitle={DOCTOR_PORTAL_PATIENTS_SUBTITLE}
      headerVariant="stacked"
      icon={Users}
      iconClassName="border-emerald-100 bg-emerald-50 [&_svg]:text-emerald-600"
      count={roster.length}
      countSkeleton={listLoading}
      statusChip={statusChip}
      statusChipSkeleton={listLoading}
      className={doctorPortalPatientsPanelClass}
      contentClassName="pt-0"
    >
      {doctorId ? (
        <PatientListFiltersProvider initialPrimaryDoctorId={doctorId} lockPrimaryDoctor>
          <PatientManagementInner
            variant="doctor-portal"
            viewerRole="doctor"
            lockedPrimaryDoctorId={doctorId}
          />
        </PatientListFiltersProvider>
      ) : (
        <div className="space-y-3" aria-hidden>
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      )}
    </PortalPanelSection>
  );
}
