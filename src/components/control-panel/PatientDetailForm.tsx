"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { Patient, type PatientClinicalProfile } from "@/types/types";
import { usePatients } from "@/hooks/usePatients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientCareLevelSelect } from "@/components/control-panel/PatientCareLevelSelect";
import { useUsers } from "@/hooks/useUsers";
import { PATIENT_REFERRAL_SOURCES } from "@/lib/patient-referral-sources";

function clinicalToForm(cp: PatientClinicalProfile | undefined) {
  const o =
    cp != null && typeof cp === "object" && !Array.isArray(cp)
      ? cp
      : {};
  const allergies = Array.isArray(o.allergies) ? (o.allergies as string[]).join(", ") : "";
  const notes = typeof o.notes === "string" ? o.notes : "";
  const referral_source =
    typeof o.referral_source === "string" && o.referral_source ? o.referral_source : "control_panel";
  const referral_detail = typeof o.referral_detail === "string" ? o.referral_detail : "";
  return { allergies, notes, referral_source, referral_detail };
}

function buildClinicalPayload(
  prev: PatientClinicalProfile | undefined,
  allergiesCsv: string,
  notes: string,
  referral_source: string,
  referral_detail: string
): PatientClinicalProfile {
  const base =
    prev && typeof prev === "object" && !Array.isArray(prev) ? { ...prev } : {};
  const allergies = allergiesCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const detail =
    referral_source === "external_partner" || referral_source === "other"
      ? referral_detail.trim()
      : "";
  const out: Record<string, unknown> = { ...base, allergies, notes, referral_source };
  if (detail) out.referral_detail = detail;
  else delete out.referral_detail;
  return out as PatientClinicalProfile;
}

export function PatientDetailForm({
  patient,
  formId = "patient-detail-form",
  onSaved,
  submitActions,
}: {
  patient: Patient;
  formId?: string;
  onSaved?: () => void;
  /** Optional footer slot (e.g. sticky bar submit) — omit default Save row when set */
  submitActions?: "default" | "none";
}) {
  const router = useRouter();
  const { updatePatient, isUpdating, deletePatient, isDeleting } = usePatients();
  const { data: doctorsData } = useUsers({ role: "doctor", limit: 200 });
  const doctors = doctorsData?.users ?? [];
  const [form, setForm] = useState({
    firstname: patient.firstname,
    lastname: patient.lastname,
    birth_date: patient.birth_date ?? "",
    care_level: patient.care_level ?? undefined,
    pronoun: patient.pronoun ?? "",
    active: patient.active,
    primary_doctor_id: patient.primary_doctor_id ?? undefined as string | undefined,
    ...clinicalToForm(patient.clinical_profile),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clinical_profile = buildClinicalPayload(
      patient.clinical_profile,
      form.allergies,
      form.notes,
      form.referral_source,
      form.referral_detail
    );
    updatePatient(
      {
        id: patient.id,
        firstname: form.firstname,
        lastname: form.lastname,
        birth_date: form.birth_date || undefined,
        care_level: form.care_level,
        pronoun: form.pronoun || undefined,
        active: form.active,
        clinical_profile,
        primary_doctor_id:
          form.primary_doctor_id && form.primary_doctor_id.length > 0
            ? form.primary_doctor_id
            : null,
      },
      {
        onSuccess: () => {
          onSaved?.();
        },
      }
    );
  };

  const handleDelete = () => {
    deletePatient(patient.id, { onSuccess: () => router.push("/control-panel/patient-management") });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="patient-firstname">First name</Label>
          <Input
            id="patient-firstname"
            title="First name"
            required
            value={form.firstname}
            onChange={(e) => setForm((p) => ({ ...p, firstname: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="patient-lastname">Last name</Label>
          <Input
            id="patient-lastname"
            title="Last name"
            required
            value={form.lastname}
            onChange={(e) => setForm((p) => ({ ...p, lastname: e.target.value }))}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="patient-email">Email</Label>
          {/* Read-only: PUT /api/patients/[id] does not persist email changes */}
          <Input
            id="patient-email"
            type="email"
            title="Email (read-only)"
            value={patient.email ?? ""}
            readOnly
            className="bg-muted/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="patient-birthdate">Birth date</Label>
          <Input
            id="patient-birthdate"
            type="date"
            title="Birth date"
            value={form.birth_date}
            onChange={(e) => setForm((p) => ({ ...p, birth_date: e.target.value }))}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="patient-carelevel">Care level (1–10)</Label>
          <PatientCareLevelSelect
            id="patient-carelevel"
            value={form.care_level}
            onValueChange={(next) => setForm((p) => ({ ...p, care_level: next }))}
            aria-label="Care level tier from 1 to 10"
            className="w-full"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="patient-primary-doctor">Primary doctor (care team)</Label>
          <Select
            value={form.primary_doctor_id ?? "none"}
            onValueChange={(v) =>
              setForm((p) => ({ ...p, primary_doctor_id: v === "none" ? undefined : v }))
            }
          >
            <SelectTrigger id="patient-primary-doctor" className="w-full min-w-0 rounded-2xl border-gray-200">
              <SelectValue placeholder="Not assigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not assigned</SelectItem>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.display_name?.trim() || d.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Referral / intake</Label>
          <Select
            value={form.referral_source}
            onValueChange={(v) => setForm((p) => ({ ...p, referral_source: v }))}
          >
            <SelectTrigger className="w-full min-w-0 rounded-2xl border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PATIENT_REFERRAL_SOURCES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(form.referral_source === "external_partner" || form.referral_source === "other") && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="patient-referral-detail">External / other detail</Label>
            <Input
              id="patient-referral-detail"
              title="Referral detail"
              value={form.referral_detail}
              onChange={(e) => setForm((p) => ({ ...p, referral_detail: e.target.value }))}
              placeholder="Clinic name, referrer, or context"
              className="rounded-2xl border-gray-200"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>Pronoun</Label>
          <Select value={form.pronoun} onValueChange={(v) => setForm((p) => ({ ...p, pronoun: v }))}>
            <SelectTrigger className="w-full min-w-0 rounded-2xl border-gray-200">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="he/him">he/him</SelectItem>
              <SelectItem value="she/her">she/her</SelectItem>
              <SelectItem value="they/them">they/them</SelectItem>
              <SelectItem value="other">other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Active</Label>
          <Select
            value={form.active ? "yes" : "no"}
            onValueChange={(v) => setForm((p) => ({ ...p, active: v === "yes" }))}
          >
            <SelectTrigger className="w-full min-w-0 rounded-2xl border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="patient-allergies">Allergies (comma-separated)</Label>
          <Input
            id="patient-allergies"
            title="Allergies"
            value={form.allergies}
            onChange={(e) => setForm((p) => ({ ...p, allergies: e.target.value }))}
            placeholder="e.g. penicillin, latex"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="patient-clinical-notes">Clinical notes</Label>
          <Textarea
            id="patient-clinical-notes"
            title="Clinical notes"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
        </div>
      </div>
      {submitActions !== "none" && (
        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save changes"}
          </Button>
          <ConfirmActionDialog
            trigger={
              <Button type="button" variant="destructive" disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            }
            title="Permanently remove this patient?"
            subtitle={
              <>
                This will delete{" "}
                <span className="font-medium text-gray-800">
                  {`${patient.firstname} ${patient.lastname}`.trim()}
                  {patient.email ? ` (${patient.email})` : ""}
                </span>{" "}
                and all related data. You cannot undo this action.
              </>
            }
            confirmLabel="Delete"
            onConfirm={handleDelete}
          />
        </div>
      )}
    </form>
  );
}
