"use client";

/**
 * Control-panel editor for **doctor-owned** `AppointmentType` rows (same resource the booking slot API uses).
 * Global types (`user_id = null`) are read-only here — they still appear in `GET /api/appointment-types` for
 * patients but cannot be mutated through this UI (RBAC enforced again in `/api/appointment-types/[id]`).
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

type Props = {
  /** Prisma `users.id` for the doctor profile being viewed — POST `user_id` must match this value. */
  doctorId: string;
};

export function DoctorAppointmentTypesEditor({ doctorId }: Props) {
  const { data, isLoading, isError } = useAppointmentTypesForDoctor(doctorId);
  const { createType, updateType, deleteType, isCreating, isUpdating, isDeleting } =
    useAppointmentTypeMutations(doctorId);

  const ownedTypes = useMemo(
    () => (data?.types ?? []).filter((t): t is AppointmentTypeApiRow & { user_id: string } => t.user_id === doctorId),
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
        Loading appointment types…
      </div>
    );
  }

  if (isError) {
    return <p className="py-2 text-sm text-red-600">Could not load appointment types.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Custom visit lengths power the Cal-style slot engine (`/api/availability/slots`). Global templates
        (`user_id` null) still apply to this doctor but are edited outside this panel.
      </p>

      {ownedTypes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No custom appointment types yet — add one below.</p>
      ) : (
        <ul className="space-y-2">
          {ownedTypes.map((t) => (
            <li
              key={t.id}
              className="flex flex-col gap-2 rounded-lg border bg-emerald-50/40 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between"
            >
              {editingId === t.id ? (
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="grid flex-1 gap-1 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wide text-emerald-900/80">Name</Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={busy}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wide text-emerald-900/80">Minutes</Label>
                      <Input
                        type="number"
                        min={5}
                        max={720}
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        disabled={busy}
                        className="h-9 text-xs"
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
                      onClick={() => handleSaveEdit(t.id)}
                    >
                      Save
                    </Button>
                    <Button type="button" size="sm" variant="ghost" className="h-8 text-xs" disabled={busy} onClick={cancelEdit}>
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

      <div className={cn("rounded-lg border border-dashed border-emerald-200/80 bg-white/60 p-3")}>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-900/80">Add type</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="new-appt-type-name" className="text-xs">
                Name
              </Label>
              <Input
                id="new-appt-type-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Follow-up visit"
                disabled={busy}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-appt-type-duration" className="text-xs">
                Duration (minutes)
              </Label>
              <Input
                id="new-appt-type-duration"
                type="number"
                min={5}
                max={720}
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                disabled={busy}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            className="h-9 shrink-0 gap-1 bg-emerald-700 text-white hover:bg-emerald-800"
            disabled={busy || !newName.trim()}
            onClick={() => void handleCreate()}
          >
            {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Plus className="h-3.5 w-3.5" aria-hidden />}
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
