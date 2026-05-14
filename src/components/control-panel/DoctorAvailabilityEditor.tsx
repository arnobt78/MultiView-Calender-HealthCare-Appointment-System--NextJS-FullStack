"use client";

/**
 * DoctorAvailabilityEditor — inline CRUD for DoctorAvailability (weekly windows)
 * and DoctorTimeOff (blocked periods) on the doctor detail page.
 *
 * RBAC: edit controls visible to admin or the doctor themselves (checked client-side for UX;
 * API enforces the same rule server-side). Read-only display for all other authenticated viewers.
 *
 * Inline skeleton pattern: card chrome + add forms always mounted; only list rows pulse.
 * After each mutation, invalidateDoctorSchedule busts slot picker + doctors list.
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Clock, CalendarOff, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/hooks/useAuth";
import { notify } from "@/lib/notify";

const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

/** Convert minutes-from-midnight to "HH:MM" string */
function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Convert "HH:MM" string to minutes-from-midnight */
function timeToMins(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

type AvailabilityWindow = {
  id: string;
  weekday: number;
  start_min: number;
  end_min: number;
  timezone: string;
};

type TimeOffBlock = {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
};

interface DoctorAvailabilityEditorProps {
  doctorId: string;
}

export function DoctorAvailabilityEditor({ doctorId }: DoctorAvailabilityEditorProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Hydration guard — skeleton until client mounts (avoids SSR mismatch)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setIsMounted(true)); }, []);

  const canEdit = user?.role === "admin" || user?.id === doctorId;

  // ── Weekly windows ──────────────────────────────────────────────────────────

  const { data: availData, isLoading: availLoading } = useQuery({
    queryKey: queryKeys.doctors.availability(doctorId),
    queryFn: () => apiClient<{ availability: AvailabilityWindow[] }>(
      `/api/doctor-availability?doctorId=${encodeURIComponent(doctorId)}`
    ),
    staleTime: 60_000,
  });
  const windows = availData?.availability ?? [];

  const browserTz = typeof Intl !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "UTC";

  const [newWeekday, setNewWeekday] = useState("1");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("17:00");
  const [newTz, setNewTz] = useState(browserTz);

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
    onError: () => notify.error({ title: "Failed to add availability window", subtitle: "Please try again." }),
  });

  const deleteWindowMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/doctor-availability/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await invalidateDoctorSchedule(queryClient, doctorId);
      notify.crud({ action: "deleted", entity: "Availability window", detail: "Weekly schedule updated." });
    },
    onError: () => notify.error({ title: "Failed to delete availability window", subtitle: "Please try again." }),
  });

  function handleAddWindow() {
    const start_min = timeToMins(newStartTime);
    const end_min = timeToMins(newEndTime);
    if (start_min >= end_min) {
      notify.error({ title: "Start time must be before end time", subtitle: "Adjust the times and try again." });
      return;
    }
    addWindowMutation.mutate({ weekday: Number(newWeekday), start_min, end_min, timezone: newTz.trim() || browserTz });
  }

  // ── Time off ────────────────────────────────────────────────────────────────

  const { data: timeOffData, isLoading: timeOffLoading } = useQuery({
    queryKey: queryKeys.doctors.timeOff(doctorId),
    queryFn: () => apiClient<{ timeOff: TimeOffBlock[] }>(
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
    onError: () => notify.error({ title: "Failed to add time off", subtitle: "Please try again." }),
  });

  const deleteTimeOffMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/doctor-time-off/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await invalidateDoctorSchedule(queryClient, doctorId);
      notify.crud({ action: "deleted", entity: "Time off", detail: "Block removed from schedule." });
    },
    onError: () => notify.error({ title: "Failed to delete time off", subtitle: "Please try again." }),
  });

  function handleAddTimeOff() {
    if (!newTimeOffStart || !newTimeOffEnd) {
      notify.error({ title: "Start and end date/time required", subtitle: "Both fields are required." });
      return;
    }
    addTimeOffMutation.mutate({
      starts_at: new Date(newTimeOffStart).toISOString(),
      ends_at: new Date(newTimeOffEnd).toISOString(),
      reason: newTimeOffReason.trim() || undefined,
    });
  }

  const loading = !isMounted || availLoading;
  const timeOffLoads = !isMounted || timeOffLoading;

  return (
    <>
      {/* ── Section A: Weekly Schedule ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-sky-600" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing windows list */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-xl" />
              ))}
            </div>
          ) : windows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No weekly hours configured.</p>
          ) : (
            <div className="space-y-2">
              {windows.map((w) => (
                <div key={w.id} className="flex items-center justify-between gap-2 rounded-xl border border-sky-100 bg-sky-50/40 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="shrink-0 bg-sky-100 text-sky-700 border-sky-200 text-xs">
                      {WEEKDAY_LABELS[w.weekday]}
                    </Badge>
                    <span className="text-sm font-medium text-gray-700">
                      {minsToTime(w.start_min)} – {minsToTime(w.end_min)}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">{w.timezone}</span>
                  </div>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => deleteWindowMutation.mutate(w.id)}
                      disabled={deleteWindowMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add window form — only for admin or self */}
          {canEdit && (
            <div className="space-y-3 rounded-xl border border-dashed border-sky-200 bg-sky-50/30 p-3">
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
                        <SelectItem key={i} value={String(i)}>{label}</SelectItem>
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
                    placeholder="Europe/Berlin"
                    className="h-9 text-sm rounded-xl"
                  />
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleAddWindow}
                disabled={addWindowMutation.isPending}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                {addWindowMutation.isPending ? "Adding…" : "Add Window"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section B: Time Off ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarOff className="h-4 w-4 text-amber-600" />
            Time Off
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing blocks list */}
          {timeOffLoads ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-xl" />
              ))}
            </div>
          ) : timeOffBlocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No time off scheduled.</p>
          ) : (
            <div className="space-y-2">
              {timeOffBlocks.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-2 rounded-xl border border-amber-100 bg-amber-50/40 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700">
                      {format(new Date(b.starts_at), "MMM d, yyyy HH:mm")} – {format(new Date(b.ends_at), "MMM d, yyyy HH:mm")}
                    </p>
                    {b.reason && (
                      <p className="text-xs text-muted-foreground truncate">{b.reason}</p>
                    )}
                  </div>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => deleteTimeOffMutation.mutate(b.id)}
                      disabled={deleteTimeOffMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add time off form */}
          {canEdit && (
            <div className="space-y-3 rounded-xl border border-dashed border-amber-200 bg-amber-50/30 p-3">
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
          )}
        </CardContent>
      </Card>
    </>
  );
}
