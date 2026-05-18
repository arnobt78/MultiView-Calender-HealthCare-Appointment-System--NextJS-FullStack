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
  Loader2,
  Lock,
  Pencil,
  Receipt,
  Save,
  Share2,
  Stethoscope,
  Trash2,
  User,
  X,
} from "lucide-react";
import { BackNavigationLink } from "@/components/shared/BackNavigationLink";
import { useRouter, useSearchParams } from "next/navigation";
import { usePatient, usePatientSnapshot } from "@/hooks/usePatients";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PatientDetailForm } from "@/components/control-panel/PatientDetailForm";
import { DoctorIdentityRow } from "@/components/shared/doctor-display/DoctorIdentityRow";
import { ClinicalDataTable } from "@/components/shared/ClinicalDataTable";
import {
  buildPatientInvoicesColumns,
  buildRelatedAppointmentsColumns,
} from "@/components/control-panel/patient-detail-snapshot-columns";
import { PatientPortraitAvatar } from "@/components/shared/person-display/PatientPortraitAvatar";
import { useUsers } from "@/hooks/useUsers";
import { ControlPanelStaffLink } from "@/components/shared/ControlPanelStaffLink";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { usePatients } from "@/hooks/usePatients";
import { getPatientCareLevelLabel } from "@/lib/patient-care-level";
import { PATIENT_REFERRAL_SOURCES } from "@/lib/patient-referral-sources";
import { patientAgeYears } from "@/lib/patient-age";
import { skyGlassBackButtonClass, skyGlassTableFrameClass } from "@/lib/calendar-header-action-styles";
import { dashboardShellClass } from "@/lib/dashboard-layout";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { cn } from "@/lib/utils";
import { patientDetailHref } from "@/lib/entity-routes";
import { isAdminRole } from "@/lib/rbac";
import type { PatientAccessLevel } from "@/lib/patient-access";
import { isValidUUID } from "@/lib/validation";
import { invalidateQueriesForRoute } from "@/lib/query-client";
import type { Patient, PatientSnapshot } from "@/types/types";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

const FORM_ID = "patient-detail-form";

function FieldLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
      {/* Glassmorphic icon circle — provides visual separation without heavy weight */}
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-200/70 bg-sky-50/80 shadow-[0_2px_8px_rgba(14,165,233,0.15)]">
        <Icon className="h-3 w-3 text-sky-600" aria-hidden />
      </span>
      {children}
    </dt>
  );
}

function SectionHeading({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
      {/* Slightly larger circle for section headings */}
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky-200/70 bg-sky-50/80 shadow-[0_2px_10px_rgba(14,165,233,0.18)]">
        <Icon className="h-3.5 w-3.5 text-sky-600" aria-hidden />
      </span>
      {children}
    </h3>
  );
}

/** Pulse placeholders only — page chrome (header, card, footer bar) stays fixed to avoid layout flash. */
function PatientDetailBodySkeleton() {
  return (
    <div className="space-y-6 text-gray-700">
      {/* Keep static schema labels/icons visible; only value slots skeletonize during refresh. */}
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2 text-gray-700">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            {/* Keep audit icon style aligned with other schema icons and stable on refresh. */}
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-200/70 bg-sky-50/80 shadow-[0_2px_8px_rgba(14,165,233,0.15)]">
              <CalendarClock className="h-3 w-3 text-sky-600" aria-hidden />
            </span>
            Record Audit
          </div>
          <dd className="mt-1 space-y-1 text-gray-700">
            {/* Match real audit text rows more closely to reduce vertical shift on data hydrate. */}
            <Skeleton className="h-5 w-full max-w-[560px] rounded-md" />
            <Skeleton className="h-5 w-full max-w-[560px] rounded-md" />
          </dd>
        </div>
        <div>
          <FieldLabel icon={Fingerprint}>Patient ID</FieldLabel>
          <Skeleton className="mt-1 h-4 w-full max-w-[320px]" />
        </div>
        <div>
          <FieldLabel icon={Calendar}>Birth Date</FieldLabel>
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
        <div>
          <FieldLabel icon={Activity}>Care Tier (1–10)</FieldLabel>
          <Skeleton className="mt-1 h-4 w-44" />
        </div>
        <div>
          <FieldLabel icon={User}>Pronoun</FieldLabel>
          <Skeleton className="mt-1 h-4 w-24" />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel icon={Stethoscope}>Primary Doctor</FieldLabel>
          <Skeleton className="mt-1 h-4 w-56" />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel icon={Share2}>Referral</FieldLabel>
          <Skeleton className="mt-1 h-4 w-64" />
        </div>
        <div>
          <FieldLabel icon={AlertCircle}>Allergies</FieldLabel>
          <Skeleton className="mt-1 h-4 w-full max-w-[240px]" />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel icon={FileText}>Clinical Notes</FieldLabel>
          <Skeleton className="mt-1 h-4 w-full max-w-[620px]" />
          <Skeleton className="mt-2 h-4 w-full max-w-[540px]" />
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
};

export function PatientDetailScreen({
  patientId,
  accessLevel,
  viewerRole,
  listBackHref,
  initialPatient,
  initialSnapshot,
}: PatientDetailScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const rosterDoctorIdRaw = searchParams.get("fromDoctor");
  const rosterDoctorId =
    rosterDoctorIdRaw && isValidUUID(rosterDoctorIdRaw) ? rosterDoctorIdRaw : null;
  const canEdit = accessLevel === "mutate";
  const modeParam = searchParams.get("mode") === "edit" ? "edit" : "view";
  const mode = canEdit ? modeParam : "view";

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
  }, [queryClient, patientId, initialPatient, initialSnapshot]);

  const { data: patient, isLoading, isError, error } = usePatient(patientId, rosterDoctorId);
  const snap = usePatientSnapshot(patientId, rosterDoctorId);
  const { data: doctorsData } = useUsers({ role: "doctor", limit: 200 });
  const primaryDoctorUser = useMemo(() => {
    const id = patient?.primary_doctor_id;
    if (!id) return undefined;
    return doctorsData?.users?.find((u) => u.id === id);
  }, [patient?.primary_doctor_id, doctorsData?.users]);

  const doctorById = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        email?: string | null;
        display_name?: string | null;
        image?: string | null;
        specialty?: string | null;
      }
    >();
    for (const u of doctorsData?.users ?? []) {
      if (u.id) {
        map.set(u.id, {
          id: u.id,
          email: u.email,
          display_name: u.display_name,
          image: u.image,
          specialty: u.specialty ?? null,
        });
      }
    }
    return map;
  }, [doctorsData?.users]);
  const { deletePatient, isDeleting, isUpdating } = usePatients();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Hydration guard: defer mounted flip to next frame to avoid sync setState-in-effect lint.
    const raf = window.requestAnimationFrame(() => setIsMounted(true));
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const buildPatientUrl = (next: "view" | "edit") => {
    const q = new URLSearchParams();
    if (rosterDoctorId) q.set("fromDoctor", rosterDoctorId);
    if (next === "edit" && canEdit) q.set("mode", "edit");
    const qs = q.toString();
    return `${patientDetailHref(viewerRole, patientId)}${qs ? `?${qs}` : ""}`;
  };

  const setMode = (next: "view" | "edit") => {
    if (next === "edit" && !canEdit) return;
    router.replace(buildPatientUrl(next));
  };

  useEffect(() => {
    if (canEdit || modeParam !== "edit") return;
    const q = new URLSearchParams();
    if (rosterDoctorId) q.set("fromDoctor", rosterDoctorId);
    const qs = q.toString();
    const base = patientDetailHref(viewerRole, patientId);
    router.replace(`${base}${qs ? `?${qs}` : ""}`);
  }, [canEdit, modeParam, patientId, rosterDoctorId, router, viewerRole]);

  const ready = Boolean(patient) && !isLoading;
  const showLiveData = isMounted && ready;
  const p = patient as Patient | undefined;
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
        primaryPatient: snap.data?.patient ?? p ?? null,
        doctorById,
      }),
    [viewerRole, patientDisplayName, snap.data?.patient, p, doctorById]
  );

  const invoiceColumns = useMemo(
    () => buildPatientInvoicesColumns(viewerRole),
    [viewerRole]
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
    <div className="space-y-4 pb-16 text-gray-700">
      <PageHeader
        title={
          showLiveData ? (
            <span className="block min-h-8 sm:min-h-9">{nameLabel || "—"}</span>
          ) : (
            <Skeleton className="h-8 w-56 max-w-full sm:h-9" aria-hidden />
          )
        }
        // Static descriptor text should not flicker on refresh.
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

      {accessLevel === "view" && showLiveData && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-900">
          <Lock className="h-4 w-4 shrink-0" aria-hidden />
          Read-only — you can view this patient chart but only the primary doctor or an admin can
          update or delete it.
        </div>
      )}

      <Card
        className={cn(
          "overflow-hidden border-sky-100/50 bg-white/90 text-gray-700 shadow-none",
          skyGlassTableFrameClass
        )}
      >
        <CardContent className="space-y-6 px-4 sm:px-6 text-gray-700">
          {/* Keep section title inside the same content flow to avoid top-strip jump on refresh. */}
          <div className="min-h-6">
            {/* Static heading should stay rendered even while values are loading. */}
            <h2 className="text-lg font-semibold text-gray-700">Patient Details</h2>
          </div>
          <div className="flex items-center gap-4">
            {showLiveData && p ? (
              <PatientPortraitAvatar patient={p} sizeClassName="h-16 w-16" />
            ) : (
              <Skeleton className="h-16 w-16 shrink-0 rounded-full" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              {showLiveData ? (
                <>
                  <p className="text-lg font-semibold text-gray-700">{nameLabel || "—"}</p>
                  <p className="text-sm text-gray-600">{p!.email ?? "—"}</p>
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

          {!showLiveData ? (
            <PatientDetailBodySkeleton />
          ) : mode === "view" ? (
            <>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="sm:col-span-2 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2 text-gray-700">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    {/* Keep audit icon style consistent with all other schema icon circles. */}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-200/70 bg-sky-50/80 shadow-[0_2px_8px_rgba(14,165,233,0.15)]">
                      <CalendarClock className="h-3 w-3 text-sky-600" aria-hidden />
                    </span>
                    Record Audit
                  </div>
                  <dd className="mt-1 space-y-1 text-gray-700">
                    <p>
                      <span className="text-gray-500">Created: </span>
                      {p!.created_at ? format(new Date(p!.created_at), "M/d/yyyy, h:mm:ss a") : "—"}
                      {p!.created_by_display ? (
                        <>
                          <span className="text-gray-500"> · By </span>
                          <ControlPanelStaffLink
                            userId={p!.created_by_id}
                            label={p!.created_by_display}
                            email={p!.created_by_email}
                          />
                        </>
                      ) : null}
                    </p>
                    <p>
                      <span className="text-gray-500">Last Updated: </span>
                      {p!.updated_at ? format(new Date(p!.updated_at), "M/d/yyyy, h:mm:ss a") : "—"}
                      {p!.updated_by_display ? (
                        <>
                          <span className="text-gray-500"> · By </span>
                          <ControlPanelStaffLink
                            userId={p!.updated_by_id}
                            label={p!.updated_by_display}
                            email={p!.updated_by_email}
                          />
                        </>
                      ) : null}
                    </p>
                  </dd>
                </div>
                <div>
                  <FieldLabel icon={Fingerprint}>Patient ID</FieldLabel>
                  <dd className=" font-mono text-xs break-all text-gray-700">{p!.id}</dd>
                </div>
                <div>
                  <FieldLabel icon={Calendar}>Birth Date</FieldLabel>
                  <dd className=" text-gray-700">{p!.birth_date ?? "—"}</dd>
                </div>
                <div>
                  <FieldLabel icon={Activity}>Care Tier (1–10)</FieldLabel>
                  <dd className=" text-gray-700">{getPatientCareLevelLabel(p!.care_level)}</dd>
                </div>
                <div>
                  <FieldLabel icon={User}>Pronoun</FieldLabel>
                  <dd className=" text-gray-700">{p!.pronoun ?? "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel icon={Stethoscope}>Primary Doctor</FieldLabel>
                  <dd className=" text-gray-700">
                    {/* Schema block (not table): avatar + name → email → badge stack; matches list/table doctor cells. */}
                    {p!.primary_doctor_id && p!.primary_doctor_display?.trim() ? (
                      <DoctorIdentityRow
                        doctor={{
                          id: p!.primary_doctor_id,
                          email: p!.primary_doctor_email ?? primaryDoctorUser?.email ?? null,
                          display_name: p!.primary_doctor_display.trim(),
                          image: primaryDoctorUser?.image ?? null,
                          specialty: primaryDoctorUser?.specialty ?? null,
                        }}
                        linkKind={isAdminRole(viewerRole) ? "admin-cp" : "role"}
                        showEmail
                      />
                    ) : (
                      (p!.primary_doctor_display ?? "—")
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel icon={Share2}>Referral</FieldLabel>
                  <dd className=" text-gray-700">
                    {cp && typeof cp === "object" && typeof cp.referral_source === "string"
                      ? PATIENT_REFERRAL_SOURCES.find((x) => x.value === cp.referral_source)?.label ??
                      cp.referral_source
                      : "—"}
                    {cp && typeof cp === "object" && typeof cp.referral_detail === "string" && cp.referral_detail
                      ? ` — ${cp.referral_detail}`
                      : ""}
                  </dd>
                </div>
                <div>
                  <FieldLabel icon={AlertCircle}>Allergies</FieldLabel>
                  <dd className=" text-gray-700">
                    {cp && typeof cp === "object" && Array.isArray(cp.allergies)
                      ? cp.allergies.join(", ")
                      : "—"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel icon={FileText}>Clinical Notes</FieldLabel>
                  <dd className=" whitespace-pre-wrap text-gray-700">
                    {cp && typeof cp === "object" && typeof cp.notes === "string" ? cp.notes : "—"}
                  </dd>
                </div>
              </dl>

              <div className="space-y-3">
                <SectionHeading icon={Calendar}>Related Appointments</SectionHeading>
                <ClinicalDataTable
                  columns={appointmentColumns}
                  data={(snap.data?.appointments ?? []).slice(0, 12)}
                  isLoading={snap.isLoading}
                  pagination={false}
                  emptyMessage="No Appointments"
                  tableClassName="min-w-[900px] w-full"
                  className="overflow-x-auto rounded-md border border-slate-200/80"
                />
              </div>

              <div className="space-y-3">
                <SectionHeading icon={Receipt}>Invoices (Via Appointments)</SectionHeading>
                <ClinicalDataTable
                  columns={invoiceColumns}
                  data={(snap.data?.invoices ?? []).slice(0, 12)}
                  isLoading={snap.isLoading}
                  pagination={false}
                  emptyMessage="No Invoices"
                  tableClassName="min-w-[720px] w-full"
                  className="overflow-x-auto rounded-md border border-slate-200/80"
                />
              </div>
            </>
          ) : (
            <PatientDetailForm
              key={`${p!.id}-${p!.primary_doctor_id ?? ""}-${JSON.stringify(p!.clinical_profile)}`}
              patient={p!}
              formId={FORM_ID}
              onSaved={() => setMode("view")}
              submitActions="none"
            />
          )}
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-sky-100/60 bg-white/95 py-3 text-gray-700 backdrop-blur supports-backdrop-filter:bg-white/85">
        <div className={cn(dashboardShellClass, "flex flex-wrap items-center justify-between gap-2")}>
          {!showLiveData ? (
            <div className="flex w-full items-center justify-between gap-2">
              {/* Keep navigation action static while loading to match view mode and avoid flicker. */}
              <BackNavigationLink
                href={listBackHref}
                className={cn(skyGlassBackButtonClass, "no-underline")}
              >
                <List className="shrink-0" aria-hidden />
                Back To List
              </BackNavigationLink>
              {/* Footer action placeholders — static chrome, no pulse */}
              <div className="flex flex-wrap gap-2">
                <div className="h-10 w-36" />
                <div className="h-10 w-24" />
              </div>
            </div>
          ) : mode === "view" ? (
            <>
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
                    onClick={() => setMode("edit")}
                    className="cursor-pointer"
                  >
                    <Pencil className="shrink-0" aria-hidden />
                    Update Profile
                  </ControlPanelGlassActionButton>
                  <ConfirmActionDialog
                    trigger={
                      <ControlPanelGlassActionButton type="button" variant="rose" disabled={isDeleting} className="cursor-pointer">
                        <Trash2 className="shrink-0" aria-hidden />
                        {isDeleting ? "Deleting…" : "Delete"}
                      </ControlPanelGlassActionButton>
                    }
                    title="Permanently Remove This Patient?"
                    subtitle={
                      <>
                        This will delete{" "}
                        <span className="text-gray-700">
                          {`${p!.firstname} ${p!.lastname}`.trim()}
                          {p!.email ? ` (${p!.email})` : ""}
                        </span>{" "}
                        and all related data. You cannot undo this action.
                      </>
                    }
                    confirmLabel="Delete"
                    onConfirm={() =>
                      deletePatient(
                        {
                          id: p!.id,
                          name: `${p!.firstname} ${p!.lastname}`.trim(),
                          email: p!.email,
                        },
                        {
                          onSuccess: async () => {
                            await invalidateQueriesForRoute(queryClient, listBackHref);
                            router.push(listBackHref);
                          },
                        }
                      )
                    }
                  />
                </div>
              ) : null}
            </>
          ) : canEdit ? (
            <>
              <ControlPanelGlassActionButton
                type="button"
                variant="sky"
                onClick={() => setMode("view")}
                className="cursor-pointer"
              >
                <X className="shrink-0" aria-hidden />
                Cancel
              </ControlPanelGlassActionButton>
              <div className="flex flex-wrap gap-2">
                <ControlPanelGlassActionButton
                  type="submit"
                  form={FORM_ID}
                  variant="emerald"
                  disabled={isDeleting || isUpdating}
                  className="cursor-pointer"
                >
                  {isUpdating ? (
                    <Loader2 className="shrink-0 animate-spin" aria-hidden />
                  ) : (
                    <Save className="shrink-0" aria-hidden />
                  )}
                  {isUpdating ? "Saving Changes…" : "Save Changes"}
                </ControlPanelGlassActionButton>
                <ConfirmActionDialog
                  trigger={
                    <ControlPanelGlassActionButton type="button" variant="rose" disabled={isDeleting} className="cursor-pointer">
                      <Trash2 className="shrink-0" aria-hidden />
                      {isDeleting ? "Deleting…" : "Delete"}
                    </ControlPanelGlassActionButton>
                  }
                  title="Permanently Remove This Patient?"
                  subtitle={
                    <>
                      This will delete{" "}
                      <span className="text-gray-700">
                        {`${p!.firstname} ${p!.lastname}`.trim()}
                        {p!.email ? ` (${p!.email})` : ""}
                      </span>{" "}
                      and all related data. You cannot undo this action.
                    </>
                  }
                  confirmLabel="Delete"
                  onConfirm={() =>
                    deletePatient(
                      {
                        id: p!.id,
                        name: `${p!.firstname} ${p!.lastname}`.trim(),
                        email: p!.email,
                      },
                      {
                        onSuccess: async () => {
                          await invalidateQueriesForRoute(queryClient, listBackHref);
                          router.push(listBackHref);
                        },
                      }
                    )
                  }
                />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
