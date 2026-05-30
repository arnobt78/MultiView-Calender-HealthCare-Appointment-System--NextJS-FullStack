"use client";

import { useMemo } from "react";
import { UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SafeImage } from "@/components/ui/safe-image";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, toTitleCaseLabel } from "@/lib/utils";
import { resolvePatientPortraitUrl } from "@/lib/patient-portrait";
import { patientSelectSearchText } from "@/lib/patient-select-display";
import {
  isPatientActive,
  partitionForBookingSelect,
  sortPatientsForBookingSelect,
} from "@/lib/entity-active-status";
import { ActiveInactiveSelectSections } from "@/components/shared/select/ActiveInactiveSelectSections";
import {
  PatientSelectOption,
  patientSelectItemClass,
} from "@/components/shared/person-display/PatientSelectOption";
import type { AppointmentAssignee, Patient } from "@/types/types";

const glassSelectTriggerClass =
  "h-11 min-h-[2.75rem] w-full min-w-0 cursor-pointer rounded-2xl border border-sky-200/50 bg-white/75 px-3 py-0 text-sm leading-none text-gray-700 shadow-[0_8px_24px_rgba(2,132,199,0.14)] backdrop-blur-md hover:bg-white/90 data-[placeholder]:text-gray-500 focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-200/40";

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
  /** Current `patient_id` form value — that patient is excluded from the picker to avoid duplicating the client as a "share". */
  selectedPatientId: string;
  onAddAssignee: (userId: string) => void;
  onRemoveAssignee: (userId: string | null, assigneeId?: string) => void;
};

export function AppointmentDialogAssigneesSection({
  assignees,
  patients,
  selectedPatientId,
  onAddAssignee,
  onRemoveAssignee,
}: Props) {
  const patientsForPicker = useMemo(
    () =>
      selectedPatientId.trim().length > 0
        ? patients.filter((p) => p.id !== selectedPatientId)
        : patients,
    [patients, selectedPatientId]
  );

  const patientSelectPartition = useMemo(
    () =>
      partitionForBookingSelect({
        items: patientsForPicker,
        isActive: isPatientActive,
        getId: (p) => p.id,
        sortSelectable: sortPatientsForBookingSelect,
      }),
    [patientsForPicker]
  );

  return (
    <div className="space-y-3 text-gray-700">
      <p className="text-xs leading-relaxed text-gray-600">
        Optional — Share This Appointment With Another Patient For Calendar Access
        (Permissions). This Is Not The Client Field; The Client Is Set Under Core Scheduling.
      </p>
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-gray-700">
          <UserPlus className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
          <Label className="text-gray-700">{toTitleCaseLabel("Assign (Patients)")}</Label>
        </div>
        <Select onValueChange={onAddAssignee}>
          <SelectTrigger className={glassSelectTriggerClass}>
            <SelectValue placeholder={toTitleCaseLabel("Select Person")} />
          </SelectTrigger>
          <SelectContent>
            <ActiveInactiveSelectSections
              selectable={patientSelectPartition.selectable}
              inactiveDisplay={patientSelectPartition.inactiveDisplay}
              getItemKey={(p) => p.id}
              getTextValue={patientSelectSearchText}
              selectableItemClassName={patientSelectItemClass}
              renderSelectableItem={(p) => <PatientSelectOption patient={p} />}
              renderInactiveItem={(p) => <PatientSelectOption patient={p} />}
            />
          </SelectContent>
        </Select>
        <div className="mt-1 flex flex-wrap gap-2">
          {assignees.map((a) => {
            const p = patients.find((x) => x.id === a.user);
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
