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
  Pencil,
  Receipt,
  Save,
  Share2,
  Stethoscope,
  Trash2,
  User,
  X,
} from "lucide-react";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { useRouter, useSearchParams } from "next/navigation";
import { usePatient, usePatientSnapshot } from "@/hooks/usePatients";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PatientDetailForm } from "@/components/control-panel/PatientDetailForm";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import { useUsers } from "@/hooks/useUsers";
import { ControlPanelStaffLink } from "@/components/shared/ControlPanelStaffLink";
import { DEMO_ACCOUNTS } from "@/lib/demo-credentials";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  appointmentDetailHref,
  doctorDetailHref,
  invoiceDetailHref,
  patientDetailHref,
} from "@/lib/entity-routes";
import { isAdminRole } from "@/lib/rbac";
import type { AppointmentSnapshotRow, Patient, PatientSnapshot } from "@/types/types";
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

/**
 * Colored badge for appointment status.
 * pending → amber, done → emerald, alert → rose, unknown → slate.
 */
function AppointmentStatusBadge({ status }: { status?: string | null }) {
  const cls =
    status === "done"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "alert"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : status === "pending"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-slate-200 bg-slate-50 text-gray-600";
  return (
    <Badge variant="outline" className={`capitalize text-xs ${cls}`}>
      {status ?? "pending"}
    </Badge>
  );
}

/**
 * Colored badge for invoice status.
 * paid → emerald, overdue → rose, sent → sky, draft → slate, cancelled → slate (muted).
 */
/** Safe hex for inline category swatch — invalid DB values fall back to neutral slate. */
function categorySwatchFill(color: string | null | undefined): string {
  if (!color?.trim()) return "#94a3b8";
  const hex = color.trim();
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex) ? hex : "#94a3b8";
}

/**
 * Two-line Title column: visit type on row 1, patient name on row 2 (matches doctor name + email layout).
 * Prefers `appointment_type_name` from snapshot; falls back to parsing seeded `title` ("Type — Patient").
 */
function appointmentTitleLines(
  appt: AppointmentSnapshotRow,
  patientDisplayName: string
): { typeLine: string; patientLine: string } {
  const typeFromFk = appt.appointment_type_name?.trim();
  if (typeFromFk) {
    return { typeLine: typeFromFk, patientLine: patientDisplayName };
  }
  const title = appt.title?.trim() ?? "";
  const sep = " — ";
  const idx = title.indexOf(sep);
  if (idx >= 0) {
    return {
      typeLine: title.slice(0, idx).trim() || title || "—",
      patientLine: title.slice(idx + sep.length).trim() || patientDisplayName,
    };
  }
  return { typeLine: title || "—", patientLine: patientDisplayName };
}

/** Category pill with color dot — same visual language as AppointmentsManagement. */
function CategoryCell({
  label,
  color,
}: {
  label: string | null | undefined;
  color: string | null | undefined;
}) {
  if (!label?.trim()) {
    return <span className="text-xs text-gray-500">—</span>;
  }
  return (
    <span className="inline-flex max-w-full min-w-0 items-center gap-1.5 text-xs text-gray-700">
      <svg
        width="8"
        height="8"
        viewBox="0 0 8 8"
        aria-hidden
        className="inline-block shrink-0"
      >
        <circle cx="4" cy="4" r="4" fill={categorySwatchFill(color)} />
      </svg>
      <span className="truncate">{label}</span>
    </span>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const cls =
    status === "paid"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "overdue"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : status === "sent"
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : status === "cancelled"
            ? "border-slate-200 bg-slate-50 text-gray-400 line-through"
            : "border-slate-200 bg-slate-50 text-gray-600";
  return (
    <Badge variant="outline" className={`capitalize text-xs ${cls}`}>
      {status}
    </Badge>
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

      <div className="space-y-2">
        <SectionHeading icon={Calendar}>Related Appointments</SectionHeading>
        {/* Keep table chrome static; only data cells pulse, matching patient-management loading UX. */}
        <div className="overflow-x-auto rounded-md border border-slate-200/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-700">Title</TableHead>
                <TableHead className="whitespace-nowrap text-gray-700">When</TableHead>
                <TableHead className="text-gray-700">Category</TableHead>
                <TableHead className="text-gray-700">Doctor</TableHead>
                <TableHead className="text-gray-700">Location</TableHead>
                <TableHead className="text-gray-700">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full rounded" aria-hidden />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="space-y-2">
        <SectionHeading icon={Receipt}>Invoices (Via Appointments)</SectionHeading>
        {/* Same static-frame table skeleton behavior as appointments for consistent hydration-safe loading. */}
        <div className="overflow-x-auto rounded-md border border-slate-200/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-700">Amount</TableHead>
                <TableHead className="text-gray-700">Description</TableHead>
                <TableHead className="text-gray-700">Appointment</TableHead>
                <TableHead className="text-gray-700">Status</TableHead>
                <TableHead className="whitespace-nowrap text-gray-700">Due</TableHead>
                <TableHead className="whitespace-nowrap text-gray-700">Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full rounded" aria-hidden />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

type PatientDetailScreenProps = {
  patientId: string;
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
  viewerRole,
  listBackHref,
  initialPatient,
  initialSnapshot,
}: PatientDetailScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "view";

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

  const { data: patient, isLoading, isError, error } = usePatient(patientId);
  const snap = usePatientSnapshot(patientId);
  const { data: doctorsData } = useUsers({ role: "doctor", limit: 200 });
  const primaryDoctorUser = useMemo(() => {
    const id = patient?.primary_doctor_id;
    if (!id) return undefined;
    return doctorsData?.users?.find((u) => u.id === id);
  }, [patient?.primary_doctor_id, doctorsData?.users]);
  const { deletePatient, isDeleting, isUpdating } = usePatients();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Hydration guard: defer mounted flip to next frame to avoid sync setState-in-effect lint.
    const raf = window.requestAnimationFrame(() => setIsMounted(true));
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const setMode = (next: "view" | "edit") => {
    const q = new URLSearchParams(searchParams.toString());
    if (next === "view") q.delete("mode");
    else q.set("mode", "edit");
    const qs = q.toString();
    router.replace(`${patientDetailHref(viewerRole, patientId)}${qs ? `?${qs}` : ""}`);
  };

  const ready = Boolean(patient) && !isLoading;
  const showLiveData = isMounted && ready;
  const p = patient as Patient | undefined;
  const nameLabel = p ? `${p.firstname} ${p.lastname}`.trim() : "";
  const fallbackText = p ? nameLabel || p.email || "?" : "?";
  const avatarSrc = p?.email
    ? DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === p.email?.toLowerCase())?.avatarUrl ?? null
    : null;
  const age = p ? patientAgeYears(p.birth_date) : null;
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
          <PrefetchingLink
            href={listBackHref}
            className={cn(skyGlassBackButtonClass, "no-underline")}
          >
            <ArrowLeft className="shrink-0" aria-hidden />
            Back
          </PrefetchingLink>
        }
      />

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
            {showLiveData ? (
              <UserAvatar src={avatarSrc} fallbackText={fallbackText} sizeClassName="h-16 w-16" />
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
                  <dd className="mt-0.5 font-mono text-xs break-all text-gray-700">{p!.id}</dd>
                </div>
                <div>
                  <FieldLabel icon={Calendar}>Birth Date</FieldLabel>
                  <dd className="mt-0.5 text-gray-700">{p!.birth_date ?? "—"}</dd>
                </div>
                <div>
                  <FieldLabel icon={Activity}>Care Tier (1–10)</FieldLabel>
                  <dd className="mt-0.5 text-gray-700">{getPatientCareLevelLabel(p!.care_level)}</dd>
                </div>
                <div>
                  <FieldLabel icon={User}>Pronoun</FieldLabel>
                  <dd className="mt-0.5 text-gray-700">{p!.pronoun ?? "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel icon={Stethoscope}>Primary Doctor</FieldLabel>
                  <dd className="mt-0.5 text-gray-700">
                    {p!.primary_doctor_id && p!.primary_doctor_display?.trim() ? (
                      <span className="inline-flex flex-wrap items-center gap-2">
                        <EntityTitleLink
                          href={doctorDetailHref(viewerRole, p!.primary_doctor_id)}
                          label={p!.primary_doctor_display.trim()}
                          className="font-normal"
                        />
                        <DoctorSpecialtyBadge
                          specialty={primaryDoctorUser?.specialty ?? null}
                          showIcon={false}
                        />
                        {p!.primary_doctor_email?.trim() ? (
                          <span className="text-gray-600"> ({p!.primary_doctor_email.trim()})</span>
                        ) : null}
                      </span>
                    ) : (
                      (p!.primary_doctor_display ?? "—")
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel icon={Share2}>Referral</FieldLabel>
                  <dd className="mt-0.5 text-gray-700">
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
                  <dd className="mt-0.5 text-gray-700">
                    {cp && typeof cp === "object" && Array.isArray(cp.allergies)
                      ? cp.allergies.join(", ")
                      : "—"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel icon={FileText}>Clinical Notes</FieldLabel>
                  <dd className="mt-0.5 whitespace-pre-wrap text-gray-700">
                    {cp && typeof cp === "object" && typeof cp.notes === "string" ? cp.notes : "—"}
                  </dd>
                </div>
              </dl>

              <div className="space-y-3">
                <SectionHeading icon={Calendar}>Related Appointments</SectionHeading>
                {snap.isLoading ? (
                  /*
                   * Inline skeleton mirrors the 7-column table shape so there is no
                   * layout jump when real data loads. Only the body rows pulse — header stays stable.
                   */
                  <div className="overflow-x-auto rounded-md border border-slate-200/80">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {["Title", "When", "Category", "Calendar owner", "Treating physician", "Location", "Status"].map((h) => (
                            <TableHead key={h} className="text-gray-700">{h}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 7 }).map((__, j) => (
                              <TableCell key={j}>
                                <Skeleton className="h-4 w-full rounded" aria-hidden />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-md border border-slate-200/80">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-gray-700">Title</TableHead>
                          <TableHead className="whitespace-nowrap text-gray-700">When</TableHead>
                          <TableHead className="text-gray-700">Category</TableHead>
                          <TableHead className="text-gray-700">Calendar owner</TableHead>
                          <TableHead className="text-gray-700">Treating physician</TableHead>
                          <TableHead className="text-gray-700">Location</TableHead>
                          <TableHead className="text-gray-700">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(snap.data?.appointments ?? []).slice(0, 12).map((a) => {
                          const patientDisplayName =
                            nameLabel.trim() ||
                            `${snap.data?.patient?.firstname ?? ""} ${snap.data?.patient?.lastname ?? ""}`.trim() ||
                            "—";
                          const { typeLine, patientLine } = appointmentTitleLines(a, patientDisplayName);
                          return (
                          <TableRow key={a.id}>
                            {/* Title — visit type + patient on two lines; link keeps full `title` for accessibility */}
                            <TableCell>
                              <div className="min-w-0">
                                <EntityTitleLink
                                  href={appointmentDetailHref(viewerRole, a.id)}
                                  label={typeLine}
                                  className="block truncate text-sm font-medium"
                                />
                                <p className="truncate text-xs text-gray-500">{patientLine}</p>
                              </div>
                            </TableCell>
                            {/* When — localized date on row 1, time range on row 2 */}
                            <TableCell>
                              {a.start ? (
                                <div className="min-w-0 whitespace-nowrap">
                                  <p className="text-xs font-medium text-gray-700">
                                    {format(new Date(a.start), "PP")}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {format(new Date(a.start), "p")}
                                    {a.end ? ` – ${format(new Date(a.end), "p")}` : ""}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <CategoryCell label={a.category_label} color={a.category_color} />
                            </TableCell>
                            {/* B3 deferred: DB column remains `user_id`; API exposes calendar owner here (B2 snapshot fields). */}
                            <TableCell>
                              {a.calendar_owner_id && a.calendar_owner_display ? (
                                <div className="min-w-0">
                                  <EntityTitleLink
                                    href={doctorDetailHref(viewerRole, a.calendar_owner_id)}
                                    label={a.calendar_owner_display}
                                  />
                                  {a.calendar_owner_email && (
                                    <p className="truncate text-xs text-gray-500">{a.calendar_owner_email}</p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">—</span>
                              )}
                            </TableCell>
                            {/* B2: `doctor_*` = `treating_physician_id ?? user_id` (see `appointment-display-doctor.ts`). */}
                            <TableCell>
                              {a.doctor_id && a.doctor_display ? (
                                <div className="min-w-0">
                                  <EntityTitleLink
                                    href={doctorDetailHref(viewerRole, a.doctor_id)}
                                    label={a.doctor_display}
                                  />
                                  {a.doctor_email && (
                                    <p className="truncate text-xs text-gray-500">{a.doctor_email}</p>
                                  )}
                                  {snap.data?.patient?.primary_doctor_id &&
                                    a.doctor_id &&
                                    snap.data.patient.primary_doctor_id !== a.doctor_id &&
                                    snap.data.patient.primary_doctor_display?.trim() && (
                                      <p className="mt-1.5 text-[10px] leading-snug text-gray-600">
                                        Primary care:{" "}
                                        <EntityTitleLink
                                          href={doctorDetailHref(
                                            viewerRole,
                                            snap.data.patient.primary_doctor_id
                                          )}
                                          label={snap.data.patient.primary_doctor_display.trim()}
                                          className="font-normal"
                                        />
                                      </p>
                                    )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-gray-700">{a.location ?? "—"}</TableCell>
                            <TableCell>
                              <AppointmentStatusBadge status={a.status} />
                            </TableCell>
                          </TableRow>
                          );
                        })}
                        {(snap.data?.appointments ?? []).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500">
                              No Appointments
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <SectionHeading icon={Receipt}>Invoices (Via Appointments)</SectionHeading>
                {snap.isLoading ? (
                  /*
                   * Inline skeleton mirrors the 6-column invoice table shape so
                   * there is no layout jump when real data loads.
                   */
                  <div className="overflow-x-auto rounded-md border border-slate-200/80">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {["Amount", "Description", "Appointment", "Status", "Due", "Paid"].map((h) => (
                            <TableHead key={h} className="text-gray-700">{h}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 6 }).map((__, j) => (
                              <TableCell key={j}>
                                <Skeleton className="h-4 w-full rounded" aria-hidden />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-md border border-slate-200/80">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-gray-700">Amount</TableHead>
                          <TableHead className="text-gray-700">Description</TableHead>
                          <TableHead className="text-gray-700">Appointment</TableHead>
                          <TableHead className="text-gray-700">Status</TableHead>
                          <TableHead className="whitespace-nowrap text-gray-700">Due</TableHead>
                          <TableHead className="whitespace-nowrap text-gray-700">Paid</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(snap.data?.invoices ?? []).slice(0, 12).map((inv) => (
                          <TableRow key={inv.id}>
                            {/* Amount — deep-links to invoice detail */}
                            <TableCell className="font-medium tabular-nums">
                              {isAdminRole(viewerRole) ? (
                                <EntityTitleLink
                                  href={invoiceDetailHref(viewerRole, inv.id)}
                                  label={`${(inv.amount / 100).toFixed(2)} ${inv.currency.toUpperCase()}`}
                                />
                              ) : (
                                <span>
                                  {(inv.amount / 100).toFixed(2)} {inv.currency.toUpperCase()}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-[160px] truncate text-xs text-gray-700">
                              {inv.description ?? "—"}
                            </TableCell>
                            {/* Appointment — deep-links to appointment detail when linked */}
                            <TableCell>
                              {inv.appointment_id ? (
                                <EntityTitleLink
                                  href={appointmentDetailHref(viewerRole, inv.appointment_id)}
                                  label="View"
                                  className="text-xs"
                                />
                              ) : (
                                <span className="text-xs text-gray-500">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <InvoiceStatusBadge status={inv.status} />
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs text-gray-700">
                              {inv.due_date ? format(new Date(inv.due_date), "PP") : "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs text-gray-700">
                              {inv.paid_at ? format(new Date(inv.paid_at), "PP") : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                        {(snap.data?.invoices ?? []).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-500">
                              No Invoices
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
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
              <PrefetchingLink
                href={listBackHref}
                className={cn(skyGlassBackButtonClass, "no-underline")}
              >
                <List className="shrink-0" aria-hidden />
                Back To List
              </PrefetchingLink>
              {/* Footer action placeholders — static chrome, no pulse */}
              <div className="flex flex-wrap gap-2">
                <div className="h-10 w-36" />
                <div className="h-10 w-24" />
              </div>
            </div>
          ) : mode === "view" ? (
            <>
              <PrefetchingLink
                href={listBackHref}
                className={cn(skyGlassBackButtonClass, "no-underline")}
              >
                <List className="shrink-0" aria-hidden />
                Back To List
              </PrefetchingLink>
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
                        onSuccess: () => router.push(listBackHref),
                      }
                    )
                  }
                />
              </div>
            </>
          ) : (
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
                        onSuccess: () => router.push(listBackHref),
                      }
                    )
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
