"use client";

/**
 * Portal doctor detail — doctor/patient read-only; sky glass tone (patient/category parity).
 * Admin CRUD + schedule editors live on `control-panel/doctors/[id]`.
 */
import { DoctorDetailScreenShared } from "@/components/shared/doctor-detail/DoctorDetailScreenShared";
import type { UsersListResponse } from "@/hooks/useUsers";
import type { DoctorAssignedPatientRow } from "@/lib/doctor-assigned-patients";
import { isDoctorRole } from "@/lib/rbac";
import type { DoctorSnapshot, User } from "@/types/types";

export type DoctorDetailScreenProps = {
  doctorId: string;
  viewerRole: string | null;
  backHref: string;
  initialUser: User;
  initialSnapshot: DoctorSnapshot | null;
  initialAssignedPatients: DoctorAssignedPatientRow[];
  initialDoctorUsers?: UsersListResponse | null;
  initialAdminUsers?: UsersListResponse | null;
};

export function DoctorDetailScreen({
  doctorId,
  viewerRole,
  backHref,
  initialUser,
  initialSnapshot,
  initialAssignedPatients,
  initialDoctorUsers,
  initialAdminUsers,
}: DoctorDetailScreenProps) {
  return (
    <DoctorDetailScreenShared
      tone="sky"
      mode="portal"
      doctorId={doctorId}
      backHref={backHref}
      viewerRole={viewerRole}
      initialUser={initialUser}
      initialSnapshot={initialSnapshot}
      initialAssignedPatients={initialAssignedPatients}
      showAssignedPatientsSection={isDoctorRole(viewerRole)}
      initialDoctorUsers={initialDoctorUsers}
      initialAdminUsers={initialAdminUsers}
    />
  );
}
