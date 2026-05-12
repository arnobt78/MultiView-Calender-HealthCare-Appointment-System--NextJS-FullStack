"use client";

/**
 * Assignees block — maps to `AppointmentAssignee` (shared calendar access: read/write/full), not the
 * appointment’s client (`patient_id`). The client is chosen in Core scheduling; this list is for relatives
 * or other collaborators who need portal/calendar visibility without replacing the client field.
 *
 * Picker rows mirror the client select: `resolvePatientPortraitUrl` for patients (demo + clinical JSON),
 * robohash for relatives without email portraits. `h-11` trigger matches login + general section controls.
 * The assign `Select` stays uncontrolled so the trigger returns to the placeholder after each add (Radix
 * default); chips show the chosen portrait + label.
 */

import { UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SafeImage } from "@/components/ui/safe-image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, toTitleCaseLabel } from "@/lib/utils";
import { resolvePatientPortraitUrl } from "@/lib/patient-portrait";
import type { AppointmentAssignee, Patient, Relative } from "@/types/types";

const glassSelectTriggerClass =
  "h-11 min-h-[2.75rem] w-full min-w-0 cursor-pointer rounded-2xl border border-sky-200/50 bg-white/75 px-3 py-0 text-sm leading-none text-gray-700 shadow-[0_8px_24px_rgba(2,132,199,0.14)] backdrop-blur-md hover:bg-white/90 data-[placeholder]:text-gray-500 focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-200/40";

function relativePortraitSrc(r: Relative) {
  return `https://robohash.org/${encodeURIComponent(r.email || r.id)}.png?set=set4&size=64x64`;
}

function PickerAvatar({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-sky-200/80">
      <SafeImage
        src={src}
        alt={alt}
        fill
        sizes="28px"
        className="object-cover object-center"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </span>
  );
}

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
        Optional — Share This Appointment With Relatives Or Another Staff Member For Calendar Access
        (Permissions). This Is Not The Client Field; The Client Is Set Under Core Scheduling.
      </p>
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-gray-700">
          <UserPlus className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
          <Label className="text-gray-700">{toTitleCaseLabel("Assign (Patients / Relatives)")}</Label>
        </div>
        <Select onValueChange={onAddAssignee}>
          <SelectTrigger className={glassSelectTriggerClass}>
            <SelectValue placeholder={toTitleCaseLabel("Select Person")} />
          </SelectTrigger>
          <SelectContent>
            {patientsForPicker.map((p) => (
              <SelectItem key={p.id} value={p.id} textValue={`Patient: ${p.firstname} ${p.lastname}`}>
                <span className="flex items-center gap-2">
                  <PickerAvatar src={resolvePatientPortraitUrl(p)} alt={`${p.firstname} ${p.lastname}`} />
                  <span className="truncate">
                    Patient: {p.firstname} {p.lastname}
                  </span>
                </span>
              </SelectItem>
            ))}
            {relatives.map((r) => (
              <SelectItem key={r.id} value={r.id} textValue={`Relative: ${r.firstname} ${r.lastname}`}>
                <span className="flex items-center gap-2">
                  <PickerAvatar src={relativePortraitSrc(r)} alt={`${r.firstname} ${r.lastname}`} />
                  <span className="truncate">
                    Relative: {r.firstname} {r.lastname}
                  </span>
                </span>
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
                className={cn(
                  "flex items-center gap-1 rounded-2xl border border-sky-200/40 bg-white/70 px-2 py-1 text-xs text-gray-700 shadow-[0_4px_16px_rgba(2,132,199,0.1)] backdrop-blur-sm"
                )}
              >
                {p ? (
                  <>
                    <PickerAvatar src={resolvePatientPortraitUrl(p)} alt={`${p.firstname} ${p.lastname}`} />
                    <span>
                      Patient: {p.firstname} {p.lastname}
                    </span>
                  </>
                ) : r ? (
                  <>
                    <PickerAvatar src={relativePortraitSrc(r)} alt={`${r.firstname} ${r.lastname}`} />
                    <span>
                      Relative: {r.firstname} {r.lastname}
                    </span>
                  </>
                ) : (
                  <span>{a.user}</span>
                )}
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
