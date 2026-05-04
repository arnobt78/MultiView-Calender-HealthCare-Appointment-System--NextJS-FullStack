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
  History,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PatientDetailForm } from "@/components/control-panel/PatientDetailForm";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
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
import type { Patient } from "@/types/types";

const FORM_ID = "patient-detail-form";

function FieldLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
      <Icon className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
      {children}
    </dt>
  );
}

function SectionHeading({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
      <Icon className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
      {children}
    </h3>
  );
}

/** Pulse placeholders only — page chrome (header, card, footer bar) stays fixed to avoid layout flash. */
function PatientDetailBodySkeleton() {
  return (
    <div className="space-y-6 text-gray-700">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 shrink-0 rounded-full" aria-hidden />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-16 w-full rounded-md" />
      </div>
    </div>
  );
}

export function PatientDetailScreen({ patientId }: { patientId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "view";
  const { data: patient, isLoading, isError, error } = usePatient(patientId);
  const snap = usePatientSnapshot(patientId);
  const { deletePatient, isDeleting, isUpdating } = usePatients();

  const setMode = (next: "view" | "edit") => {
    const q = new URLSearchParams(searchParams.toString());
    if (next === "view") q.delete("mode");
    else q.set("mode", "edit");
    const qs = q.toString();
    router.replace(`/control-panel/patients/${patientId}${qs ? `?${qs}` : ""}`);
  };

  const ready = Boolean(patient) && !isLoading;
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
          ready ? (
            nameLabel || "—"
          ) : (
            <Skeleton className="h-8 w-56 max-w-full sm:h-9" aria-hidden />
          )
        }
        description={
          ready ? (
            "Patient Record — Schema Fields, Clinical Profile, Related Activity"
          ) : (
            <Skeleton className="mt-1 h-4 w-full max-w-lg" aria-hidden />
          )
        }
        actions={
          <PrefetchingLink
            href="/control-panel/patient-management"
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
        <CardHeader className="px-0">
          <CardTitle className="text-gray-700">
            {ready ? "Patient Details" : <Skeleton className="h-6 w-40" aria-hidden />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-0 text-gray-700">
          <div className="flex items-center gap-4">
            {ready ? (
              <UserAvatar src={avatarSrc} fallbackText={fallbackText} sizeClassName="h-16 w-16" />
            ) : (
              <Skeleton className="h-16 w-16 shrink-0 rounded-full" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              {ready ? (
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
                <div className="space-y-2">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-4 w-56" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-6 w-14 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {!ready ? (
            <PatientDetailBodySkeleton />
          ) : mode === "view" ? (
            <>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="sm:col-span-2 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2 text-gray-700">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <CalendarClock className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
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
                      <>
                        <EntityTitleLink
                          href={`/control-panel/doctors/${p!.primary_doctor_id}`}
                          label={p!.primary_doctor_display.trim()}
                          className="font-normal"
                        />
                        {p!.primary_doctor_email?.trim() ? (
                          <span className="text-gray-600"> ({p!.primary_doctor_email.trim()})</span>
                        ) : null}
                      </>
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
                  <Skeleton className="h-24 w-full rounded-md" aria-hidden />
                ) : (
                  <div className="overflow-x-auto rounded-md border border-slate-200/80">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-gray-700">Title</TableHead>
                          <TableHead className="text-gray-700">When</TableHead>
                          <TableHead className="text-gray-700">Category</TableHead>
                          <TableHead className="text-gray-700">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(snap.data?.appointments ?? []).slice(0, 12).map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium text-gray-700">{a.title}</TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-gray-700">
                              {a.start ? format(new Date(a.start), "PPp") : "—"}
                            </TableCell>
                            <TableCell className="text-gray-700">{a.category_label ?? "—"}</TableCell>
                            <TableCell className="text-gray-700">{a.status ?? "—"}</TableCell>
                          </TableRow>
                        ))}
                        {(snap.data?.appointments ?? []).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-gray-500">
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
                <SectionHeading icon={History}>Activities</SectionHeading>
                {snap.isLoading ? (
                  <Skeleton className="h-20 w-full rounded-md" aria-hidden />
                ) : (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {(snap.data?.activities ?? []).slice(0, 12).map((act) => (
                      <li key={act.id} className="rounded-lg border border-slate-200/80 p-2">
                        <p className="text-xs text-gray-500">
                          {act.created_at ? format(new Date(act.created_at), "PPp") : ""}
                          {act.created_by_display ? ` · ${act.created_by_display}` : ""}
                        </p>
                        <p className="font-medium text-gray-700">{act.type}</p>
                        <p className="line-clamp-2 text-gray-600">{act.content}</p>
                      </li>
                    ))}
                    {(snap.data?.activities ?? []).length === 0 && (
                      <p className="text-sm text-gray-500">No Activities</p>
                    )}
                  </ul>
                )}
              </div>

              <div className="space-y-3">
                <SectionHeading icon={Receipt}>Invoices (Via Appointments)</SectionHeading>
                {snap.isLoading ? (
                  <Skeleton className="h-16 w-full rounded-md" aria-hidden />
                ) : (
                  <div className="overflow-x-auto rounded-md border border-slate-200/80">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-gray-700">Amount</TableHead>
                          <TableHead className="text-gray-700">Status</TableHead>
                          <TableHead className="text-gray-700">Due</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(snap.data?.invoices ?? []).slice(0, 12).map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="text-gray-700">
                              {(inv.amount / 100).toFixed(2)} {inv.currency}
                            </TableCell>
                            <TableCell className="text-gray-700">{inv.status}</TableCell>
                            <TableCell className="text-gray-700">{inv.due_date ?? "—"}</TableCell>
                          </TableRow>
                        ))}
                        {(snap.data?.invoices ?? []).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-gray-500">
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

      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-sky-100/60 bg-white/95 py-3 text-gray-700 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className={cn(dashboardShellClass, "flex flex-wrap items-center justify-between gap-2")}>
          {!ready ? (
            <div className="flex w-full justify-between gap-2">
              <Skeleton className="h-10 w-36 rounded-full" />
              <Skeleton className="h-10 w-40 rounded-full" />
            </div>
          ) : mode === "view" ? (
            <>
              <PrefetchingLink
                href="/control-panel/patient-management"
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
                      <span className="text-gray-800">
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
                        onSuccess: () => router.push("/control-panel/patient-management"),
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
                      <span className="text-gray-800">
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
                        onSuccess: () => router.push("/control-panel/patient-management"),
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
