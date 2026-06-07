"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarClock,
  FileText,
  Fingerprint,
  List,
  Lock,
  Pencil,
  Phone,
  Receipt,
  Share2,
  Stethoscope,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import { BackNavigationLink } from "@/components/shared/BackNavigationLink";
import { useRouter, useSearchParams } from "next/navigation";
import { usePatient, usePatientSnapshot } from "@/hooks/usePatients";
import { EntityDetailChromeHeader } from "@/components/shared/entity-detail/EntityDetailChromeHeader";
import {
  entityDetailChromeSkyIconClass,
  entityDetailChromeSkyIconTileClass,
} from "@/lib/page-chrome-classes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PatientFormDialog } from "@/components/control-panel/patient-dialog/PatientFormDialog";
import {
  buildClinicalProfileFromDialogExtra,
  EMPTY_PATIENT_DIALOG_EXTRA,
  EMPTY_PATIENT_DIALOG_FORM,
  patientToDialogExtraState,
  patientToDialogFormState,
} from "@/lib/patient-form-clinical";
import type { PatientCreateInput } from "@/hooks/usePatients";
import type { DoctorPrefetchRow } from "@/lib/server-prefetch";
import type { UsersListResponse } from "@/hooks/useUsers";
import {
  buildStaffDirectoryMap,
  hasPrimaryDoctorProfileExtras,
  resolvePrimaryDoctorIdentity,
} from "@/lib/staff-directory-cache";
import { seedUsersListCache } from "@/lib/ssr-query-seed";
import { DoctorIdentityRow } from "@/components/shared/doctor-display/DoctorIdentityRow";
import { ClinicalDataTable } from "@/components/shared/ClinicalDataTable";
import {
  buildPatientInvoicesColumns,
  buildRelatedAppointmentsColumns,
  CategoryTableCell,
} from "@/components/control-panel/patient-detail-snapshot-columns";
import {
  ClinicalEmptyDash,
  clinicalEmptyOr,
  clinicalEmptyOrNode,
} from "@/components/shared/ClinicalTableEmptyDash";
import { clinicalHasListValue, clinicalHasTextValue } from "@/lib/clinical-empty-value";
import { PatientPortraitAvatar } from "@/components/shared/person-display/PatientPortraitAvatar";
import { useUsers } from "@/hooks/useUsers";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { usePatients } from "@/hooks/usePatients";
import {
  getPatientCareLevelLabel,
  hasPatientCareLevel,
} from "@/lib/patient-care-level";
import { PATIENT_REFERRAL_SOURCES } from "@/lib/patient-referral-sources";
import { patientAgeYears } from "@/lib/patient-age";
import { skyGlassBackButtonClass, skyGlassTableFrameClass } from "@/lib/calendar-header-action-styles";
import {
  patientDetailDefinitionRowClass,
  patientDetailPrimaryDoctorRowClass,
  patientDetailSchemaSectionClass,
  patientDetailSnapshotTableFrameClass,
  entityDetailActionsRowClass,
  entityDetailPageHeaderClass,
  patientDetailDefinitionListClass,
  entityDetailFieldIconCircleClass,
  entityDetailSnapshotSectionShellClass,
} from "@/lib/patient-detail-ui-classes";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { EntityDetailRecordAuditCard } from "@/components/shared/entity-detail/EntityDetailRecordAuditCard";
import { EntityIdCopyInline } from "@/components/shared/EntityIdCopyInline";
import { mapPatientRecordAuditActors } from "@/lib/entity-detail-audit-actor";
import { EntityDetailSnapshotSectionHeading } from "@/components/shared/entity-detail/EntityDetailSnapshotSectionHeading";
import { entityDetailOwnedSnapshotSectionTitle } from "@/lib/entity-detail-snapshot-section-copy";
import { cn } from "@/lib/utils";
import {
  resolveEntityDetailRootClass,
  type AppSectionScrollShell,
} from "@/lib/section-page-layout";
import { patientDetailHref, type EntityRole } from "@/lib/entity-routes";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";
import type { PatientAccessLevel } from "@/lib/patient-access";
import { isValidUUID } from "@/lib/validation";

/** Must match `useUsers` filters on this screen — SSR seeds the same query keys. */
const PATIENT_DETAIL_DOCTOR_USERS_FILTERS = { role: "doctor" as const, limit: 200 };
const PATIENT_DETAIL_ADMIN_USERS_FILTERS = { role: "admin" as const, limit: 50 };
import { invalidateQueriesForRoute } from "@/lib/query-client";
import { prefetchDoctorsDirectory } from "@/lib/prefetch-doctors-directory";
import { validateOptionalPatientPhoneInput } from "@/lib/phone-validation";
import { notify } from "@/lib/notify";
import { clinicalSnapshotAppointmentsTableMinWidthClass } from "@/lib/clinical-snapshot-table-columns";
import type { Patient, PatientSnapshot } from "@/types/types";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

function FieldLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500 sm:pt-0.5">
      <span className={entityDetailFieldIconCircleClass}>
        <Icon className="h-3 w-3 text-sky-600" aria-hidden />
      </span>
      {children}
    </dt>
  );
}

/** Label (left) + value (right) on one row — matches patient detail screenshots. */
function PatientDetailDefinitionRow({
  icon,
  label,
  children,
  rowClassName = patientDetailDefinitionRowClass,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  rowClassName?: string;
}) {
  return (
    <div className={rowClassName}>
      <FieldLabel icon={icon}>{label}</FieldLabel>
      <dd className="min-w-0 text-gray-700">{children}</dd>
    </div>
  );
}

/** Referral source + detail — uses shared `clinicalEmptyOrNode` when both empty. */
function renderPatientReferralValue(cp: Patient["clinical_profile"]) {
  const source =
    cp && typeof cp === "object" && typeof cp.referral_source === "string"
      ? cp.referral_source.trim()
      : "";
  const detail =
    cp && typeof cp === "object" && typeof cp.referral_detail === "string"
      ? cp.referral_detail.trim()
      : "";
  const label = source
    ? (PATIENT_REFERRAL_SOURCES.find((x) => x.value === source)?.label ?? source)
    : "";
  return clinicalEmptyOrNode(
    Boolean(label || detail),
    (
      <>
        {label}
        {detail ? `${label ? " — " : ""}${detail}` : null}
      </>
    ),
    "definition"
  );
}

function SectionHeading({
  icon: Icon,
  children,
  count,
  countSkeleton,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  count?: number;
  countSkeleton?: boolean;
}) {
  return (
    <EntityDetailSnapshotSectionHeading
      icon={Icon}
      count={count}
      countSkeleton={countSkeleton}
    >
      {children}
    </EntityDetailSnapshotSectionHeading>
  );
}

/** Pulse placeholders only — page chrome (header, card, footer bar) stays fixed to avoid layout flash. */
function PatientDetailBodySkeleton() {
  return (
    <div className="space-y-3 text-gray-700">
      {/* Keep static schema labels/icons visible; only value slots skeletonize during refresh. */}
      <dl className={patientDetailDefinitionListClass}>
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2 text-gray-700">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <span className={entityDetailFieldIconCircleClass}>
              <CalendarClock className="h-3 w-3 text-sky-600" aria-hidden />
            </span>
            Record Audit
          </div>
          <div className="mt-1 space-y-1 text-gray-700">
            <Skeleton className="h-5 w-full max-w-[560px] rounded-md" />
            <Skeleton className="h-5 w-full max-w-[560px] rounded-md" />
          </div>
        </div>
        <div className={patientDetailDefinitionRowClass}>
          <FieldLabel icon={Fingerprint}>Patient ID</FieldLabel>
          <Skeleton className="h-4 w-full max-w-[320px] sm:mt-0.5" />
        </div>
        <div className={patientDetailDefinitionRowClass}>
          <FieldLabel icon={Calendar}>Birth Date</FieldLabel>
          <Skeleton className="h-4 w-32 sm:mt-0.5" />
        </div>
        <div className={patientDetailDefinitionRowClass}>
          <FieldLabel icon={Activity}>Care Tier (1–10)</FieldLabel>
          <Skeleton className="h-4 w-44 sm:mt-0.5" />
        </div>
        <div className={patientDetailDefinitionRowClass}>
          <FieldLabel icon={User}>Pronoun</FieldLabel>
          <Skeleton className="h-4 w-24 sm:mt-0.5" />
        </div>
        <div className={patientDetailDefinitionRowClass}>
          <FieldLabel icon={Tag}>Category</FieldLabel>
          <Skeleton className="h-4 w-40 sm:mt-0.5" />
        </div>
        <div className={patientDetailDefinitionRowClass}>
          <FieldLabel icon={Stethoscope}>Primary Doctor</FieldLabel>
          <Skeleton className="h-4 w-56 sm:mt-0.5" />
        </div>
        <div className={patientDetailDefinitionRowClass}>
          <FieldLabel icon={Share2}>Referral</FieldLabel>
          <Skeleton className="h-4 w-64 sm:mt-0.5" />
        </div>
        <div className={patientDetailDefinitionRowClass}>
          <FieldLabel icon={AlertCircle}>Allergies</FieldLabel>
          <Skeleton className="h-4 w-full max-w-[240px] sm:mt-0.5" />
        </div>
        <div className={patientDetailDefinitionRowClass}>
          <FieldLabel icon={FileText}>Clinical Notes</FieldLabel>
          <Skeleton className="h-4 w-full max-w-[620px] sm:mt-0.5" />
        </div>
      </dl>

    </div>
  );
}

type PatientDetailScreenProps = {
  patientId: string;
  /** Resolved on SSR — drives read-only banner and footer CRUD visibility. */
  accessLevel: PatientAccessLevel;
  /** Session role — drives `/control-panel/*` vs portal detail hrefs in related tables. */
  viewerRole: string | null;
  /** List back-navigation target (admin → patient management, doctor → doctor portal). */
  listBackHref: string;
  /**
   * Server-prefetched patient record — seeds queryKeys.patients.detail(patientId)
   * so usePatient() finds data immediately without a network request.
   */
  initialPatient?: Patient | null;
  /**
   * Server-prefetched snapshot (appointments, activities, invoices) — seeds
   * queryKeys.patients.snapshot(patientId) so the tables render on first paint.
   */
  initialSnapshot?: PatientSnapshot | null;
  /** SSR doctor directory — seeds `queryKeys.doctors.all` for portrait resolution in snapshot tables. */
  initialDoctors?: { doctors: DoctorPrefetchRow[] } | null;
  /** SSR users list — seeds `useUsers({ role: "doctor" })` for identity rows without fetch flash. */
  initialDoctorUsers?: UsersListResponse | null;
  /** SSR admin users — calendar owners in snapshot tables may be admin accounts. */
  initialAdminUsers?: UsersListResponse | null;
  /** SSR scroll shell — CP right pane needs bottom inset; portal uses `dashboardShellClass`. */
  scrollShell?: AppSectionScrollShell;
};

export function PatientDetailScreen({
  patientId,
  accessLevel,
  viewerRole,
  listBackHref,
  scrollShell = "portal",
  initialPatient,
  initialSnapshot,
  initialDoctors,
  initialDoctorUsers,
  initialAdminUsers,
}: PatientDetailScreenProps) {
  const sectionRootClass = resolveEntityDetailRootClass(scrollShell);

  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const rosterDoctorIdRaw = searchParams.get("fromDoctor");
  const rosterDoctorId =
    rosterDoctorIdRaw && isValidUUID(rosterDoctorIdRaw) ? rosterDoctorIdRaw : null;
  const canEdit = accessLevel === "mutate";

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [dialogForm, setDialogForm] = useState<PatientCreateInput>(EMPTY_PATIENT_DIALOG_FORM);
  const [dialogExtra, setDialogExtra] = useState(EMPTY_PATIENT_DIALOG_EXTRA);

  /**
   * Seed the TanStack Query cache with server-prefetched data before the first
   * paint. useLayoutEffect fires synchronously after DOM mutations so the hooks
   * below (usePatient / usePatientSnapshot) find their data already populated —
   * no loading flash, no extra round-trip on first visit.
   */
  useLayoutEffect(() => {
    if (initialPatient != null) {
      queryClient.setQueryData(queryKeys.patients.detail(patientId), initialPatient);
    }
    if (initialSnapshot != null) {
      queryClient.setQueryData(queryKeys.patients.snapshot(patientId), initialSnapshot);
    }
    if (initialDoctors != null) {
      queryClient.setQueryData(queryKeys.doctors.all, initialDoctors);
    }
    if (initialDoctorUsers != null) {
      seedUsersListCache(queryClient, PATIENT_DETAIL_DOCTOR_USERS_FILTERS, initialDoctorUsers);
    }
    if (initialAdminUsers != null) {
      seedUsersListCache(queryClient, PATIENT_DETAIL_ADMIN_USERS_FILTERS, initialAdminUsers);
    }
  }, [
    queryClient,
    patientId,
    initialPatient,
    initialSnapshot,
    initialDoctors,
    initialDoctorUsers,
    initialAdminUsers,
  ]);

  const { data: patient, isLoading, isError, error } = usePatient(patientId, rosterDoctorId, {
    initialData: initialPatient ?? undefined,
  });
  const snap = usePatientSnapshot(patientId, rosterDoctorId, {
    initialData: initialSnapshot ?? undefined,
  });
  const staffViewer = isAdminRole(viewerRole) || isDoctorRole(viewerRole);
  const { data: doctorsData } = useUsers(PATIENT_DETAIL_DOCTOR_USERS_FILTERS, {
    initialData: initialDoctorUsers ?? undefined,
  });
  const { data: adminUsersData } = useUsers(PATIENT_DETAIL_ADMIN_USERS_FILTERS, {
    initialData: initialAdminUsers ?? undefined,
    enabled: staffViewer,
  });

  /** Doctors + admins — calendar owners may be admin; SSR prefetch merged before client fetch. */
  const staffById = useMemo(
    () =>
      buildStaffDirectoryMap({
        initialDoctors,
        doctorUsers: doctorsData?.users ?? initialDoctorUsers?.users,
        adminUsers: adminUsersData?.users ?? initialAdminUsers?.users,
      }),
    [
      initialDoctors,
      doctorsData?.users,
      adminUsersData?.users,
      initialDoctorUsers?.users,
      initialAdminUsers?.users,
    ]
  );

  const primaryDoctorIdentity = useMemo(() => {
    if (!patient) return null;
    return resolvePrimaryDoctorIdentity(patient, staffById);
  }, [patient, staffById]);

  const showPrimaryDoctorExtras = hasPrimaryDoctorProfileExtras(primaryDoctorIdentity);

  /** Record Audit actors — denormalized on `Patient` from SSR/API (`patientAuditUserPick`). */
  const recordAuditActors = useMemo(
    () => (patient ? mapPatientRecordAuditActors(patient) : { createdBy: null, updatedBy: null }),
    [patient]
  );

  /** Latest appointment category for schema block (primary doctor sits on the row below). */
  const schemaCategory = useMemo(() => {
    const row = (snap.data?.appointments ?? []).find((a) => a.category_label?.trim());
    if (!row?.category_label?.trim()) return null;
    return {
      id: row.category ?? null,
      label: row.category_label.trim(),
      color: row.category_color ?? null,
      icon: row.category_icon ?? null,
    };
  }, [snap.data?.appointments]);
  const { deletePatient, isDeleting, isUpdating, updatePatient } = usePatients();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Hydration guard: defer mounted flip to next frame to avoid sync setState-in-effect lint.
    const raf = window.requestAnimationFrame(() => setIsMounted(true));
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const hasPatient = Boolean(patient);
  /** Data slots only — footer/header actions stay mounted (SSR `initialData` + cache). */
  const showBodySkeleton = !hasPatient && (isLoading || !isMounted);
  const showLiveBody = hasPatient && (isMounted || initialPatient != null);
  const p = patient as Patient | undefined;
  const footerActionsDisabled = !hasPatient || isDeleting || isUpdating;

  const openEditDialog = useCallback(() => {
    if (!canEdit || !p) return;
    // Warm doctor directory before picker opens (SSR seed may be stale after long sessions).
    prefetchDoctorsDirectory(queryClient);
    setDialogForm(patientToDialogFormState(p));
    setDialogExtra(patientToDialogExtraState(p));
    setEditDialogOpen(true);
  }, [canEdit, p, queryClient]);

  const handleEditDialogOpenChange = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open && p) {
      setDialogForm(patientToDialogFormState(p));
      setDialogExtra(patientToDialogExtraState(p));
    }
  };

  const handleEditDialogSubmit = () => {
    if (!p) return;
    const phoneError = validateOptionalPatientPhoneInput(dialogForm.phone);
    if (phoneError) {
      notify.error({ title: "Invalid phone", subtitle: phoneError });
      return;
    }
    const primary_doctor_id =
      dialogExtra.primaryDoctorId && dialogExtra.primaryDoctorId !== "none"
        ? dialogExtra.primaryDoctorId
        : null;
    const clinical_profile = buildClinicalProfileFromDialogExtra(p.clinical_profile, dialogExtra);
    updatePatient(
      {
        id: p.id,
        firstname: dialogForm.firstname.trim(),
        lastname: dialogForm.lastname.trim(),
        birth_date: dialogForm.birth_date || undefined,
        care_level: dialogForm.care_level,
        pronoun: dialogForm.pronoun || undefined,
        phone: dialogForm.phone?.trim() || undefined,
        active: dialogForm.active,
        clinical_profile,
        primary_doctor_id,
      },
      { onSuccess: () => setEditDialogOpen(false) }
    );
  };

  const didOpenEditFromUrlRef = useRef(false);
  /** Legacy `?mode=edit` deep links open the shared glass dialog (not inline form). */
  useEffect(() => {
    if (didOpenEditFromUrlRef.current) return;
    if (!canEdit || searchParams.get("mode") !== "edit" || !p) return;
    didOpenEditFromUrlRef.current = true;
    const raf = window.requestAnimationFrame(() => {
      openEditDialog();
      const q = new URLSearchParams();
      if (rosterDoctorId) q.set("fromDoctor", rosterDoctorId);
      const qs = q.toString();
      router.replace(`${patientDetailHref(viewerRole, patientId)}${qs ? `?${qs}` : ""}`);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [canEdit, searchParams, p, rosterDoctorId, router, viewerRole, patientId, openEditDialog]);
  const nameLabel = p ? `${p.firstname} ${p.lastname}`.trim() : "";
  const age = p ? patientAgeYears(p.birth_date) : null;

  const patientDisplayName =
    nameLabel.trim() ||
    `${snap.data?.patient?.firstname ?? ""} ${snap.data?.patient?.lastname ?? ""}`.trim() ||
    "—";

  const appointmentColumns = useMemo(
    () =>
      buildRelatedAppointmentsColumns({
        viewerRole,
        patientDisplayName,
        staffById,
        pagePatient: p
          ? {
              id: p.id,
              firstname: p.firstname,
              lastname: p.lastname,
              email: p.email,
              birth_date: p.birth_date,
              clinical_profile: p.clinical_profile,
            }
          : null,
        // Page is scoped to one patient — title column shows visit type + status only.
        titleColumn: { showPatientIdentity: false },
      }),
    [viewerRole, patientDisplayName, staffById, p]
  );

  const invoiceColumns = useMemo(
    () => buildPatientInvoicesColumns(viewerRole),
    [viewerRole]
  );

  const appointmentTotalCount =
    snap.data?.appointmentTotalCount ?? snap.data?.appointments?.length ?? 0;
  const invoiceTotalCount = snap.data?.invoiceTotalCount ?? snap.data?.invoices?.length ?? 0;
  const snapshotSectionsLoading = snap.isLoading && !snap.data;

  const relatedAppointmentsSectionTitle = entityDetailOwnedSnapshotSectionTitle(
    patientDisplayName,
    "relatedAppointments",
    "patient"
  );
  const relatedInvoicesSectionTitle = entityDetailOwnedSnapshotSectionTitle(
    patientDisplayName,
    "relatedInvoicesViaAppointments",
    "patient"
  );

  const cp = p?.clinical_profile;

  if (isError) {
    return (
      <div className="py-4 text-gray-700">
        <p className="text-destructive">
          {error instanceof Error ? error.message : "Failed to load patient."}
        </p>
      </div>
    );
  }

  return (
    <div className={sectionRootClass}>
      <EntityDetailChromeHeader
        className={entityDetailPageHeaderClass}
        icon={User}
        iconTileClassName={entityDetailChromeSkyIconTileClass}
        iconClassName={entityDetailChromeSkyIconClass}
        title={
          showLiveBody ? (
            nameLabel || "—"
          ) : (
            <Skeleton className="h-7 w-56 max-w-full" aria-hidden />
          )
        }
        description="Patient Record — Schema Fields, Clinical Profile, Related Activity"
        actions={
          <BackNavigationLink
            href={listBackHref}
            className={cn(skyGlassBackButtonClass, "no-underline")}
          >
            <ArrowLeft className="shrink-0" aria-hidden />
            Back
          </BackNavigationLink>
        }
      />

      {accessLevel === "view" && showLiveBody && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-900">
          <Lock className="h-4 w-4 shrink-0" aria-hidden />
          Read-only — you can view this patient chart but only the primary doctor or an admin can
          update or delete it.
        </div>
      )}

      <Card
        className={cn(
          "flex-1 border-sky-100/50 bg-white/90 text-gray-700",
          skyGlassTableFrameClass
        )}
      >
        <CardContent className="space-y-3 px-4 sm:px-6 text-gray-700">
          {/* Keep section title inside the same content flow to avoid top-strip jump on refresh. */}
          <div className="min-h-6">
            {/* Static heading should stay rendered even while values are loading. */}
            <h2 className="text-lg font-semibold text-gray-700">Patient Details</h2>
          </div>
          <div className={patientDetailSchemaSectionClass}>
          <div className="flex items-center gap-2">
            {showLiveBody && p ? (
              <PatientPortraitAvatar patient={p} sizeClassName="h-16 w-16" />
            ) : (
              <Skeleton className="h-16 w-16 shrink-0 rounded-full" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              {showLiveBody ? (
                <>
                  <p className="text-lg font-semibold text-gray-700">
                    {clinicalEmptyOr(nameLabel, "inline")}
                  </p>
                  <p className="text-sm text-gray-600">{clinicalEmptyOr(p!.email, "inline")}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {age != null ? (
                      <Badge
                        variant="outline"
                        className="border-sky-200/80 bg-sky-50/90 text-xs font-normal text-gray-700"
                      >
                        Age {age}
                      </Badge>
                    ) : null}
                    <Badge
                      variant="outline"
                      className={
                        p!.active
                          ? "border-emerald-200 bg-emerald-50 text-xs font-normal text-emerald-800"
                          : "border-slate-200 bg-slate-50 text-xs font-normal text-gray-700"
                      }
                    >
                      {p!.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </>
              ) : (
                <div>
                  {/*
                   * No space-y here — Tailwind resets <p> margin to 0, so real text blocks
                   * stack with no gap. Skeleton must do the same to avoid a 4px height surplus
                   * that shifts all content below on the skeleton→live swap.
                   */}
                  <Skeleton className="h-7 w-40 rounded-md" />
                  <Skeleton className="mt-0 h-5 w-52 rounded-md" />
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {showBodySkeleton ? (
            <PatientDetailBodySkeleton />
          ) : (
            <>
              <dl className={patientDetailDefinitionListClass}>
                <EntityDetailRecordAuditCard
                  createdAt={p!.created_at}
                  updatedAt={p!.updated_at}
                  createdBy={recordAuditActors.createdBy}
                  updatedBy={recordAuditActors.updatedBy}
                  viewerRole={viewerRole as EntityRole}
                />
                <PatientDetailDefinitionRow icon={Fingerprint} label="Patient ID">
                  <EntityIdCopyInline value={p!.id} />
                </PatientDetailDefinitionRow>
                <PatientDetailDefinitionRow icon={Calendar} label="Birth Date">
                  {clinicalEmptyOr(p!.birth_date, "definition")}
                </PatientDetailDefinitionRow>
                <PatientDetailDefinitionRow icon={Activity} label="Care Tier (1–10)">
                  {clinicalEmptyOrNode(
                    hasPatientCareLevel(p!.care_level),
                    () => getPatientCareLevelLabel(p!.care_level!),
                    "definition"
                  )}
                </PatientDetailDefinitionRow>
                <PatientDetailDefinitionRow icon={User} label="Pronoun">
                  {clinicalEmptyOr(p!.pronoun, "definition")}
                </PatientDetailDefinitionRow>
                <PatientDetailDefinitionRow icon={Phone} label="Contact Phone">
                  {clinicalEmptyOr(p!.phone, "definition")}
                </PatientDetailDefinitionRow>
                <PatientDetailDefinitionRow icon={Tag} label="Category">
                  <CategoryTableCell
                    label={schemaCategory?.label}
                    color={schemaCategory?.color}
                    icon={schemaCategory?.icon}
                    categoryId={schemaCategory?.id}
                    viewerRole={viewerRole as EntityRole}
                    emptyLayout="definition"
                    markVariant="brand"
                    markSize="compact"
                  />
                </PatientDetailDefinitionRow>
                <PatientDetailDefinitionRow
                  icon={Stethoscope}
                  label="Primary Doctor"
                  rowClassName={patientDetailPrimaryDoctorRowClass}
                >
                  {primaryDoctorIdentity ? (
                    <div className="space-y-2">
                      <DoctorIdentityRow
                        layout="inline"
                        doctor={primaryDoctorIdentity}
                        linkKind={isAdminRole(viewerRole) ? "admin-cp" : "role"}
                        showEmail
                        showSpecialty
                      />
                      {showPrimaryDoctorExtras ? (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl border border-emerald-100/60 bg-emerald-50/30 p-2 text-xs">
                        {primaryDoctorIdentity.phone ? (
                          <div className="flex items-center gap-1 text-gray-600">
                            <span className="font-medium text-gray-500">Phone:</span>
                            {primaryDoctorIdentity.phone}
                          </div>
                        ) : null}
                        {primaryDoctorIdentity.office_location ? (
                          <div className="flex items-center gap-1 text-gray-600">
                            <span className="font-medium text-gray-500">Office:</span>
                            {primaryDoctorIdentity.office_location}
                          </div>
                        ) : null}
                        {(primaryDoctorIdentity.consultation_fee ?? 0) > 0 ? (
                          <div className="flex items-center gap-1 text-gray-600">
                            <span className="font-medium text-gray-500">Fee:</span>
                            <span className="font-semibold text-emerald-700">
                              €{((primaryDoctorIdentity.consultation_fee ?? 0) / 100).toFixed(2)}
                            </span>
                          </div>
                        ) : null}
                        {primaryDoctorIdentity.years_of_experience != null ? (
                          <div className="flex items-center gap-1 text-gray-600">
                            <span className="font-medium text-gray-500">Exp:</span>
                            {primaryDoctorIdentity.years_of_experience} yrs
                          </div>
                        ) : null}
                        {(primaryDoctorIdentity.languages_spoken ?? []).length > 0 ? (
                          <div className="col-span-2 flex flex-wrap gap-1 pt-0.5">
                            {(primaryDoctorIdentity.languages_spoken ?? []).map((lang) => (
                              <span key={lang} className="rounded-full border border-sky-200/70 bg-sky-50/80 px-2 py-0.5 text-[10px] font-normal text-sky-700">
                                {lang}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      ) : null}
                    </div>
                  ) : (
                    clinicalEmptyOr(p!.primary_doctor_display, "definition")
                  )}
                </PatientDetailDefinitionRow>
                <PatientDetailDefinitionRow icon={Share2} label="Referral">
                  {renderPatientReferralValue(cp)}
                </PatientDetailDefinitionRow>
                <PatientDetailDefinitionRow icon={AlertCircle} label="Allergies">
                  {clinicalEmptyOrNode(
                    Boolean(cp && typeof cp === "object" && clinicalHasListValue(cp.allergies)),
                    cp && typeof cp === "object" && Array.isArray(cp.allergies)
                      ? cp.allergies.join(", ")
                      : null,
                    "definition"
                  )}
                </PatientDetailDefinitionRow>
                <PatientDetailDefinitionRow icon={FileText} label="Clinical Notes">
                  {clinicalEmptyOrNode(
                    Boolean(cp && typeof cp === "object" && clinicalHasTextValue(cp.notes)),
                    <span className="whitespace-pre-wrap">
                      {cp && typeof cp === "object" && typeof cp.notes === "string" ? cp.notes : ""}
                    </span>,
                    "definition"
                  )}
                </PatientDetailDefinitionRow>
              </dl>
            </>
          )}
          </div>

          {hasPatient ? (
            <>
              <div className={entityDetailSnapshotSectionShellClass}>
                <SectionHeading
                  icon={Calendar}
                  count={appointmentTotalCount}
                  countSkeleton={snapshotSectionsLoading}
                >
                  {relatedAppointmentsSectionTitle}
                </SectionHeading>
                <ClinicalDataTable
                  columns={appointmentColumns}
                  data={(snap.data?.appointments ?? []).slice(0, 12)}
                  isLoading={snap.isLoading}
                  pagination={false}
                  tableLayout="fixed"
                  emptyMessage="No Appointments"
                  tableClassName={cn(clinicalSnapshotAppointmentsTableMinWidthClass, "w-full")}
                  className={patientDetailSnapshotTableFrameClass}
                  tableFrameClassName="rounded-md border border-slate-200/80 bg-white shadow-none"
                />
              </div>

              <div className={entityDetailSnapshotSectionShellClass}>
                <SectionHeading
                  icon={Receipt}
                  count={invoiceTotalCount}
                  countSkeleton={snapshotSectionsLoading}
                >
                  {relatedInvoicesSectionTitle}
                </SectionHeading>
                <ClinicalDataTable
                  columns={invoiceColumns}
                  data={(snap.data?.invoices ?? []).slice(0, 12)}
                  isLoading={snap.isLoading}
                  pagination={false}
                  emptyMessage="No Invoices"
                  tableClassName="min-w-[720px] w-full"
                  className={patientDetailSnapshotTableFrameClass}
                  tableFrameClassName="rounded-md border border-slate-200/80 bg-white shadow-none"
                />
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Actions — inline row after card (no separate footer bar layer). */}
      <div className={entityDetailActionsRowClass}>
        <BackNavigationLink
          href={listBackHref}
          className={cn(skyGlassBackButtonClass, "no-underline")}
        >
          <List className="shrink-0" aria-hidden />
          Back To List
        </BackNavigationLink>
        {canEdit ? (
          <div className="flex flex-wrap gap-2">
              <ControlPanelGlassActionButton
                type="button"
                variant="emerald"
                onClick={openEditDialog}
                disabled={footerActionsDisabled}
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Pencil className="shrink-0" aria-hidden />
                Update Profile
              </ControlPanelGlassActionButton>
              <ConfirmActionDialog
                trigger={
                  <ControlPanelGlassActionButton
                    type="button"
                    variant="rose"
                    disabled={footerActionsDisabled}
                    className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="shrink-0" aria-hidden />
                    {isDeleting ? "Deleting…" : "Delete"}
                  </ControlPanelGlassActionButton>
                }
                title="Permanently Remove This Patient?"
                subtitle={
                  <>
                    This will delete{" "}
                    <span className="text-gray-700">
                      {p
                        ? `${p.firstname} ${p.lastname}`.trim() + (p.email ? ` (${p.email})` : "")
                        : "this patient"}
                    </span>{" "}
                    and all related data. You cannot undo this action.
                  </>
                }
                confirmLabel="Delete"
                onConfirm={() => {
                  if (!p) return;
                  deletePatient(
                    {
                      id: p.id,
                      name: `${p.firstname} ${p.lastname}`.trim(),
                      email: p.email,
                    },
                    {
                      onSuccess: async () => {
                        await invalidateQueriesForRoute(queryClient, listBackHref);
                        router.push(listBackHref);
                      },
                    }
                  );
                }}
              />
            </div>
          ) : null}
      </div>

      {canEdit && p ? (
        <PatientFormDialog
          open={editDialogOpen}
          onOpenChange={handleEditDialogOpenChange}
          mode="edit"
          readOnlyEmail={p.email}
          form={dialogForm}
          onFormChange={(patch) => setDialogForm((prev) => ({ ...prev, ...patch }))}
          createExtra={dialogExtra}
          onCreateExtraChange={(patch) => setDialogExtra((x) => ({ ...x, ...patch }))}
          onSubmit={handleEditDialogSubmit}
          isSubmitting={isUpdating}
        />
      ) : null}
    </div>
  );
}
