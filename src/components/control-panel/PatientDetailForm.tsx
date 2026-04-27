"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { Patient } from "@/types/types";
import { usePatients } from "@/hooks/usePatients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PatientDetailForm({ patient }: { patient: Patient }) {
  const router = useRouter();
  const { updatePatient, isUpdating, deletePatient, isDeleting } = usePatients();
  const [form, setForm] = useState({
    firstname: patient.firstname,
    lastname: patient.lastname,
    birth_date: patient.birth_date ?? "",
    care_level: patient.care_level != null ? String(patient.care_level) : "",
    pronoun: patient.pronoun ?? "",
    email: patient.email ?? "",
    active: patient.active,
  });

  const handleSave = () => {
    updatePatient({
      id: patient.id,
      firstname: form.firstname,
      lastname: form.lastname,
      birth_date: form.birth_date || undefined,
      care_level: form.care_level === "" ? undefined : Number(form.care_level),
      pronoun: form.pronoun || undefined,
      email: form.email || undefined,
      active: form.active,
    });
  };

  const handleDelete = () => {
    deletePatient(patient.id, { onSuccess: () => router.push("/control-panel") });
  };

  return (
    <div className="border-t pt-4 space-y-2">
      <h4 className="font-medium">Edit</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="patient-firstname">First name</Label>
          <Input
            id="patient-firstname"
            title="First name"
            value={form.firstname}
            onChange={(e) => setForm((p) => ({ ...p, firstname: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="patient-lastname">Last name</Label>
          <Input
            id="patient-lastname"
            title="Last name"
            value={form.lastname}
            onChange={(e) => setForm((p) => ({ ...p, lastname: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="patient-email">Email</Label>
          <Input
            id="patient-email"
            type="email"
            title="Email address"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
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
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
          <Select value={form.active ? "yes" : "no"} onValueChange={(v) => setForm((p) => ({ ...p, active: v === "yes" }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isUpdating}>{isUpdating ? "Saving..." : "Save"}</Button>
        <ConfirmActionDialog
          trigger={
            <Button variant="destructive" disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete"}</Button>
          }
          title="Delete patient?"
          subtitle="This action cannot be undone and removes this patient record."
          confirmLabel="Delete"
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}
