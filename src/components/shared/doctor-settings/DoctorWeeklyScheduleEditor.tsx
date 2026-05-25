"use client";

/**
 * Weekly DoctorAvailability CRUD — grouped by weekday, inline PATCH edit, shared CP + portal.
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateDoctorSchedule } from "@/lib/query-client";
import { notify } from "@/lib/notify";
import type { AvailabilityWindow, DoctorSettingsVariant } from "@/lib/doctor-schedule-types";
import {
  DEFAULT_DOCTOR_TIMEZONE,
  WEEKDAY_LABELS,
  groupAvailabilityByWeekday,
  minsToTime,
  resolveBrowserTimezone,
  sharedAvailabilityTimezone,
  timeToMins,
} from "@/lib/doctor-schedule-display";
import { DoctorAvailabilityGroups } from "@/components/shared/doctor-display/DoctorAvailabilityGroups";
import { useCanEditDoctorSettings } from "@/components/shared/doctor-settings/useCanEditDoctorSettings";
import {
  doctorSettingsAddFormClass,
  doctorSettingsRowClass,
} from "@/components/shared/doctor-settings/doctor-settings-classes";
import { cn } from "@/lib/utils";

type Props = {
  doctorId: string;
  variant?: DoctorSettingsVariant;
  /** Portal: compact summary above the editable list. */
  showSummaryPreview?: boolean;
};

export function DoctorWeeklyScheduleEditor({
  doctorId,
  variant = "control-panel",
  showSummaryPreview = variant === "portal",
}: Props) {
  const queryClient = useQueryClient();
  const canEdit = useCanEditDoctorSettings(doctorId);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  const { data: availData, isLoading: availLoading } = useQuery({
    queryKey: queryKeys.doctors.availability(doctorId),
    queryFn: () =>
      apiClient<{ availability: AvailabilityWindow[] }>(
        `/api/doctor-availability?doctorId=${encodeURIComponent(doctorId)}`
      ),
    staleTime: 60_000,
  });
  const windows = availData?.availability ?? [];
  const grouped = groupAvailabilityByWeekday(windows);
  const singleTz = sharedAvailabilityTimezone(windows);

  const browserTz = resolveBrowserTimezone();
  const [newWeekday, setNewWeekday] = useState("1");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("17:00");
  const [newTz, setNewTz] = useState(browserTz);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeekday, setEditWeekday] = useState("1");
  const [editStartTime, setEditStartTime] = useState("09:00");
  const [editEndTime, setEditEndTime] = useState("17:00");
  const [editTz, setEditTz] = useState(browserTz);

  const addWindowMutation = useMutation({
    mutationFn: (data: { weekday: number; start_min: number; end_min: number; timezone: string }) =>
      apiClient("/api/doctor-availability", {
        method: "POST",
        body: JSON.stringify({ doctorId, ...data }),
      }),
    onSuccess: async () => {
      await invalidateDoctorSchedule(queryClient, doctorId);
      notify.crud({ action: "created", entity: "Availability window", detail: "Weekly schedule updated." });
      setNewStartTime("09:00");
      setNewEndTime("17:00");
    },
    onError: () =>
      notify.error({ title: "Failed to add availability window", subtitle: "Please try again." }),
  });

  const patchWindowMutation = useMutation({
    mutationFn: (vars: {
      id: string;
      weekday: number;
      start_min: number;
      end_min: number;
      timezone: string;
    }) => {
      const { id, ...patch } = vars;
      return apiClient(`/api/doctor-availability/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    },
    onSuccess: async () => {
      await invalidateDoctorSchedule(queryClient, doctorId);
      notify.crud({ action: "updated", entity: "Availability window", detail: "Weekly schedule updated." });
      setEditingId(null);
    },
    onError: () =>
      notify.error({ title: "Failed to update window", subtitle: "Please try again." }),
  });

  const deleteWindowMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/doctor-availability/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await invalidateDoctorSchedule(queryClient, doctorId);
      notify.crud({ action: "deleted", entity: "Availability window", detail: "Weekly schedule updated." });
      if (editingId) setEditingId(null);
    },
    onError: () =>
      notify.error({ title: "Failed to delete availability window", subtitle: "Please try again." }),
  });

  function startEdit(w: AvailabilityWindow) {
    setEditingId(w.id);
    setEditWeekday(String(w.weekday));
    setEditStartTime(minsToTime(w.start_min));
    setEditEndTime(minsToTime(w.end_min));
    setEditTz(w.timezone);
  }

  function handleAddWindow() {
    const start_min = timeToMins(newStartTime);
    const end_min = timeToMins(newEndTime);
    if (start_min >= end_min) {
      notify.error({
        title: "Start time must be before end time",
        subtitle: "Adjust the times and try again.",
      });
      return;
    }
    addWindowMutation.mutate({
      weekday: Number(newWeekday),
      start_min,
      end_min,
      timezone: newTz.trim() || browserTz,
    });
  }

  function handleSaveEdit(id: string) {
    const start_min = timeToMins(editStartTime);
    const end_min = timeToMins(editEndTime);
    if (start_min >= end_min) {
      notify.error({
        title: "Start time must be before end time",
        subtitle: "Adjust the times and try again.",
      });
      return;
    }
    patchWindowMutation.mutate({
      id,
      weekday: Number(editWeekday),
      start_min,
      end_min,
      timezone: editTz.trim() || browserTz,
    });
  }

  const loading = !isMounted || availLoading;
  const busy =
    addWindowMutation.isPending ||
    patchWindowMutation.isPending ||
    deleteWindowMutation.isPending;

  return (
    <div className={cn("space-y-4", variant === "portal" && "text-gray-700")}>
      {showSummaryPreview && !loading && windows.length > 0 ? (
        <DoctorAvailabilityGroups availabilities={windows} layout="stacked" className="mb-1" />
      ) : null}

      {singleTz ? (
        <p className="text-[11px] text-muted-foreground">
          All hours use timezone <span className="font-medium text-gray-700">{singleTz}</span>
        </p>
      ) : null}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : windows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No weekly hours configured.</p>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.weekday} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-800/80">
                {group.label}
              </p>
              {group.windows.map((w) =>
                editingId === w.id ? (
                  <div
                    key={w.id}
                    className="space-y-2 rounded-xl border border-sky-200 bg-sky-50/60 p-3"
                  >
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <Label className="text-xs">Day</Label>
                        <Select value={editWeekday} onValueChange={setEditWeekday}>
                          <SelectTrigger className="h-9 text-sm rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WEEKDAY_LABELS.map((label, i) => (
                              <SelectItem key={i} value={String(i)}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Start</Label>
                        <Input
                          type="time"
                          value={editStartTime}
                          onChange={(e) => setEditStartTime(e.target.value)}
                          className="h-9 text-sm rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">End</Label>
                        <Input
                          type="time"
                          value={editEndTime}
                          onChange={(e) => setEditEndTime(e.target.value)}
                          className="h-9 text-sm rounded-xl"
                        />
                      </div>
                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <Label className="text-xs">Timezone</Label>
                        <Input
                          value={editTz}
                          onChange={(e) => setEditTz(e.target.value)}
                          className="h-9 text-sm rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => handleSaveEdit(w.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div key={w.id} className={doctorSettingsRowClass.weekly}>
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {minsToTime(w.start_min)} – {minsToTime(w.end_min)}
                      </span>
                      {!singleTz ? (
                        <span className="text-xs text-muted-foreground truncate">{w.timezone}</span>
                      ) : null}
                    </div>
                    {canEdit ? (
                      <div className="flex shrink-0 gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-sky-700 hover:bg-sky-100"
                          onClick={() => startEdit(w)}
                          disabled={busy}
                          title="Edit window"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:bg-red-50"
                          onClick={() => deleteWindowMutation.mutate(w.id)}
                          disabled={busy}
                          title="Delete window"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}

      {canEdit ? (
        <div className={doctorSettingsAddFormClass.weekly}>
          <p className="text-xs font-medium text-sky-700">Add time window</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <Label className="text-xs">Day</Label>
              <Select value={newWeekday} onValueChange={setNewWeekday}>
                <SelectTrigger className="h-9 text-sm rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAY_LABELS.map((label, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Start</Label>
              <Input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="h-9 text-sm rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">End</Label>
              <Input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="h-9 text-sm rounded-xl"
              />
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <Label className="text-xs">Timezone (IANA)</Label>
              <Input
                value={newTz}
                onChange={(e) => setNewTz(e.target.value)}
                placeholder={DEFAULT_DOCTOR_TIMEZONE}
                className="h-9 text-sm rounded-xl"
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleAddWindow}
            disabled={busy}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            {addWindowMutation.isPending ? "Adding…" : "Add Window"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
