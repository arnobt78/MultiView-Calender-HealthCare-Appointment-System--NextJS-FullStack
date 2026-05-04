"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { usePatient } from "@/hooks/usePatients";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { PatientDetailForm } from "./PatientDetailForm";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { ControlPanelStaffLink } from "@/components/shared/ControlPanelStaffLink";
import { getPatientCareLevelLabel } from "@/lib/patient-care-level";
import { PATIENT_REFERRAL_SOURCES } from "@/lib/patient-referral-sources";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : null;
  const { data: patient, isLoading, isError, error } = usePatient(id);

  if (!id) {
    return (
      <div className="max-w-9xl mx-auto p-4">
        <p className="text-destructive">Invalid patient ID.</p>
        <Button variant="link" asChild><Link href="/control-panel/patient-management">Back to Control Panel</Link></Button>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-9xl mx-auto p-4">
        <p className="text-destructive">{error?.message ?? "Failed to load patient."}</p>
        <Button variant="link" asChild><Link href="/control-panel/patient-management">Back to Control Panel</Link></Button>
      </div>
    );
  }

  if (isLoading || !patient) {
    return (
      <div className="max-w-9xl mx-auto p-4">
        <p className="text-muted-foreground">Loading patient...</p>
      </div>
    );
  }

  return (
    <div className="max-w-9xl mx-auto space-y-2 px-2 sm:px-4 lg:px-8">
      <PageHeader
        title={`Patient: ${patient.firstname} ${patient.lastname}`}
        description="Record overview — edit full profile in the form below"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/control-panel/patient-management">
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </Button>
          </>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="sm:col-span-2 rounded-lg border bg-muted/30 px-3 py-2">
              <dt className="font-medium text-muted-foreground">Record audit</dt>
              <dd className="mt-1 space-y-0.5">
                <div>
                  <span className="text-muted-foreground">Created: </span>
                  {patient.created_at ? new Date(patient.created_at).toLocaleString() : "—"}
                  {patient.created_by_display ? (
                    <>
                      <span className="text-muted-foreground"> · by </span>
                      <ControlPanelStaffLink
                        userId={patient.created_by_id}
                        label={patient.created_by_display}
                      />
                    </>
                  ) : null}
                </div>
                <div>
                  <span className="text-muted-foreground">Last updated: </span>
                  {patient.updated_at ? new Date(patient.updated_at).toLocaleString() : "—"}
                  {patient.updated_by_display ? (
                    <>
                      <span className="text-muted-foreground"> · by </span>
                      <ControlPanelStaffLink
                        userId={patient.updated_by_id}
                        label={patient.updated_by_display}
                      />
                    </>
                  ) : null}
                </div>
              </dd>
            </div>
            <div><dt className="font-medium text-muted-foreground">Patient ID</dt><dd className="font-mono text-xs break-all">{patient.id}</dd></div>
            <div><dt className="font-medium text-muted-foreground">First name</dt><dd>{patient.firstname}</dd></div>
            <div><dt className="font-medium text-muted-foreground">Last name</dt><dd>{patient.lastname}</dd></div>
            <div><dt className="font-medium text-muted-foreground">Birth date</dt><dd>{patient.birth_date ?? "—"}</dd></div>
            <div><dt className="font-medium text-muted-foreground">Care tier (1–10)</dt><dd>{getPatientCareLevelLabel(patient.care_level)}</dd></div>
            <div><dt className="font-medium text-muted-foreground">Pronoun</dt><dd>{patient.pronoun ?? "—"}</dd></div>
            <div><dt className="font-medium text-muted-foreground">Email</dt><dd>{patient.email ?? "—"}</dd></div>
            <div>
              <dt className="font-medium text-muted-foreground">Primary doctor</dt>
              <dd>
                {patient.primary_doctor_id && patient.primary_doctor_display?.trim() ? (
                  <EntityTitleLink
                    href={`/control-panel/doctors/${patient.primary_doctor_id}`}
                    label={patient.primary_doctor_display.trim()}
                  />
                ) : (
                  patient.primary_doctor_display ?? "—"
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-muted-foreground">Referral</dt>
              <dd>
                {(() => {
                  const cp = patient.clinical_profile;
                  if (!cp || typeof cp !== "object") return "—";
                  const src = typeof cp.referral_source === "string" ? cp.referral_source : "";
                  const label =
                    PATIENT_REFERRAL_SOURCES.find((x) => x.value === src)?.label ?? (src ? src : "—");
                  const det =
                    typeof cp.referral_detail === "string" && cp.referral_detail
                      ? ` — ${cp.referral_detail}`
                      : "";
                  return `${label}${det}`;
                })()}
              </dd>
            </div>
            <div><dt className="font-medium text-muted-foreground">Active</dt><dd><Badge variant={patient.active ? "default" : "secondary"}>{patient.active ? "Yes" : "No"}</Badge></dd></div>
            <div><dt className="font-medium text-muted-foreground">Active since</dt><dd>{patient.active_since ? new Date(patient.active_since).toLocaleString() : "—"}</dd></div>
          </dl>
          <PatientDetailForm patient={patient} />
        </CardContent>
      </Card>
    </div>
  );
}
