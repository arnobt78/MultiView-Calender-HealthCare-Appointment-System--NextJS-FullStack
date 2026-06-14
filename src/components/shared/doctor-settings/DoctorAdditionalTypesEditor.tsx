"use client";

/**
 * Doctor-owned appointment types CRUD — same APIs as CP; portal `layout="collapsible"` matches time-off add chip.
 */

import { useMemo, useRef, useState } from "react";
import { Check, Clock, Euro, Loader2, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DoctorSettingsFieldLabel } from "@/components/shared/doctor-settings/DoctorSettingsFieldLabel";
import { GlassCollapsibleDetails } from "@/components/shared/GlassCollapsibleDetails";
import { GlassDoctorSettingsActionChip } from "@/components/shared/doctor-settings/GlassDoctorSettingsActionChip";
import { DoctorSettingsFormActions } from "@/components/shared/doctor-settings/DoctorSettingsFormActions";
import { closeHtmlDetails } from "@/components/shared/doctor-settings/close-html-details";
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
import type { DoctorSettingsEditorLayout, DoctorSettingsVariant } from "@/lib/doctor-schedule-types";
import { doctorSettingsAddFormClass, doctorSettingsActionButtonClass } from "@/components/shared/doctor-settings/doctor-settings-classes";
import { doctorSettingsGlassCheckboxClass } from "@/lib/doctor-settings-glass-surfaces";
import { DOCTOR_PORTAL_VISIT_TYPE_COPY } from "@/lib/doctor-portal-visit-type-copy";
import {
  ADDITIONAL_TYPE_ADD_SUMMARY_LABEL,
  ADDITIONAL_TYPE_SAVE_LABEL,
} from "@/lib/doctor-portal-visit-type-copy";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { VisitFeeBadge } from "@/components/shared/billing/VisitFeeBadge";
import {
  buildAppointmentTypeDeleteConfirmSubtitle,
  buildDisableOwnedVisitTypeConfirmSubtitle,
  DELETE_APPOINTMENT_TYPE_CONFIRM_TITLE,
  DISABLE_VISIT_TYPE_CONFIRM_TITLE,
} from "@/lib/confirm-delete-dialog-copy";
import {
  formatCentsToPriceInput,
  parsePriceEurInputToCents,
} from "@/lib/appointment-type-price";
import { isValidDoctorAppointmentTypeDraft } from "@/lib/doctor-settings-form-validity";

type Props = {
  doctorId: string;
  variant?: DoctorSettingsVariant;
  layout?: DoctorSettingsEditorLayout;
  initialAppointmentTypes?: DoctorAppointmentTypesQueryData;
};

function resolveLayout(
  variant: DoctorSettingsVariant,
  layout: DoctorSettingsEditorLayout | undefined
): DoctorSettingsEditorLayout {
  if (layout) return layout;
  return variant === "portal" ? "collapsible" : "flat";
}

export function DoctorAdditionalTypesEditor({
  doctorId,
  variant = "control-panel",
  layout: layoutProp,
  initialAppointmentTypes,
}: Props) {
  const layout = resolveLayout(variant, layoutProp);
  const addDetailsRef = useRef<HTMLDetailsElement>(null);
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
  /** Optional EUR visit fee — persisted as `price_cents` on POST/PATCH (0 when empty). */
  const [newPrice, setNewPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [togglePendingIds, setTogglePendingIds] = useState<Set<string>>(new Set());
  /** Destructive confirm — same glass dialog as calendar appointment delete. */
  const [deleteTypeId, setDeleteTypeId] = useState<string | null>(null);
  /** Uncheck owned type — warn before PATCH `is_active: false` (global types parity). */
  const [disableTarget, setDisableTarget] = useState<AppointmentTypeApiRow | null>(null);

  const busy = isCreating || isUpdating || isDeleting;

  const typePendingDelete = useMemo(
    () => ownedTypes.find((t) => t.id === deleteTypeId) ?? null,
    [ownedTypes, deleteTypeId]
  );

  const ownedTypeActive = (t: AppointmentTypeApiRow) =>
    (t.is_active ?? true) && (t.is_enabled ?? true);

  const handleToggleActive = async (t: AppointmentTypeApiRow, nextActive: boolean) => {
    setTogglePendingIds((prev) => new Set(prev).add(t.id));
    try {
      await updateType({ id: t.id, is_active: nextActive });
    } finally {
      setTogglePendingIds((prev) => {
        const next = new Set(prev);
        next.delete(t.id);
        return next;
      });
    }
  };

  const addTypeValid = useMemo(
    () => isValidDoctorAppointmentTypeDraft(newName, newDuration),
    [newName, newDuration]
  );

  const editTypeValid = useMemo(
    () => isValidDoctorAppointmentTypeDraft(editName, editDuration),
    [editName, editDuration]
  );

  const startEdit = (t: AppointmentTypeApiRow) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditDuration(String(t.duration_minutes));
    setEditPrice(formatCentsToPriceInput(t.price_cents ?? 0));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDuration("");
    setEditPrice("");
  };

  const handleCreate = async () => {
    const name = newName.trim();
    const duration = Number.parseInt(newDuration, 10);
    if (!name || !Number.isFinite(duration)) return;
    const price_cents = parsePriceEurInputToCents(newPrice);
    await createType({ name, duration_minutes: duration, price_cents });
    setNewName("");
    setNewDuration("30");
    setNewPrice("");
    closeHtmlDetails(addDetailsRef.current);
  };

  const handleSaveEdit = async (id: string) => {
    const name = editName.trim();
    const duration = Number.parseInt(editDuration, 10);
    if (!name || !Number.isFinite(duration)) return;
    const price_cents = parsePriceEurInputToCents(editPrice);
    await updateType({ id, name, duration_minutes: duration, price_cents });
    cancelEdit();
  };

  const listBodyLoading = isLoading && data === undefined;

  const addFormFields = (
    <div
      className={cn(
        layout === "collapsible" ? "space-y-3" : doctorSettingsAddFormClass.additional
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {layout !== "collapsible" ? (
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800/90">
          <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {toTitleCaseLabel("Add type")}
        </p>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1 sm:col-span-2 lg:col-span-1">
          <DoctorSettingsFieldLabel
            htmlFor={`new-appt-type-name-${doctorId}`}
            icon={Tag}
            iconClassName="text-emerald-600"
            required
          >
            Title/Description
          </DoctorSettingsFieldLabel>
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
          <DoctorSettingsFieldLabel
            htmlFor={`new-appt-type-duration-${doctorId}`}
            icon={Clock}
            iconClassName="text-emerald-600"
            required
          >
            Duration (mins)
          </DoctorSettingsFieldLabel>
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
        <div className="space-y-1">
          <DoctorSettingsFieldLabel
            htmlFor={`new-appt-type-price-${doctorId}`}
            icon={Euro}
            iconClassName="text-emerald-600"
          >
            Visit fee (€)
          </DoctorSettingsFieldLabel>
          <DoctorSettingsGlassInput
            id={`new-appt-type-price-${doctorId}`}
            tone="emerald"
            density="compact"
            type="number"
            min={0}
            step="0.01"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder="0.00"
            disabled={busy}
          />
        </div>
      </div>
      {layout === "collapsible" ? (
        <DoctorSettingsFormActions
          tone="emerald"
          pending={isCreating}
          saveLabel={ADDITIONAL_TYPE_SAVE_LABEL}
          onSave={() => void handleCreate()}
          onCancel={() => closeHtmlDetails(addDetailsRef.current)}
          saveDisabled={!addTypeValid}
        />
      ) : (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            disabled={busy || !addTypeValid}
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
      )}
    </div>
  );

  if (listBodyLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-2xl" />
        ))}
        {layout === "collapsible" ? (
          <Skeleton className="h-11 w-full rounded-2xl" aria-hidden />
        ) : (
          addFormFields
        )}
      </div>
    );
  }

  if (isError) {
    return <p className="py-2 text-sm text-red-600">Could not load additional appointment types.</p>;
  }

  return (
    <div className={cn("space-y-3", isPortal && "text-gray-700")}>
      {!isPortal ? (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {APPOINTMENT_TYPE_COPY.additionalSectionBlurb}
        </p>
      ) : null}

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
                <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                    <DoctorSettingsFieldLabel icon={Tag} iconClassName="text-emerald-600" required>
                      Title/Description
                    </DoctorSettingsFieldLabel>
                    <DoctorSettingsGlassInput
                      tone="emerald"
                      density="compact"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      disabled={busy}
                    />
                  </div>
                  <div className="space-y-1">
                    <DoctorSettingsFieldLabel icon={Clock} iconClassName="text-emerald-600" required>
                      Duration (mins)
                    </DoctorSettingsFieldLabel>
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
                  <div className="space-y-1">
                    <DoctorSettingsFieldLabel icon={Euro} iconClassName="text-emerald-600">
                      Visit fee (€)
                    </DoctorSettingsFieldLabel>
                    <DoctorSettingsGlassInput
                      tone="emerald"
                      density="compact"
                      type="number"
                      min={0}
                      step="0.01"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      placeholder="0.00"
                      disabled={busy}
                    />
                  </div>
                </div>
                <DoctorSettingsFormActions
                  tone="emerald"
                  pending={busy}
                  saveLabel="Save"
                  saveIcon={Check}
                  saveDisabled={!editTypeValid}
                  onSave={() => void handleSaveEdit(t.id)}
                  onCancel={cancelEdit}
                />
              </li>
            ) : (
              <DoctorSettingsGlassListRow
                key={t.id}
                tone="emerald"
                enabled={ownedTypeActive(t)}
                leading={
                  togglePendingIds.has(t.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" aria-hidden />
                  ) : (
                    <input
                      type="checkbox"
                      checked={ownedTypeActive(t)}
                      disabled={busy}
                      onChange={(e) => {
                        if (e.target.checked) {
                          void handleToggleActive(t, true);
                        } else {
                          setDisableTarget(t);
                        }
                      }}
                      className={doctorSettingsGlassCheckboxClass("emerald")}
                      aria-label={`${ownedTypeActive(t) ? "Disable" : "Enable"} ${t.name}`}
                    />
                  )
                }
                title={toTitleCaseLabel(t.name)}
                meta={`${t.duration_minutes} min · ${toTitleCaseLabel("slot step")} ${t.slot_interval_minutes} min`}
                trailing={
                  <div className="flex flex-wrap items-center justify-end gap-1">
                    <VisitFeeBadge size="table" priceCents={t.price_cents ?? 0} />
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
                      onClick={() => setDeleteTypeId(t.id)}
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

      {layout === "collapsible" ? (
        <GlassCollapsibleDetails
          ref={addDetailsRef}
          tone="emerald"
          summaryChip={
            <GlassDoctorSettingsActionChip
              tone="emerald"
              icon={Plus}
              label={ADDITIONAL_TYPE_ADD_SUMMARY_LABEL}
              pending={isCreating}
            />
          }
          title=""
        >
          {addFormFields}
        </GlassCollapsibleDetails>
      ) : (
        addFormFields
      )}

      <ConfirmActionDialog
        open={Boolean(disableTarget)}
        onOpenChange={(open) => {
          if (!open) setDisableTarget(null);
        }}
        variant="warning"
        title={DISABLE_VISIT_TYPE_CONFIRM_TITLE}
        subtitle={
          disableTarget
            ? buildDisableOwnedVisitTypeConfirmSubtitle(disableTarget, variant)
            : ""
        }
        confirmLabel="Disable"
        cancelLabel="Cancel"
        confirmPending={disableTarget ? togglePendingIds.has(disableTarget.id) : false}
        onConfirm={async () => {
          if (disableTarget) {
            await handleToggleActive(disableTarget, false);
          }
          setDisableTarget(null);
        }}
      />

      <ConfirmActionDialog
        open={Boolean(deleteTypeId && typePendingDelete)}
        onOpenChange={(open) => {
          if (!open) setDeleteTypeId(null);
        }}
        variant="destructive"
        title={DELETE_APPOINTMENT_TYPE_CONFIRM_TITLE}
        subtitle={
          typePendingDelete
            ? buildAppointmentTypeDeleteConfirmSubtitle(typePendingDelete)
            : ""
        }
        confirmLabel="Delete"
        confirmPendingLabel="Deleting…"
        cancelLabel="Cancel"
        confirmPending={isDeleting}
        onConfirm={async () => {
          if (deleteTypeId) {
            await deleteType(deleteTypeId);
          }
          setDeleteTypeId(null);
        }}
      />
    </div>
  );
}
