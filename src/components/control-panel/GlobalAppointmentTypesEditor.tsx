"use client";

/**
 * Control-panel admin UI for **global** `AppointmentType` rows (`user_id = null`) — shared across every doctor
 * for portal + `/services` + slot duration fallbacks. Mutations call `POST /api/appointment-types/global` and
 * the shared `[id]` PATCH/DELETE routes (admin-only for global rows on the server).
 */

import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  useGlobalAppointmentTypeMutations,
  useGlobalAppointmentTypes,
  type AppointmentTypeApiRow,
} from "@/hooks/useAppointmentTypes";
import { APPOINTMENT_TYPE_COPY } from "@/lib/appointment-type-copy";

export function GlobalAppointmentTypesEditor() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data, isLoading, isError } = useGlobalAppointmentTypes();
  const { createGlobalType, updateGlobalType, deleteGlobalType, isCreating, isUpdating, isDeleting } =
    useGlobalAppointmentTypeMutations();

  const types = useMemo(() => (data?.types ?? []) as AppointmentTypeApiRow[], [data?.types]);

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
    if (!isAdmin) return;
    const name = newName.trim();
    const duration = Number.parseInt(newDuration, 10);
    if (!name || !Number.isFinite(duration)) return;
    await createGlobalType({ name, duration_minutes: duration });
    setNewName("");
    setNewDuration("30");
  };

  const handleSaveEdit = async (id: string) => {
    if (!isAdmin) return;
    const name = editName.trim();
    const duration = Number.parseInt(editDuration, 10);
    if (!name || !Number.isFinite(duration)) return;
    await updateGlobalType({ id, name, duration_minutes: duration });
    cancelEdit();
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
        Loading global visit types…
      </div>
    );
  }

  if (isError) {
    return <p className="py-2 text-sm text-red-600">Could not load global appointment types.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        {APPOINTMENT_TYPE_COPY.globalSectionBlurb}
      </p>

      {!isAdmin ? (
        <p className="rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-xs text-amber-900">
          You can view this list; changing global visit types requires an admin account.
        </p>
      ) : null}

      {types.length === 0 ? (
        <p className="text-sm text-muted-foreground">No global types — add one below (admin).</p>
      ) : (
        <ul className="space-y-2">
          {types.map((t) => (
            <li
              key={t.id}
              className="flex flex-col gap-2 rounded-lg border bg-sky-50/40 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between"
            >
              {editingId === t.id && isAdmin ? (
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="grid flex-1 gap-1 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wide text-sky-900/80">Name</Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={busy}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wide text-sky-900/80">Minutes</Label>
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
                      onClick={() => void handleSaveEdit(t.id)}
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
                  {isAdmin ? (
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 border-sky-200/80"
                        disabled={busy}
                        title="Edit global type"
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
                        title="Delete global type"
                        onClick={() => void deleteGlobalType(t.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {isAdmin ? (
        <div className={cn("rounded-lg border border-dashed border-sky-200/80 bg-white/60 p-3")}>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-sky-900/80">Add global type</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="global-appt-type-name" className="text-xs">
                  Title/Description
                </Label>
                <Input
                  id="global-appt-type-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. General consultation"
                  disabled={busy}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="global-appt-type-duration" className="text-xs">
                  Duration (minutes)
                </Label>
                <Input
                  id="global-appt-type-duration"
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
              className="h-9 shrink-0 gap-1 bg-sky-700 text-white hover:bg-sky-800"
              disabled={busy || !newName.trim()}
              onClick={() => void handleCreate()}
            >
              {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Plus className="h-3.5 w-3.5" aria-hidden />}
              Add
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
