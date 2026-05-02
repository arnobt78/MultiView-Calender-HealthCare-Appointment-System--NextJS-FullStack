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

function clinicalToForm(cp: PatientClinicalProfile | undefined) {
  const o =
    cp != null && typeof cp === "object" && !Array.isArray(cp)
      ? cp
      : {};
  const allergies = Array.isArray(o.allergies) ? (o.allergies as string[]).join(", ") : "";
  const notes = typeof o.notes === "string" ? o.notes : "";
  return { allergies, notes };
}

function buildClinicalPayload(
  prev: PatientClinicalProfile | undefined,
  allergiesCsv: string,
  notes: string
): PatientClinicalProfile {
  const base =
    prev && typeof prev === "object" && !Array.isArray(prev) ? { ...prev } : {};
  const allergies = allergiesCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { ...base, allergies, notes };
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
  const [form, setForm] = useState({
    firstname: patient.firstname,
    lastname: patient.lastname,
    birth_date: patient.birth_date ?? "",
    care_level: patient.care_level != null ? String(patient.care_level) : "",
    pronoun: patient.pronoun ?? "",
    active: patient.active,
    ...clinicalToForm(patient.clinical_profile),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clinical_profile = buildClinicalPayload(
      patient.clinical_profile,
      form.allergies,
      form.notes
    );
    updatePatient(
      {
        id: patient.id,
        firstname: form.firstname,
        lastname: form.lastname,
        birth_date: form.birth_date || undefined,
        care_level: form.care_level === "" ? undefined : Number(form.care_level),
        pronoun: form.pronoun || undefined,
        active: form.active,
        clinical_profile,
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
        <div className="space-y-2">
          <Label htmlFor="patient-carelevel">Care level</Label>
          <Input
            id="patient-carelevel"
            type="number"
            title="Care level"
            value={form.care_level}
            onChange={(e) => setForm((p) => ({ ...p, care_level: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Pronoun</Label>
          <Select value={form.pronoun} onValueChange={(v) => setForm((p) => ({ ...p, pronoun: v }))}>
            <SelectTrigger>
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
            <SelectTrigger>
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
