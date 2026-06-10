"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  BadgeDollarSign,
  BookOpen,
  Building2,
  Calendar,
  Clock,
  Hash,
  Languages,
  List,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  User as UserIcon,
  Users,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useLayoutEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { EntityDetailBackLink } from "@/components/shared/entity-detail/EntityDetailBackLink";
import { EntityDetailFooterRow } from "@/components/shared/entity-detail/EntityDetailFooterRow";
import { EntityDetailChromeHeader } from "@/components/shared/entity-detail/EntityDetailChromeHeader";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import { EntityActiveStatusBadge } from "@/components/shared/entity-display/EntityActiveStatusBadge";
import { ClinicalDataTable } from "@/components/shared/ClinicalDataTable";
import { PatientIdentityCell } from "@/components/shared/person-display/PatientIdentityCell";
import { EntityDetailSnapshotSectionHeading } from "@/components/shared/entity-detail/EntityDetailSnapshotSectionHeading";
import { EntityDetailRecordAuditCard } from "@/components/shared/entity-detail/EntityDetailRecordAuditCard";
import { EntityIdCopyInline } from "@/components/shared/EntityIdCopyInline";
import { mapUserRecordAuditActors } from "@/lib/entity-detail-audit-actor";
import { entityDetailOwnedSnapshotSectionTitle } from "@/lib/entity-detail-snapshot-section-copy";
import { buildRelatedAppointmentsColumns } from "@/components/control-panel/patient-detail-snapshot-columns";
import { buildStaffDirectoryMap } from "@/lib/staff-directory-cache";
import { seedUsersListCache } from "@/lib/ssr-query-seed";
import { clinicalEmptyOr } from "@/components/shared/ClinicalTableEmptyDash";
import { clinicalSnapshotAppointmentsTableMinWidthClass } from "@/lib/clinical-snapshot-table-columns";
import {
  entityDetailPageHeaderClass,
  entityDetailSnapshotSectionShellClass,
  patientDetailDefinitionListClass,
  patientDetailDefinitionRowClass,
  patientDetailSchemaSectionClass,
  patientDetailSnapshotTableFrameClass,
} from "@/lib/patient-detail-ui-classes";
import {
  DOCTOR_DETAIL_ADMIN_USERS_FILTERS,
  DOCTOR_DETAIL_DOCTOR_USERS_FILTERS,
  resolveDoctorDetailToneClasses,
  type DoctorDetailTone,
} from "@/lib/doctor-detail-ui-classes";
import { resolveEntityDetailRootClass, type AppSectionScrollShell } from "@/lib/section-page-layout";
import { isDoctorActive } from "@/lib/entity-active-status";
import { isDoctorRole } from "@/lib/rbac";
import { resolvePortalEntityDetailSnapshotLinkPolicy } from "@/lib/entity-detail-snapshot-links";
import { canClientFetchAdminUsersList } from "@/lib/user-list-access";
import { patientDetailHrefWithContext, type EntityRole } from "@/lib/entity-routes";
import { useUser, type UsersListResponse } from "@/hooks/useUsers";
import { useDoctorSnapshot } from "@/hooks/useDoctorSnapshot";
import { useDoctorAssignedPatients } from "@/hooks/useDoctorAssignedPatients";
import { queryKeys } from "@/lib/query-keys";
import { useQueryBodyLoading } from "@/lib/query-body-loading";
import { cn } from "@/lib/utils";
import type { DoctorAssignedPatientRow } from "@/lib/doctor-assigned-patients";
import type { DoctorSnapshot, User } from "@/types/types";
import { useUsers } from "@/hooks/useUsers";

export type DoctorDetailScreenSharedProps = {
  tone: DoctorDetailTone;
  mode: "portal" | "control-panel";
  doctorId: string;
  backHref: string;
  viewerRole: string | null;
  initialUser: User;
  initialSnapshot: DoctorSnapshot | null;
  initialAssignedPatients: DoctorAssignedPatientRow[];
  /** Portal: roster table only for doctor viewers; CP always shows roster. */
  showAssignedPatientsSection: boolean;
  initialDoctorUsers?: UsersListResponse | null;
  initialAdminUsers?: UsersListResponse | null;
  /** CP-only slot — availability / appointment-type editors between schema and snapshots. */
  middleSlot?: React.ReactNode;
  /** CP-only footer — admin edit / deactivate actions. */
  footerSlot?: React.ReactNode;
  /** CP demo note or other banner below page header. */
  topSlot?: React.ReactNode;
};

function FieldLabel({
  icon: Icon,
  toneClasses,
  children,
}: {
  icon: LucideIcon;
  toneClasses: ReturnType<typeof resolveDoctorDetailToneClasses>;
  children: React.ReactNode;
}) {
  return (
    <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500 sm:pt-0.5">
      <span className={toneClasses.fieldIconCircleClass}>
        <Icon className={toneClasses.fieldIconClass} aria-hidden />
      </span>
      {children}
    </dt>
  );
}

function DefinitionRow({
  icon,
  label,
  toneClasses,
  children,
}: {
  icon: LucideIcon;
  label: string;
  toneClasses: ReturnType<typeof resolveDoctorDetailToneClasses>;
  children: React.ReactNode;
}) {
  return (
    <div className={patientDetailDefinitionRowClass}>
      <FieldLabel icon={icon} toneClasses={toneClasses}>
        {label}
      </FieldLabel>
      <dd className="min-w-0 text-gray-700">{children}</dd>
    </div>
  );
}

/**
 * Shared doctor detail — schema fields, record audit, assigned patients, related appointments.
 * Portal read-only (sky); CP mounts schedule editors via `middleSlot` + admin `footerSlot`.
 */
export function DoctorDetailScreenShared({
  tone,
  mode,
  doctorId,
  backHref,
  viewerRole,
  initialUser,
  initialSnapshot,
  initialAssignedPatients,
  showAssignedPatientsSection,
  initialDoctorUsers,
  initialAdminUsers,
  middleSlot,
  footerSlot,
  topSlot,
}: DoctorDetailScreenSharedProps) {
  const toneClasses = resolveDoctorDetailToneClasses(tone);
  const scrollShell: AppSectionScrollShell =
    mode === "control-panel" ? "control-panel" : "portal";
  const queryClient = useQueryClient();
  const entityRole = (viewerRole ?? (mode === "control-panel" ? "admin" : "doctor")) as EntityRole;

  useLayoutEffect(() => {
    queryClient.setQueryData(queryKeys.users.detail(doctorId), initialUser);
    queryClient.setQueryData(
      queryKeys.doctors.assignedPatients(doctorId),
      initialAssignedPatients
    );
  }, [queryClient, doctorId, initialUser, initialAssignedPatients]);

  useLayoutEffect(() => {
    if (initialSnapshot != null) {
      queryClient.setQueryData(queryKeys.doctors.snapshot(doctorId), initialSnapshot);
    }
  }, [queryClient, doctorId, initialSnapshot]);

  useLayoutEffect(() => {
    if (initialDoctorUsers != null) {
      seedUsersListCache(queryClient, DOCTOR_DETAIL_DOCTOR_USERS_FILTERS, initialDoctorUsers);
    }
    if (initialAdminUsers != null) {
      seedUsersListCache(queryClient, DOCTOR_DETAIL_ADMIN_USERS_FILTERS, initialAdminUsers);
    }
  }, [queryClient, initialDoctorUsers, initialAdminUsers]);

  const { data: user } = useUser(doctorId, { initialData: initialUser });
  const {
    data: liveSnapshot,
    isLoading: snapshotLoading,
    isFetching: snapshotFetching,
  } = useDoctorSnapshot(doctorId, { initialData: initialSnapshot ?? undefined });
  const {
    data: assignedPatients = initialAssignedPatients,
    isLoading: assignedPatientsLoading,
  } = useDoctorAssignedPatients(doctorId, { initialData: initialAssignedPatients });

  const staffViewer = isDoctorRole(viewerRole) || viewerRole === "admin";
  const { data: doctorUsers } = useUsers(DOCTOR_DETAIL_DOCTOR_USERS_FILTERS);
  const { data: adminUsers } = useUsers(DOCTOR_DETAIL_ADMIN_USERS_FILTERS, {
    enabled: canClientFetchAdminUsersList(viewerRole),
    initialData: staffViewer ? initialAdminUsers ?? undefined : undefined,
  });

  const liveUser = user ?? initialUser;
  const displayName = liveUser.display_name?.trim() || liveUser.email;

  /** Record Audit — staff who created/updated this user row (`userDetailInclude` on SSR/API). */
  const recordAuditActors = useMemo(
    () => mapUserRecordAuditActors(liveUser),
    [liveUser]
  );
  const active = isDoctorActive(liveUser);
  const showPortalReadOnlyBanner = mode === "portal";

  const snapshot = liveSnapshot ?? initialSnapshot;
  const hasSnapshot = snapshot != null;
  const appointmentsLoading = useQueryBodyLoading(
    queryKeys.doctors.snapshot(doctorId),
    snapshotLoading || snapshotFetching
  );
  const appointmentList = snapshot?.appointments ?? [];
  const appointmentTotalCount = snapshot?.totalCount ?? 0;

  const staffById = useMemo(
    () =>
      buildStaffDirectoryMap({
        doctorUsers: doctorUsers?.users ?? null,
        adminUsers: adminUsers?.users ?? null,
      }),
    [doctorUsers?.users, adminUsers?.users]
  );

  const snapshotLinkPolicy = useMemo(
    () => (mode === "portal" ? resolvePortalEntityDetailSnapshotLinkPolicy(entityRole) : undefined),
    [mode, entityRole]
  );

  const appointmentColumns = useMemo(
    () =>
      buildRelatedAppointmentsColumns({
        viewerRole: entityRole,
        patientDisplayName: displayName,
        staffById,
        linkPolicy: snapshotLinkPolicy,
      }),
    [entityRole, displayName, staffById, snapshotLinkPolicy]
  );

  const relatedAppointmentsSectionTitle = entityDetailOwnedSnapshotSectionTitle(
    displayName,
    "relatedAppointments",
    "doctor"
  );

  const patientsSectionTitle = entityDetailOwnedSnapshotSectionTitle(
    displayName,
    "assignedPatients",
    "doctor"
  );

  const assignedPatientsLoadingUi =
    assignedPatientsLoading && assignedPatients.length === 0;

  const patientColumns: ColumnDef<DoctorAssignedPatientRow>[] = useMemo(
    () => [
      {
        id: "patient",
        header: "Patient",
        cell: ({ row }) => {
          const p = row.original;
          const href =
            mode === "control-panel"
              ? `/control-panel/patients/${p.id}`
              : patientDetailHrefWithContext(viewerRole, p.id, doctorId);
          return (
            <PatientIdentityCell
              href={href}
              name={`${p.firstname} ${p.lastname}`.trim()}
              email={p.email}
              patient={{
                id: p.id,
                firstname: p.firstname,
                lastname: p.lastname,
                email: p.email ?? "",
                birth_date: p.birth_date ?? null,
              }}
              layout="table"
            />
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <EntityActiveStatusBadge active={row.original.active !== false} />
        ),
      },
    ],
    [mode, viewerRole, doctorId]
  );

  const descriptionSubtitle =
    liveUser.specialty != null && liveUser.specialty.length > 0
      ? `${liveUser.specialty} · Doctor Record — Schema Fields, Related Activity`
      : "Doctor Record — Schema Fields, Related Activity";

  return (
    <div className={resolveEntityDetailRootClass(scrollShell)}>
      <EntityDetailChromeHeader
        className={entityDetailPageHeaderClass}
        icon={Stethoscope}
        iconTileClassName={toneClasses.chromeIconTileClass}
        iconClassName={toneClasses.chromeIconClass}
        title={displayName}
        description={descriptionSubtitle}
        actions={
          <EntityDetailBackLink
            href={backHref}
            placement="header"
            backButtonClassName={toneClasses.backButtonClass}
          />
        }
      />

      {topSlot}

      {showPortalReadOnlyBanner ? (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-900">
          <Lock className="h-4 w-4 shrink-0" aria-hidden />
          Directory profile — view schedules and related visits; profile updates are managed by
          staff.
        </div>
      ) : null}

      <Card
        className={cn(
          "flex-1 bg-white/90 text-gray-700",
          toneClasses.cardBorderClass,
          toneClasses.cardFrameClass
        )}
      >
        <CardContent className="space-y-3 px-4 sm:px-6 text-gray-700">
          <div className="min-h-6">
            <h2 className="text-lg font-semibold text-gray-700">Doctor Details</h2>
          </div>

          <div className={patientDetailSchemaSectionClass}>
            <div className="flex items-start gap-3">
              <UserAvatar
                src={liveUser.image}
                alt={displayName}
                fallbackText={displayName}
                sizeClassName="h-20 w-20"
                className={cn(
                  "rounded-xl shrink-0 ring-2",
                  tone === "emerald" ? "ring-emerald-200/70" : "ring-sky-200/70"
                )}
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-lg font-semibold">{displayName}</p>
                <p className="text-sm text-muted-foreground">{liveUser.email}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {liveUser.specialty ? (
                    <DoctorSpecialtyBadge specialty={liveUser.specialty} />
                  ) : null}
                  <EntityActiveStatusBadge active={active} />
                </div>
              </div>
            </div>

            <dl className={patientDetailDefinitionListClass}>
              <EntityDetailRecordAuditCard
                createdAt={liveUser.created_at}
                updatedAt={liveUser.updated_at}
                createdBy={recordAuditActors.createdBy}
                updatedBy={recordAuditActors.updatedBy}
                viewerRole={entityRole}
                iconCircleClass={toneClasses.fieldIconCircleClass}
                iconClassName={toneClasses.fieldIconClass}
              />

              {liveUser.bio ? (
                <DefinitionRow icon={BookOpen} label="Bio" toneClasses={toneClasses}>
                  <span className="text-sm whitespace-pre-wrap">{liveUser.bio}</span>
                </DefinitionRow>
              ) : null}
              <DefinitionRow icon={Hash} label="Doctor ID" toneClasses={toneClasses}>
                <EntityIdCopyInline value={liveUser.id} />
              </DefinitionRow>
              <DefinitionRow icon={Mail} label="Email" toneClasses={toneClasses}>
                <span className="text-sm">{liveUser.email}</span>
              </DefinitionRow>
              <DefinitionRow icon={Stethoscope} label="Specialty" toneClasses={toneClasses}>
                {clinicalEmptyOr(liveUser.specialty, "definition")}
              </DefinitionRow>
              {liveUser.phone ? (
                <DefinitionRow icon={Phone} label="Phone" toneClasses={toneClasses}>
                  <span className="text-sm">{liveUser.phone}</span>
                </DefinitionRow>
              ) : null}
              {liveUser.license_number ? (
                <DefinitionRow icon={ShieldCheck} label="License #" toneClasses={toneClasses}>
                  <span className="font-mono text-xs">{liveUser.license_number}</span>
                </DefinitionRow>
              ) : null}
              {liveUser.department ? (
                <DefinitionRow icon={Building2} label="Department" toneClasses={toneClasses}>
                  <span className="text-sm">{liveUser.department}</span>
                </DefinitionRow>
              ) : null}
              {liveUser.office_location ? (
                <DefinitionRow icon={MapPin} label="Office" toneClasses={toneClasses}>
                  <span className="text-sm">{liveUser.office_location}</span>
                </DefinitionRow>
              ) : null}
              {(liveUser.consultation_fee ?? 0) > 0 ? (
                <DefinitionRow icon={BadgeDollarSign} label="Consultation fee" toneClasses={toneClasses}>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
                      tone === "emerald"
                        ? "border-emerald-200/70 bg-emerald-50/80 text-emerald-700"
                        : "border-sky-200/70 bg-sky-50/80 text-sky-700"
                    )}
                  >
                    €{((liveUser.consultation_fee ?? 0) / 100).toFixed(2)}
                  </span>
                </DefinitionRow>
              ) : null}
              {liveUser.years_of_experience != null ? (
                <DefinitionRow icon={Clock} label="Experience" toneClasses={toneClasses}>
                  <span className="text-sm">
                    {liveUser.years_of_experience}{" "}
                    {liveUser.years_of_experience === 1 ? "year" : "years"}
                  </span>
                </DefinitionRow>
              ) : null}
              {(liveUser.languages_spoken ?? []).length > 0 ? (
                <DefinitionRow icon={Languages} label="Languages" toneClasses={toneClasses}>
                  <span className="flex flex-wrap gap-1">
                    {(liveUser.languages_spoken ?? []).map((lang) => (
                      <span
                        key={lang}
                        className="rounded-full border border-sky-200/70 bg-sky-50/80 px-2 py-0.5 text-[11px] font-normal text-sky-700"
                      >
                        {lang}
                      </span>
                    ))}
                  </span>
                </DefinitionRow>
              ) : null}
              {liveUser.created_at ? (
                <DefinitionRow icon={UserIcon} label="Joined" toneClasses={toneClasses}>
                  {format(new Date(liveUser.created_at), "PP")}
                </DefinitionRow>
              ) : null}
            </dl>
          </div>

          {middleSlot}

          {showAssignedPatientsSection ? (
            <div className={entityDetailSnapshotSectionShellClass}>
              <EntityDetailSnapshotSectionHeading
                icon={Users}
                sectionIconCircleClass={toneClasses.sectionIconCircleClass}
                iconClassName={toneClasses.sectionIconClass}
                count={assignedPatients.length}
              >
                {patientsSectionTitle}
              </EntityDetailSnapshotSectionHeading>
              <ClinicalDataTable
                columns={patientColumns}
                data={assignedPatients}
                isLoading={assignedPatientsLoadingUi}
                pagination={false}
                emptyMessage="No patients assigned as primary doctor."
                tableClassName="min-w-[520px] w-full"
                className={patientDetailSnapshotTableFrameClass}
                tableFrameClassName="rounded-md border border-slate-200/80 bg-white shadow-none"
              />
            </div>
          ) : null}

          <div className={cn("space-y-3 border-t pt-3", toneClasses.sectionDividerClass)}>
            <EntityDetailSnapshotSectionHeading
              icon={Calendar}
              sectionIconCircleClass={toneClasses.sectionIconCircleClass}
              iconClassName={toneClasses.sectionIconClass}
              count={appointmentTotalCount}
              countSkeleton={appointmentsLoading}
            >
              {relatedAppointmentsSectionTitle}
            </EntityDetailSnapshotSectionHeading>
            <ClinicalDataTable
              columns={appointmentColumns}
              data={appointmentList}
              isLoading={appointmentsLoading}
              pagination={false}
              emptyMessage="No appointments linked to this doctor yet."
              tableClassName={clinicalSnapshotAppointmentsTableMinWidthClass}
              className={patientDetailSnapshotTableFrameClass}
              tableFrameClassName="rounded-md border border-slate-200/80 bg-white shadow-none"
            />
          </div>
        </CardContent>
      </Card>

      {footerSlot ?? (
        <EntityDetailFooterRow
          backHref={backHref}
          backButtonClassName={toneClasses.backButtonClass}
        />
      )}
    </div>
  );
}
