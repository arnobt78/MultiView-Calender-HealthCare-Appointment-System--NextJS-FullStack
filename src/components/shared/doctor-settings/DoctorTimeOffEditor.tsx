"use client";

/**
 * DoctorTimeOff CRUD — blocked periods; shared CP doctor detail + doctor portal.
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateDoctorSchedule } from "@/lib/query-client";
import { notify } from "@/lib/notify";
import type { DoctorSettingsVariant, TimeOffBlock } from "@/lib/doctor-schedule-types";
import { useCanEditDoctorSettings } from "@/components/shared/doctor-settings/useCanEditDoctorSettings";
import {
  doctorSettingsAddFormClass,
  doctorSettingsRowClass,
} from "@/components/shared/doctor-settings/doctor-settings-classes";
import { cn } from "@/lib/utils";

type Props = {
  doctorId: string;
  variant?: DoctorSettingsVariant;
};

export function DoctorTimeOffEditor({ doctorId, variant = "control-panel" }: Props) {
  const queryClient = useQueryClient();
  const canEdit = useCanEditDoctorSettings(doctorId);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  const { data: timeOffData, isLoading: timeOffLoading } = useQuery({
    queryKey: queryKeys.doctors.timeOff(doctorId),
    queryFn: () =>
      apiClient<{ timeOff: TimeOffBlock[] }>(
        `/api/doctor-time-off?doctorId=${encodeURIComponent(doctorId)}`
      ),
    staleTime: 60_000,
  });
  const timeOffBlocks = timeOffData?.timeOff ?? [];

  const [newTimeOffStart, setNewTimeOffStart] = useState("");
  const [newTimeOffEnd, setNewTimeOffEnd] = useState("");
  const [newTimeOffReason, setNewTimeOffReason] = useState("");

  const addTimeOffMutation = useMutation({
    mutationFn: (data: { starts_at: string; ends_at: string; reason?: string }) =>
      apiClient("/api/doctor-time-off", {
        method: "POST",
        body: JSON.stringify({ doctorId, ...data }),
      }),
    onSuccess: async () => {
      await invalidateDoctorSchedule(queryClient, doctorId);
      notify.crud({ action: "created", entity: "Time off", detail: "Block added to schedule." });
      setNewTimeOffStart("");
      setNewTimeOffEnd("");
      setNewTimeOffReason("");
    },
    onError: () =>
      notify.error({ title: "Failed to add time off", subtitle: "Please try again." }),
  });

  const deleteTimeOffMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/doctor-time-off/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await invalidateDoctorSchedule(queryClient, doctorId);
      notify.crud({ action: "deleted", entity: "Time off", detail: "Block removed from schedule." });
    },
    onError: () =>
      notify.error({ title: "Failed to delete time off", subtitle: "Please try again." }),
  });

  function handleAddTimeOff() {
    if (!newTimeOffStart || !newTimeOffEnd) {
      notify.error({
        title: "Start and end date/time required",
        subtitle: "Both fields are required.",
      });
      return;
    }
    addTimeOffMutation.mutate({
      starts_at: new Date(newTimeOffStart).toISOString(),
      ends_at: new Date(newTimeOffEnd).toISOString(),
      reason: newTimeOffReason.trim() || undefined,
    });
  }

  const loading = !isMounted || timeOffLoading;

  return (
    <div className={cn("space-y-4", variant === "portal" && "text-gray-700")}>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : timeOffBlocks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No time off scheduled.</p>
      ) : (
        <div className="space-y-2">
          {timeOffBlocks.map((b) => (
            <div key={b.id} className={doctorSettingsRowClass.timeOff}>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700">
                  {format(new Date(b.starts_at), "MMM d, yyyy HH:mm")} –{" "}
                  {format(new Date(b.ends_at), "MMM d, yyyy HH:mm")}
                </p>
                {b.reason ? (
                  <p className="text-xs text-muted-foreground truncate">{b.reason}</p>
                ) : null}
              </div>
              {canEdit ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-red-500 hover:bg-red-50"
                  onClick={() => deleteTimeOffMutation.mutate(b.id)}
                  disabled={deleteTimeOffMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {canEdit ? (
        <div className={doctorSettingsAddFormClass.timeOff}>
          <p className="text-xs font-medium text-amber-700">Add time off</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Start</Label>
              <Input
                type="datetime-local"
                value={newTimeOffStart}
                onChange={(e) => setNewTimeOffStart(e.target.value)}
                className="h-9 text-sm rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">End</Label>
              <Input
                type="datetime-local"
                value={newTimeOffEnd}
                onChange={(e) => setNewTimeOffEnd(e.target.value)}
                className="h-9 text-sm rounded-xl"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Reason (optional)</Label>
              <Input
                value={newTimeOffReason}
                onChange={(e) => setNewTimeOffReason(e.target.value)}
                placeholder="e.g. Conference, Holiday…"
                className="h-9 text-sm rounded-xl"
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleAddTimeOff}
            disabled={addTimeOffMutation.isPending}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            {addTimeOffMutation.isPending ? "Adding…" : "Add Time Off"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
