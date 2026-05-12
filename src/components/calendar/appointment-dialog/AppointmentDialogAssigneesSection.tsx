"use client";

/**
 * Assignees block — maps to `AppointmentAssignee` (shared calendar access: read/write/full), not the
 * appointment’s client (`patient_id`). The client is chosen in Core scheduling; this list is for relatives
 * or other collaborators who need portal/calendar visibility without replacing the client field.
 *
 * Styling aligns with the appointment dialog sky glass fields (read-only behavior — same handlers as before).
 */

import { UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppointmentAssignee, Patient, Relative } from "@/types/types";

const glassSelectTriggerClass =
  "w-full min-w-0 cursor-pointer rounded-2xl border border-sky-200/50 bg-white/75 text-gray-700 shadow-[0_8px_24px_rgba(2,132,199,0.14)] backdrop-blur-md hover:bg-white/90 data-[placeholder]:text-gray-500 focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-200/40";

type Props = {
  assignees: AppointmentAssignee[];
  patients: Patient[];
  relatives: Relative[];
  /** Current `patient_id` form value — that patient is excluded from the picker to avoid duplicating the client as a “share”. */
  selectedPatientId: string;
  onAddAssignee: (userId: string) => void;
  onRemoveAssignee: (userId: string | null, assigneeId?: string) => void;
};

export function AppointmentDialogAssigneesSection({
  assignees,
  patients,
  relatives,
  selectedPatientId,
  onAddAssignee,
  onRemoveAssignee,
}: Props) {
  const patientsForPicker =
    selectedPatientId.trim().length > 0
      ? patients.filter((p) => p.id !== selectedPatientId)
      : patients;

  return (
    <div className="space-y-3 text-gray-700">
      <p className="text-xs leading-relaxed text-gray-600">
        Optional — share this appointment with relatives or another staff member for calendar access
        (permissions). This is not the client field; the client is set under Core scheduling.
      </p>
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-gray-700">
          <UserPlus className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
          <Label className="text-gray-700">Assign (patients / relatives)</Label>
        </div>
        <Select onValueChange={onAddAssignee}>
          <SelectTrigger className={glassSelectTriggerClass}>
            <SelectValue placeholder="Select person" />
          </SelectTrigger>
          <SelectContent>
            {patientsForPicker.map((p) => (
              <SelectItem key={p.id} value={p.id} textValue={`Patient: ${p.firstname} ${p.lastname}`}>
                Patient: {p.firstname} {p.lastname}
              </SelectItem>
            ))}
            {relatives.map((r) => (
              <SelectItem key={r.id} value={r.id} textValue={`Relative: ${r.firstname} ${r.lastname}`}>
                Relative: {r.firstname} {r.lastname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-1 flex flex-wrap gap-2">
          {assignees.map((a) => {
            const p = patients.find((x) => x.id === a.user);
            const r = relatives.find((x) => x.id === a.user);
            return (
              <span
                key={a.id}
                className="flex items-center gap-1 rounded-2xl border border-sky-200/40 bg-white/70 px-2 py-1 text-xs text-gray-700 shadow-[0_4px_16px_rgba(2,132,199,0.1)] backdrop-blur-sm"
              >
                {p
                  ? `Patient: ${p.firstname} ${p.lastname}`
                  : r
                    ? `Relative: ${r.firstname} ${r.lastname}`
                    : a.user}
                <button
                  type="button"
                  className="ml-1 cursor-pointer text-red-500 hover:underline"
                  onClick={() => onRemoveAssignee(a.user, a.id)}
                >
                  &times;
                </button>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
