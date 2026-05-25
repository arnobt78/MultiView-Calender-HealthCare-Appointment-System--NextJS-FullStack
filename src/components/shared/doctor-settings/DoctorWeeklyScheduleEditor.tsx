"use client";

/**
 * Weekly DoctorAvailability CRUD — grouped by weekday, inline PATCH edit, shared CP + portal.
 * Portal `layout="collapsible"`: native `<details>` per day + add-window (matches appointment dialog).
 */

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoctorSettingsGlassInput } from "@/components/shared/doctor-settings/DoctorSettingsGlassInput";
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
import { GlassCollapsibleDetails } from "@/components/shared/GlassCollapsibleDetails";
import { GlassDoctorSettingsActionChip } from "@/components/shared/doctor-settings/GlassDoctorSettingsActionChip";
import { DoctorSettingsSlotRow } from "@/components/shared/doctor-settings/DoctorSettingsSlotRow";
import { DoctorSettingsSummaryHint } from "@/components/shared/doctor-settings/DoctorSettingsSummaryHint";
import { DoctorSettingsFormActions } from "@/components/shared/doctor-settings/DoctorSettingsFormActions";
import { closeHtmlDetails } from "@/components/shared/doctor-settings/close-html-details";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateDoctorSchedule } from "@/lib/query-client";
import { notify } from "@/lib/notify";
import type { DoctorAvailabilityQueryData } from "@/lib/doctor-portal-settings-prefetch";
import type {
  AvailabilityWindow,
  DoctorSettingsEditorLayout,
  DoctorSettingsVariant,
} from "@/lib/doctor-schedule-types";
import {
  DEFAULT_DOCTOR_TIMEZONE,
  WEEKDAY_LABELS,
  formatWeekdayWindowsHint,
  groupAvailabilityByWeekday,
  minsToTime,
  resolveBrowserTimezone,
  sharedAvailabilityTimezone,
  timeToMins,
} from "@/lib/doctor-schedule-display";
import {
  WEEKLY_ADD_WINDOW_SUMMARY_LABEL,
  WEEKLY_SAVE_WINDOW_LABEL,
} from "@/lib/doctor-portal-schedule-copy";
import { glassTimeInputClass } from "@/lib/scheduling-glass-input-classes";
import { DoctorAvailabilityGroups } from "@/components/shared/doctor-display/DoctorAvailabilityGroups";
import { useCanEditDoctorSettings } from "@/components/shared/doctor-settings/useCanEditDoctorSettings";
import { doctorSettingsAddFormClass, doctorSettingsRowClass } from "@/components/shared/doctor-settings/doctor-settings-classes";
import { doctorSettingsGlassSelectTriggerClass } from "@/lib/doctor-settings-glass-fields";
import { cn, toTitleCaseLabel } from "@/lib/utils";

type Props = {
  doctorId: string;
  variant?: DoctorSettingsVariant;
  layout?: DoctorSettingsEditorLayout;
  showSummaryPreview?: boolean;
  /** SSR seed — skips list skeleton on `/doctor-portal` refresh when provided. */
  initialAvailability?: DoctorAvailabilityQueryData;
};

function resolveLayout(
  variant: DoctorSettingsVariant,
  layout: DoctorSettingsEditorLayout | undefined
): DoctorSettingsEditorLayout {
  if (layout) return layout;
  return variant === "portal" ? "collapsible" : "flat";
}

export function DoctorWeeklyScheduleEditor({
  doctorId,
  variant = "control-panel",
  layout: layoutProp,
  showSummaryPreview = variant === "control-panel",
  initialAvailability,
}: Props) {
  const layout = resolveLayout(variant, layoutProp);
  const addDetailsRef = useRef<HTMLDetailsElement>(null);
  const queryClient = useQueryClient();
  const canEdit = useCanEditDoctorSettings(doctorId, {
    portalSelfService: variant === "portal",
  });
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
    initialData: initialAvailability,
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
      closeHtmlDetails(addDetailsRef.current);
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

  /** List rows only — add-window chip stays mounted (inline skeleton pattern). */
  const listBodyLoading = initialAvailability
    ? availLoading && availData === undefined
    : !isMounted || availLoading;
  const busy =
    addWindowMutation.isPending ||
    patchWindowMutation.isPending ||
    deleteWindowMutation.isPending;

  function renderWindowRow(w: AvailabilityWindow, inCollapsible: boolean) {
    if (editingId === w.id) {
      return (
        <div
          key={w.id}
          className="space-y-2 rounded-xl border border-sky-200 bg-sky-50/60 p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <Label className="text-xs">{toTitleCaseLabel("Day")}</Label>
              <Select value={editWeekday} onValueChange={setEditWeekday}>
                <SelectTrigger className={doctorSettingsGlassSelectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[55]">
                  {WEEKDAY_LABELS.map((label, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {toTitleCaseLabel(label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{toTitleCaseLabel("Start")}</Label>
              <Input
                type="time"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                className={glassTimeInputClass}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{toTitleCaseLabel("End")}</Label>
              <Input
                type="time"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                className={glassTimeInputClass}
              />
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <Label className="text-xs">{toTitleCaseLabel("Timezone")}</Label>
              <DoctorSettingsGlassInput
                tone="sky"
                density="compact"
                value={editTz}
                onChange={(e) => setEditTz(e.target.value)}
              />
            </div>
          </div>
          <DoctorSettingsFormActions
            tone="weekly"
            pending={busy}
            saveLabel="Save"
            onSave={() => handleSaveEdit(w.id)}
            onCancel={() => setEditingId(null)}
          />
        </div>
      );
    }

    const rangeLabel = `${minsToTime(w.start_min)} – ${minsToTime(w.end_min)}`;
    const actions = canEdit ? (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-sky-700 hover:bg-sky-100"
          onClick={() => startEdit(w)}
          disabled={busy}
          title={toTitleCaseLabel("Edit window")}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-red-500 hover:bg-red-50"
          onClick={() => deleteWindowMutation.mutate(w.id)}
          disabled={busy}
          title={toTitleCaseLabel("Delete window")}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </>
    ) : null;

    if (inCollapsible) {
      return (
        <DoctorSettingsSlotRow key={w.id} icon={Clock} tone="sky" actions={actions}>
          <span>
            {rangeLabel}
            {!singleTz ? (
              <span className="ml-2 text-xs font-normal text-muted-foreground">{w.timezone}</span>
            ) : null}
          </span>
        </DoctorSettingsSlotRow>
      );
    }

    return (
      <div key={w.id} className={doctorSettingsRowClass.weekly}>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{rangeLabel}</span>
          {!singleTz ? (
            <span className="text-xs text-muted-foreground truncate">{w.timezone}</span>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 gap-0.5">{actions}</div> : null}
      </div>
    );
  }

  const addFormFields = (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="space-y-1 col-span-2 sm:col-span-1">
          <Label className="text-xs">{toTitleCaseLabel("Day")}</Label>
            <Select value={newWeekday} onValueChange={setNewWeekday}>
                <SelectTrigger className={cn(doctorSettingsGlassSelectTriggerClass, "w-full")}>
              <SelectValue />
            </SelectTrigger>
                <SelectContent position="popper" className="z-[55]">
                  {WEEKDAY_LABELS.map((label, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {toTitleCaseLabel(label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{toTitleCaseLabel("Start")}</Label>
              <Input
                type="time"
                value={newStartTime}
            onChange={(e) => setNewStartTime(e.target.value)}
            className={glassTimeInputClass}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{toTitleCaseLabel("End")}</Label>
          <Input
            type="time"
            value={newEndTime}
            onChange={(e) => setNewEndTime(e.target.value)}
            className={glassTimeInputClass}
          />
        </div>
        <div className="space-y-1 col-span-2 sm:col-span-1">
          <Label className="text-xs">{toTitleCaseLabel("Timezone (IANA)")}</Label>
          <DoctorSettingsGlassInput
            tone="sky"
            density="compact"
            value={newTz}
            onChange={(e) => setNewTz(e.target.value)}
            placeholder={DEFAULT_DOCTOR_TIMEZONE}
          />
        </div>
      </div>
      <DoctorSettingsFormActions
        tone="weekly"
        pending={addWindowMutation.isPending}
        saveLabel={WEEKLY_SAVE_WINDOW_LABEL}
        onSave={handleAddWindow}
        onCancel={() => closeHtmlDetails(addDetailsRef.current)}
      />
    </div>
  );

  return (
    <div className={cn("space-y-3", variant === "portal" && "text-gray-700")}>
      {showSummaryPreview && layout === "flat" && !listBodyLoading && windows.length > 0 ? (
        <DoctorAvailabilityGroups availabilities={windows} layout="stacked" className="mb-1" />
      ) : null}

      {layout === "flat" && singleTz ? (
        <p className="text-[11px] text-muted-foreground">
          {toTitleCaseLabel("All hours use timezone")}{" "}
          <span className="font-medium text-gray-700">{singleTz}</span>
        </p>
      ) : null}

      {listBodyLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : windows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {toTitleCaseLabel("No weekly hours configured yet.")}
        </p>
      ) : layout === "collapsible" ? (
        <div className="space-y-2">
          {grouped.map((group) => (
            <GlassCollapsibleDetails
              key={group.weekday}
              tone="sky"
              icon={CalendarDays}
              title={toTitleCaseLabel(group.label)}
              hint={
                <DoctorSettingsSummaryHint tone="sky">
                  {formatWeekdayWindowsHint(group.windows)}
                </DoctorSettingsSummaryHint>
              }
            >
              {group.windows.map((w) => renderWindowRow(w, true))}
            </GlassCollapsibleDetails>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.weekday} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-800/80">
                {toTitleCaseLabel(group.label)}
              </p>
              {group.windows.map((w) => renderWindowRow(w, false))}
            </div>
          ))}
        </div>
      )}

      {canEdit ? (
        layout === "collapsible" ? (
          <GlassCollapsibleDetails
            ref={addDetailsRef}
            tone="sky"
            summaryChip={
              <GlassDoctorSettingsActionChip
                tone="sky"
                icon={Plus}
                label={WEEKLY_ADD_WINDOW_SUMMARY_LABEL}
                pending={addWindowMutation.isPending}
              />
            }
            title=""
          >
            {addFormFields}
          </GlassCollapsibleDetails>
        ) : (
          <div className={doctorSettingsAddFormClass.weekly}>
            <p className="text-sm font-medium text-sky-700">
              {toTitleCaseLabel("Add availability time window")}
            </p>
            {addFormFields}
          </div>
        )
      ) : null}
    </div>
  );
}
