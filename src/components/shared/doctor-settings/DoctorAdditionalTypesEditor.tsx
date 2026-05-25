"use client";

/**
 * Doctor-owned appointment types CRUD — same APIs as CP; portal skips router.refresh.
 */

import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  useAppointmentTypeMutations,
  useAppointmentTypesForDoctor,
  type AppointmentTypeApiRow,
} from "@/hooks/useAppointmentTypes";
import { APPOINTMENT_TYPE_COPY } from "@/lib/appointment-type-copy";
import type { DoctorSettingsVariant } from "@/lib/doctor-schedule-types";
import { doctorSettingsAddFormClass } from "@/components/shared/doctor-settings/doctor-settings-classes";

type Props = {
  doctorId: string;
  variant?: DoctorSettingsVariant;
};

export function DoctorAdditionalTypesEditor({
  doctorId,
  variant = "control-panel",
}: Props) {
  const refreshRsc = variant === "control-panel";
  const { data, isLoading, isError } = useAppointmentTypesForDoctor(doctorId);
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

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
        Loading additional appointment types…
      </div>
    );
  }

  if (isError) {
    return <p className="py-2 text-sm text-red-600">Could not load additional appointment types.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        {APPOINTMENT_TYPE_COPY.additionalSectionBlurb}
      </p>

      {ownedTypes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No additional appointment types yet — add your first visit type below.
        </p>
      ) : (
        <ul className="space-y-2">
          {ownedTypes.map((t) => (
            <li
              key={t.id}
              className="flex flex-col gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-3 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between"
            >
              {editingId === t.id ? (
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="grid flex-1 gap-1 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wide text-emerald-900/80">
                        Name
                      </Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={busy}
                        className="h-9 text-xs rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wide text-emerald-900/80">
                        Minutes
                      </Label>
                      <Input
                        type="number"
                        min={5}
                        max={720}
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        disabled={busy}
                        className="h-9 text-xs rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs"
                      disabled={busy}
                      onClick={() => void handleSaveEdit(t.id)}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs"
                      disabled={busy}
                      onClick={cancelEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-800">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {t.duration_minutes} min · slot step {t.slot_interval_minutes} min
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-emerald-200/80"
                      disabled={busy}
                      title="Edit type"
                      onClick={() => startEdit(t)}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-red-200/80 text-red-600 hover:bg-red-50"
                      disabled={busy}
                      title="Delete type"
                      onClick={() => deleteType(t.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className={cn(doctorSettingsAddFormClass.additional)}>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-900/80">
          Add type
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`new-appt-type-name-${doctorId}`} className="text-xs">
                Name
              </Label>
              <Input
                id={`new-appt-type-name-${doctorId}`}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Follow-up visit"
                disabled={busy}
                className="h-9 text-sm rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`new-appt-type-duration-${doctorId}`} className="text-xs">
                Duration (minutes)
              </Label>
              <Input
                id={`new-appt-type-duration-${doctorId}`}
                type="number"
                min={5}
                max={720}
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                disabled={busy}
                className="h-9 text-sm rounded-xl"
              />
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            className="h-9 shrink-0 gap-1 bg-emerald-700 text-white hover:bg-emerald-800 rounded-xl"
            disabled={busy || !newName.trim()}
            onClick={() => void handleCreate()}
          >
            {isCreating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-3.5 w-3.5" aria-hidden />
            )}
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
