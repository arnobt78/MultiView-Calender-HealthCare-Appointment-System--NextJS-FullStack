"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Trash2 } from "lucide-react";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { Patient, type PatientClinicalProfile } from "@/types/types";
import { usePatients } from "@/hooks/usePatients";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { Input } from "@/components/ui/input";
import { FormRequiredMark } from "@/components/shared/form/FormRequiredMark";
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
import { DoctorSelectOption } from "@/components/shared/doctor-display/DoctorSelectOption";
import { PATIENT_REFERRAL_SOURCES } from "@/lib/patient-referral-sources";
import {
  buildClinicalProfileFromDialogExtra,
  clinicalProfileToDialogExtra,
} from "@/lib/patient-form-clinical";

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
  const clinicalExtra = clinicalProfileToDialogExtra(patient.clinical_profile);
  const [form, setForm] = useState({
    firstname: patient.firstname,
    lastname: patient.lastname,
    birth_date: patient.birth_date ?? "",
    care_level: patient.care_level ?? undefined,
    pronoun: patient.pronoun ?? "",
    active: patient.active,
    primary_doctor_id: patient.primary_doctor_id ?? undefined as string | undefined,
    allergies: clinicalExtra.allergiesCsv,
    notes: clinicalExtra.clinicalNotes,
    referral_source: clinicalExtra.referralSource,
    referral_detail: clinicalExtra.referralDetail,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clinical_profile = buildClinicalProfileFromDialogExtra(patient.clinical_profile, {
      allergiesCsv: form.allergies,
      clinicalNotes: form.notes,
      referralSource: form.referral_source,
      referralDetail: form.referral_detail,
    });
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
    deletePatient(
      {
        id: patient.id,
        name: `${patient.firstname} ${patient.lastname}`.trim(),
        email: patient.email,
      },
      { onSuccess: () => router.push("/control-panel/patient-management") }
    );
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4 text-gray-700">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="patient-firstname">
            First Name
            <FormRequiredMark />
          </Label>
          <Input
            id="patient-firstname"
            title="First name"
            required
            value={form.firstname}
            onChange={(e) => setForm((p) => ({ ...p, firstname: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="patient-lastname">
            Last Name
            <FormRequiredMark />
          </Label>
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
          <Label htmlFor="patient-birthdate">Birth Date</Label>
          <Input
            id="patient-birthdate"
            type="date"
            title="Birth date"
            value={form.birth_date}
            onChange={(e) => setForm((p) => ({ ...p, birth_date: e.target.value }))}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="patient-carelevel">Care Level (1–10)</Label>
          <PatientCareLevelSelect
            id="patient-carelevel"
            value={form.care_level}
            onValueChange={(next) => setForm((p) => ({ ...p, care_level: next }))}
            aria-label="Care level tier from 1 to 10"
            className="w-full"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="patient-primary-doctor">Select Primary Doctor (Care Team)</Label>
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
                <SelectItem key={d.id} value={d.id} textValue={d.display_name?.trim() || d.email}>
                  <DoctorSelectOption doctor={d} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Select Referral / Intake</Label>
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
            <Label htmlFor="patient-referral-detail">Type External / Other Detail</Label>
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
          <Label>Select Pronoun</Label>
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
          <Label>Select Active</Label>
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
          <Label htmlFor="patient-allergies">Type Allergies if Any (Comma-Separated)</Label>
          <Input
            id="patient-allergies"
            title="Allergies"
            value={form.allergies}
            onChange={(e) => setForm((p) => ({ ...p, allergies: e.target.value }))}
            placeholder="e.g. penicillin, latex"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="patient-clinical-notes">Clinical Notes</Label>
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
        <div className="flex flex-wrap gap-2 border-t border-slate-200/80 pt-4">
          <ControlPanelGlassActionButton type="submit" variant="emerald" disabled={isUpdating}>
            {isUpdating ? (
              <Loader2 className="shrink-0 animate-spin" aria-hidden />
            ) : (
              <Save className="shrink-0" aria-hidden />
            )}
            {isUpdating ? "Saving Changes…" : "Save Changes"}
          </ControlPanelGlassActionButton>
          <ConfirmActionDialog
            trigger={
              <ControlPanelGlassActionButton type="button" variant="rose" disabled={isDeleting}>
                <Trash2 className="shrink-0" aria-hidden />
                {isDeleting ? "Deleting…" : "Delete"}
              </ControlPanelGlassActionButton>
            }
            title="Permanently Remove This Patient?"
            subtitle={
              <>
                This will delete{" "}
                <span className="text-gray-700">
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
