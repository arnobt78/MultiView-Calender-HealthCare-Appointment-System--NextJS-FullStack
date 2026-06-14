"use client";

/**
 * DoctorTimeOff CRUD — blocked periods; shared CP + doctor portal.
 * Portal: collapsible rows + add form; datetime range matches appointment manual override.
 */

import { useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarRange, CalendarX2, Check, MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoctorSettingsGlassInput } from "@/components/shared/doctor-settings/DoctorSettingsGlassInput";
import { DoctorSettingsFieldLabel } from "@/components/shared/doctor-settings/DoctorSettingsFieldLabel";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCollapsibleDetails } from "@/components/shared/GlassCollapsibleDetails";
import { GlassDoctorSettingsActionChip } from "@/components/shared/doctor-settings/GlassDoctorSettingsActionChip";
import { DoctorSettingsSlotRow } from "@/components/shared/doctor-settings/DoctorSettingsSlotRow";
import { DoctorSettingsSummaryHint } from "@/components/shared/doctor-settings/DoctorSettingsSummaryHint";
import { formatTimeOffRangeLabel } from "@/lib/doctor-schedule-display";
import { DoctorSettingsFormActions } from "@/components/shared/doctor-settings/DoctorSettingsFormActions";
import { closeHtmlDetails } from "@/components/shared/doctor-settings/close-html-details";
import { SchedulingDatetimeRangeFields } from "@/components/shared/scheduling/SchedulingDatetimeRangeFields";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { useQueryBodyLoading } from "@/lib/query-body-loading";
import { invalidateDoctorSchedule } from "@/lib/query-client";
import { timeOffCrudMessage } from "@/lib/crud-notify-messages";
import { notify } from "@/lib/notify";
import type { DoctorTimeOffQueryData } from "@/lib/doctor-portal-settings-prefetch";
import type {
  DoctorSettingsEditorLayout,
  DoctorSettingsVariant,
  TimeOffBlock,
} from "@/lib/doctor-schedule-types";
import {
  TIME_OFF_ADD_BLOCK_SUMMARY_LABEL,
  TIME_OFF_SAVE_BLOCK_LABEL,
} from "@/lib/doctor-portal-schedule-copy";
import {
  datetimeLocalValueToIso,
  isoToDatetimeLocalValue,
} from "@/lib/datetime-local-value";
import { useCanEditDoctorSettings } from "@/components/shared/doctor-settings/useCanEditDoctorSettings";
import { doctorSettingsAddFormClass, doctorSettingsRowClass } from "@/components/shared/doctor-settings/doctor-settings-classes";
import { isValidTimeOffDatetimeRange } from "@/lib/doctor-settings-form-validity";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import {
  buildUnavailableDateDeleteConfirmSubtitle,
  DELETE_UNAVAILABLE_DATE_CONFIRM_TITLE,
} from "@/lib/confirm-delete-dialog-copy";
import { cn, toTitleCaseLabel } from "@/lib/utils";

type Props = {
  doctorId: string;
  variant?: DoctorSettingsVariant;
  layout?: DoctorSettingsEditorLayout;
  /** SSR seed — skips list skeleton on `/doctor-portal` refresh when provided. */
  initialTimeOff?: DoctorTimeOffQueryData;
};

function resolveLayout(
  variant: DoctorSettingsVariant,
  layout: DoctorSettingsEditorLayout | undefined
): DoctorSettingsEditorLayout {
  if (layout) return layout;
  return variant === "portal" ? "collapsible" : "flat";
}

export function DoctorTimeOffEditor({
  doctorId,
  variant = "control-panel",
  layout: layoutProp,
  initialTimeOff,
}: Props) {
  const layout = resolveLayout(variant, layoutProp);
  const addDetailsRef = useRef<HTMLDetailsElement>(null);
  const queryClient = useQueryClient();
  const canEdit = useCanEditDoctorSettings(doctorId, {
    portalSelfService: variant === "portal",
  });

  const { data: timeOffData, isLoading: timeOffLoading } = useQuery({
    queryKey: queryKeys.doctors.timeOff(doctorId),
    queryFn: () =>
      apiClient<{ timeOff: TimeOffBlock[] }>(
        `/api/doctor-time-off?doctorId=${encodeURIComponent(doctorId)}`
      ),
    initialData: initialTimeOff,
    staleTime: 60_000,
  });
  const timeOffBlocks = timeOffData?.timeOff ?? [];

  const [newTimeOffStart, setNewTimeOffStart] = useState("");
  const [newTimeOffEnd, setNewTimeOffEnd] = useState("");
  const [newTimeOffReason, setNewTimeOffReason] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  /** Glass confirm before DELETE — matches calendar appointment delete. */
  const [deleteBlockId, setDeleteBlockId] = useState<string | null>(null);
  const blockPendingDelete = deleteBlockId
    ? (timeOffBlocks.find((b) => b.id === deleteBlockId) ?? null)
    : null;
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editReason, setEditReason] = useState("");

  const addTimeOffMutation = useMutation({
    mutationFn: (data: { starts_at: string; ends_at: string; reason?: string }) =>
      apiClient("/api/doctor-time-off", {
        method: "POST",
        body: JSON.stringify({ doctorId, ...data }),
      }),
    onSuccess: async (_data, variables) => {
      await invalidateDoctorSchedule(queryClient, doctorId);
      notify.crud(timeOffCrudMessage("created", variables));
      setNewTimeOffStart("");
      setNewTimeOffEnd("");
      setNewTimeOffReason("");
      closeHtmlDetails(addDetailsRef.current);
    },
    onError: () =>
      notify.error({ title: "Failed to add time off", subtitle: "Please try again." }),
  });

  const patchTimeOffMutation = useMutation({
    mutationFn: (vars: {
      id: string;
      starts_at: string;
      ends_at: string;
      reason: string | null;
    }) => {
      const { id, ...patch } = vars;
      return apiClient(`/api/doctor-time-off/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    },
    onSuccess: async (_data, variables) => {
      await invalidateDoctorSchedule(queryClient, doctorId);
      const { id: _id, ...block } = variables;
      notify.crud(timeOffCrudMessage("updated", block));
      setEditingId(null);
    },
    onError: () =>
      notify.error({ title: "Failed to update time off", subtitle: "Please try again." }),
  });

  const deleteTimeOffMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/doctor-time-off/${id}`, { method: "DELETE" }),
    onMutate: async (deletedId) => {
      const deleted = timeOffBlocks.find((b) => b.id === deletedId) ?? null;
      return { deleted };
    },
    onSuccess: async (_data, _id, context) => {
      await invalidateDoctorSchedule(queryClient, doctorId);
      if (context?.deleted) {
        notify.crud(
          timeOffCrudMessage("deleted", {
            starts_at: context.deleted.starts_at,
            ends_at: context.deleted.ends_at,
            reason: context.deleted.reason,
          })
        );
      } else {
        notify.crud({
          action: "deleted",
          entity: "Time off",
          detail: "Time-off block removed from your schedule.",
        });
      }
      if (editingId) setEditingId(null);
    },
    onError: () =>
      notify.error({ title: "Failed to delete time off", subtitle: "Please try again." }),
  });

  function startEdit(b: TimeOffBlock) {
    setEditingId(b.id);
    setEditStart(isoToDatetimeLocalValue(b.starts_at));
    setEditEnd(isoToDatetimeLocalValue(b.ends_at));
    setEditReason(b.reason ?? "");
  }

  function handleAddTimeOff() {
    if (!newTimeOffStart || !newTimeOffEnd) {
      notify.error({
        title: "Start and end date/time required",
        subtitle: "Both fields are required.",
      });
      return;
    }
    addTimeOffMutation.mutate({
      starts_at: datetimeLocalValueToIso(newTimeOffStart),
      ends_at: datetimeLocalValueToIso(newTimeOffEnd),
      reason: newTimeOffReason.trim() || undefined,
    });
  }

  function handleSaveEdit(id: string) {
    if (!editStart || !editEnd) {
      notify.error({
        title: "Start and end date/time required",
        subtitle: "Both fields are required.",
      });
      return;
    }
    patchTimeOffMutation.mutate({
      id,
      starts_at: datetimeLocalValueToIso(editStart),
      ends_at: datetimeLocalValueToIso(editEnd),
      reason: editReason.trim() || null,
    });
  }

  const listBodyLoading = useQueryBodyLoading(
    queryKeys.doctors.timeOff(doctorId),
    timeOffLoading
  );
  const busy =
    addTimeOffMutation.isPending ||
    patchTimeOffMutation.isPending ||
    deleteTimeOffMutation.isPending;

  const addTimeOffValid = useMemo(
    () => isValidTimeOffDatetimeRange(newTimeOffStart, newTimeOffEnd),
    [newTimeOffStart, newTimeOffEnd]
  );

  const editTimeOffValid = useMemo(
    () => isValidTimeOffDatetimeRange(editStart, editEnd),
    [editStart, editEnd]
  );

  function renderBlockBody(b: TimeOffBlock, inCollapsible: boolean) {
    if (editingId === b.id) {
      return (
        <div
          className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <SchedulingDatetimeRangeFields
            tone="amber"
            start={editStart}
            setStart={setEditStart}
            end={editEnd}
            setEnd={setEditEnd}
            startId={`time-off-edit-start-${b.id}`}
            endId={`time-off-edit-end-${b.id}`}
          />
          <div className="space-y-1">
            <DoctorSettingsFieldLabel icon={MessageSquare} iconClassName="text-amber-600">
              Reason (optional)
            </DoctorSettingsFieldLabel>
            <DoctorSettingsGlassInput
              tone="amber"
              density="row"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder={toTitleCaseLabel("e.g. Conference, holiday…")}
            />
          </div>
          <DoctorSettingsFormActions
            tone="timeOff"
            pending={busy}
            saveLabel="Save"
            saveIcon={Check}
            saveDisabled={!editTimeOffValid}
            onSave={() => handleSaveEdit(b.id)}
            onCancel={() => setEditingId(null)}
          />
        </div>
      );
    }

    const rangeLabel = `${format(new Date(b.starts_at), "MMM d, yyyy HH:mm")} – ${format(new Date(b.ends_at), "MMM d, yyyy HH:mm")}`;
    const actions = canEdit ? (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-amber-800 hover:bg-amber-100"
          onClick={() => startEdit(b)}
          disabled={busy}
          title={toTitleCaseLabel("Edit block")}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-red-500 hover:bg-red-50"
          onClick={() => setDeleteBlockId(b.id)}
          disabled={busy}
          title={toTitleCaseLabel("Delete block")}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </>
    ) : null;

    if (inCollapsible) {
      return (
        <div className="space-y-2">
          <DoctorSettingsSlotRow icon={CalendarRange} tone="amber" actions={actions}>
            {rangeLabel}
          </DoctorSettingsSlotRow>
          {b.reason ? (
            <DoctorSettingsSlotRow icon={MessageSquare} tone="amber">
              <span className="text-xs font-normal text-muted-foreground">{b.reason}</span>
            </DoctorSettingsSlotRow>
          ) : null}
        </div>
      );
    }

    return (
      <div className={doctorSettingsRowClass.timeOff}>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-700">{rangeLabel}</p>
          {b.reason ? (
            <p className="text-xs text-muted-foreground truncate">{b.reason}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 gap-0.5">{actions}</div> : null}
      </div>
    );
  }

  const addFormFields = (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
      <SchedulingDatetimeRangeFields
        tone="amber"
        start={newTimeOffStart}
        setStart={setNewTimeOffStart}
        end={newTimeOffEnd}
        setEnd={setNewTimeOffEnd}
        startId="time-off-add-start"
        endId="time-off-add-end"
      />
      <div className="space-y-1">
        <DoctorSettingsFieldLabel icon={MessageSquare} iconClassName="text-amber-600">
          Reason (optional)
        </DoctorSettingsFieldLabel>
        <DoctorSettingsGlassInput
          tone="amber"
          density="row"
          value={newTimeOffReason}
          onChange={(e) => setNewTimeOffReason(e.target.value)}
          placeholder={toTitleCaseLabel("e.g. Conference, holiday…")}
        />
      </div>
      <DoctorSettingsFormActions
        tone="timeOff"
        pending={addTimeOffMutation.isPending}
        saveLabel={TIME_OFF_SAVE_BLOCK_LABEL}
        saveDisabled={!addTimeOffValid}
        onSave={handleAddTimeOff}
        onCancel={() => closeHtmlDetails(addDetailsRef.current)}
      />
    </div>
  );

  return (
    <div className={cn("space-y-3", variant === "portal" && "text-gray-700")}>
      {listBodyLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : timeOffBlocks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {toTitleCaseLabel("No unavailable dates scheduled.")}
        </p>
      ) : layout === "collapsible" ? (
        <div className="space-y-2">
          {timeOffBlocks.map((b) => (
            <GlassCollapsibleDetails
              key={b.id}
              tone="amber"
              icon={CalendarX2}
              title={
                <span className="break-words font-medium text-gray-700">
                  {formatTimeOffRangeLabel(b.starts_at, b.ends_at)}
                </span>
              }
              hint={
                b.reason ? (
                  <DoctorSettingsSummaryHint icon={MessageSquare} tone="amber">
                    {b.reason}
                  </DoctorSettingsSummaryHint>
                ) : undefined
              }
            >
              {renderBlockBody(b, true)}
            </GlassCollapsibleDetails>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {timeOffBlocks.map((b) => (
            <div key={b.id}>{renderBlockBody(b, false)}</div>
          ))}
        </div>
      )}

      {canEdit ? (
        layout === "collapsible" ? (
          <GlassCollapsibleDetails
            ref={addDetailsRef}
            tone="amber"
            summaryChip={
              <GlassDoctorSettingsActionChip
                tone="amber"
                icon={Plus}
                label={TIME_OFF_ADD_BLOCK_SUMMARY_LABEL}
                pending={addTimeOffMutation.isPending}
              />
            }
            title=""
          >
            {addFormFields}
          </GlassCollapsibleDetails>
        ) : (
          <div className={doctorSettingsAddFormClass.timeOff}>
            <p className="text-sm font-medium text-amber-700">{toTitleCaseLabel("Add time off")}</p>
            {addFormFields}
          </div>
        )
      ) : null}

      <ConfirmActionDialog
        open={Boolean(deleteBlockId && blockPendingDelete)}
        onOpenChange={(open) => {
          if (!open) setDeleteBlockId(null);
        }}
        variant="destructive"
        title={DELETE_UNAVAILABLE_DATE_CONFIRM_TITLE}
        subtitle={
          blockPendingDelete
            ? buildUnavailableDateDeleteConfirmSubtitle(blockPendingDelete)
            : ""
        }
        confirmLabel="Delete"
        confirmPendingLabel="Deleting…"
        cancelLabel="Cancel"
        confirmPending={deleteTimeOffMutation.isPending}
        onConfirm={async () => {
          if (deleteBlockId) {
            await deleteTimeOffMutation.mutateAsync(deleteBlockId);
          }
          setDeleteBlockId(null);
        }}
      />
    </div>
  );
}
