"use client";

/**
 * Doctor-owned appointment types CRUD — same APIs as CP; portal skips router.refresh.
 */

import { useMemo, useState } from "react";
import { Clock, Loader2, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DoctorSettingsGlassInput } from "@/components/shared/doctor-settings/DoctorSettingsGlassInput";
import { DoctorSettingsGlassListRow } from "@/components/shared/doctor-settings/DoctorSettingsGlassListRow";
import { cn, toTitleCaseLabel } from "@/lib/utils";
import {
  useAppointmentTypeMutations,
  useAppointmentTypesForDoctor,
  type AppointmentTypeApiRow,
} from "@/hooks/useAppointmentTypes";
import { APPOINTMENT_TYPE_COPY } from "@/lib/appointment-type-copy";
import type { DoctorAppointmentTypesQueryData } from "@/lib/doctor-portal-settings-prefetch";
import type { DoctorSettingsVariant } from "@/lib/doctor-schedule-types";
import { doctorSettingsAddFormClass, doctorSettingsActionButtonClass } from "@/components/shared/doctor-settings/doctor-settings-classes";
import { DOCTOR_PORTAL_VISIT_TYPE_COPY } from "@/lib/doctor-portal-visit-type-copy";
import { doctorSettingsPortalIntroClass } from "@/lib/doctor-settings-glass-surfaces";

type Props = {
  doctorId: string;
  variant?: DoctorSettingsVariant;
  initialAppointmentTypes?: DoctorAppointmentTypesQueryData;
};

export function DoctorAdditionalTypesEditor({
  doctorId,
  variant = "control-panel",
  initialAppointmentTypes,
}: Props) {
  const refreshRsc = variant === "control-panel";
  const isPortal = variant === "portal";
  const { data, isLoading, isError } = useAppointmentTypesForDoctor(doctorId, {
    initialData: initialAppointmentTypes,
  });
  const { createType, updateType, deleteType, isCreating, isUpdating, isDeleting } =
    useAppointmentTypeMutations(doctorId, { refreshRsc });

  const ownedTypes = useMemo(
    () =>
      (data?.types ?? []).filter(
        (t): t is AppointmentTypeApiRow & { user_id: string } => t.user_id === doctorId
      ),
    [data?.types, doctorId]
  );

  const [newName, setNewName] = useState("");
  const [newDuration, setNewDuration] = useState("30");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDuration, setEditDuration] = useState("");

  const busy = isCreating || isUpdating || isDeleting;

  const startEdit = (t: AppointmentTypeApiRow) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditDuration(String(t.duration_minutes));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDuration("");
  };

  const handleCreate = async () => {
    const name = newName.trim();
    const duration = Number.parseInt(newDuration, 10);
    if (!name || !Number.isFinite(duration)) return;
    await createType({ name, duration_minutes: duration });
    setNewName("");
    setNewDuration("30");
  };

  const handleSaveEdit = async (id: string) => {
    const name = editName.trim();
    const duration = Number.parseInt(editDuration, 10);
    if (!name || !Number.isFinite(duration)) return;
    await updateType({ id, name, duration_minutes: duration });
    cancelEdit();
  };

  const listBodyLoading = isLoading && data === undefined;

  const addForm = (
    <div className={cn(doctorSettingsAddFormClass.additional)}>
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800/90">
        <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {toTitleCaseLabel("Add type")}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label
              htmlFor={`new-appt-type-name-${doctorId}`}
              className="flex items-center gap-1.5 text-xs text-gray-700"
            >
              <Tag className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
              {toTitleCaseLabel("Name")}
            </Label>
            <DoctorSettingsGlassInput
              id={`new-appt-type-name-${doctorId}`}
              tone="emerald"
              density="compact"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={toTitleCaseLabel("e.g. Follow-up visit")}
              disabled={busy}
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor={`new-appt-type-duration-${doctorId}`}
              className="flex items-center gap-1.5 text-xs text-gray-700"
            >
              <Clock className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
              {toTitleCaseLabel("Duration (minutes)")}
            </Label>
            <DoctorSettingsGlassInput
              id={`new-appt-type-duration-${doctorId}`}
              tone="emerald"
              density="compact"
              type="number"
              min={5}
              max={720}
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              disabled={busy}
            />
          </div>
        </div>
        <button
          type="button"
          disabled={busy || !newName.trim()}
          onClick={() => void handleCreate()}
          className={cn(
            doctorSettingsActionButtonClass.emerald,
            "inline-flex shrink-0 items-center justify-center disabled:opacity-50"
          )}
        >
          {isCreating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Plus className="h-3.5 w-3.5" aria-hidden />
          )}
          {toTitleCaseLabel("Add")}
        </button>
      </div>
    </div>
  );

  if (listBodyLoading) {
    return (
      <div className="space-y-3">
        {isPortal ? <Skeleton className="h-10 w-full rounded-xl" aria-hidden /> : null}
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-2xl" />
        ))}
        {isPortal ? addForm : null}
      </div>
    );
  }

  if (isError) {
    return <p className="py-2 text-sm text-red-600">Could not load additional appointment types.</p>;
  }

  return (
    <div className="space-y-4">
      <p className={isPortal ? doctorSettingsPortalIntroClass : "text-xs text-muted-foreground leading-relaxed"}>
        {isPortal ? DOCTOR_PORTAL_VISIT_TYPE_COPY.additionalTypesIntro : APPOINTMENT_TYPE_COPY.additionalSectionBlurb}
      </p>

      {ownedTypes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isPortal
            ? DOCTOR_PORTAL_VISIT_TYPE_COPY.emptyOwnedTypes
            : "No additional appointment types yet — add your first visit type below."}
        </p>
      ) : (
        <ul className="space-y-2">
          {ownedTypes.map((t) =>
            editingId === t.id ? (
              <li
                key={t.id}
                className={cn(
                  doctorSettingsAddFormClass.additional,
                  "border-solid list-none"
                )}
              >
                  <div className="grid flex-1 gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-1.5 text-xs text-gray-700">
                        <Tag className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                        {toTitleCaseLabel("Name")}
                      </Label>
                      <DoctorSettingsGlassInput
                        tone="emerald"
                        density="compact"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={busy}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="flex items-center gap-1.5 text-xs text-gray-700">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                        {toTitleCaseLabel("Minutes")}
                      </Label>
                      <DoctorSettingsGlassInput
                        tone="emerald"
                        density="compact"
                        type="number"
                        min={5}
                        max={720}
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        disabled={busy}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex shrink-0 justify-end gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs rounded-xl"
                      disabled={busy}
                      onClick={() => void handleSaveEdit(t.id)}
                    >
                      {toTitleCaseLabel("Save")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs"
                      disabled={busy}
                      onClick={cancelEdit}
                    >
                      {toTitleCaseLabel("Cancel")}
                    </Button>
                  </div>
              </li>
            ) : (
              <DoctorSettingsGlassListRow
                key={t.id}
                tone="emerald"
                title={toTitleCaseLabel(t.name)}
                meta={`${t.duration_minutes} min · ${toTitleCaseLabel("slot step")} ${t.slot_interval_minutes} min`}
                trailing={
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-xl border-emerald-200/80 bg-white/80 shadow-[0_4px_12px_rgba(16,185,129,0.1)]"
                      disabled={busy}
                      title={toTitleCaseLabel("Edit type")}
                      onClick={() => startEdit(t)}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-xl border-red-200/80 text-red-600 hover:bg-red-50"
                      disabled={busy}
                      title={toTitleCaseLabel("Delete type")}
                      onClick={() => deleteType(t.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                  </div>
                }
              />
            )
          )}
        </ul>
      )}

      {addForm}
    </div>
  );
}
