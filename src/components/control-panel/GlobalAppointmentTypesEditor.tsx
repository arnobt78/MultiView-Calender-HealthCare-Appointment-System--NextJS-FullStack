"use client";

/**
 * Control-panel "Appointment Types" page editor — admin-only CRUD for global templates plus
 * a read/edit view of all doctor-owned custom types (also admin-editable).
 *
 * Sections:
 *   1. Stats row — total, global, custom, types with pricing (glassmorphic PatientStatCard tiles)
 *   2. Global Types — A-Z sorted, price badge, inline edit with Name/Duration/Price fields
 *   3. Custom Types by Doctor — A-Z by doctor name, same row layout, admin can edit/delete
 *
 * Mutations: POST /api/appointment-types/global, PATCH /api/appointment-types/[id], DELETE same.
 * All mutations run `invalidateAppointmentTypeDerived` via the existing hooks.
 */

import { useMemo, useState } from "react";
import {
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Stethoscope,
  Clock,
  DollarSign,
  Globe,
  UserCog,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  useGlobalAppointmentTypeMutations,
  useAdminAllAppointmentTypes,
  type AdminAllTypeRow,
} from "@/hooks/useAppointmentTypes";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import { APPOINTMENT_TYPE_COPY } from "@/lib/appointment-type-copy";
import { ControlPanelPageChrome } from "@/components/control-panel/ControlPanelPageChrome";
import { emeraldGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import {
  buildCpAdminAppointmentTypeDeleteConfirmSubtitle,
  DELETE_APPOINTMENT_TYPE_CONFIRM_TITLE,
} from "@/lib/confirm-delete-dialog-copy";

/** Format cents → "€X.XX" */
function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/** Group custom types by owner (user_id) → sorted A-Z by doctor display name. */
function groupByDoctor(rows: AdminAllTypeRow[]): { doctorLabel: string; doctorId: string | null; types: AdminAllTypeRow[] }[] {
  const map = new Map<string, { doctorLabel: string; doctorId: string | null; types: AdminAllTypeRow[] }>();
  for (const row of rows) {
    const key = row.user_id ?? "unknown";
    const label = row.owner_display_name || row.owner_email || "Unknown Doctor";
    if (!map.has(key)) {
      map.set(key, { doctorLabel: label, doctorId: row.user_id, types: [] });
    }
    map.get(key)!.types.push(row);
  }
  return Array.from(map.values()).sort((a, b) => a.doctorLabel.localeCompare(b.doctorLabel));
}

type EditState = {
  id: string;
  name: string;
  duration: string;
  price: string;
};

export function GlobalAppointmentTypesEditor() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data, isLoading, isError } = useAdminAllAppointmentTypes({ enabled: true });
  const {
    createGlobalType,
    updateGlobalType,
    deleteGlobalType,
    isCreating,
    isUpdating,
    isDeleting,
  } = useGlobalAppointmentTypeMutations();

  const globalTypes = useMemo(
    () => (data?.globalTypes ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)),
    [data?.globalTypes]
  );
  const customGroups = useMemo(
    () => groupByDoctor(data?.customTypes ?? []),
    [data?.customTypes]
  );

  /** Stats */
  const totalTypes = globalTypes.length + (data?.customTypes?.length ?? 0);
  const withPricing = [...globalTypes, ...(data?.customTypes ?? [])].filter(
    (t) => t.price_cents > 0
  ).length;

  const [newName, setNewName] = useState("");
  const [newDuration, setNewDuration] = useState("30");
  const [newPrice, setNewPrice] = useState("");
  const [editing, setEditing] = useState<EditState | null>(null);
  /** Glass confirm before DELETE — parity with portal visit-type editors. */
  const [deleteTarget, setDeleteTarget] = useState<AdminAllTypeRow | null>(null);

  const busy = isCreating || isUpdating || isDeleting;

  const startEdit = (t: AdminAllTypeRow) => {
    setEditing({
      id: t.id,
      name: t.name,
      duration: String(t.duration_minutes),
      price: t.price_cents > 0 ? (t.price_cents / 100).toFixed(2) : "",
    });
  };

  const cancelEdit = () => setEditing(null);

  const handleCreate = async () => {
    if (!isAdmin) return;
    const name = newName.trim();
    const duration = Number.parseInt(newDuration, 10);
    if (!name || !Number.isFinite(duration)) return;
    const priceCents = newPrice.trim()
      ? Math.round(parseFloat(newPrice) * 100)
      : 0;
    await createGlobalType({ name, duration_minutes: duration, price_cents: priceCents });
    setNewName("");
    setNewDuration("30");
    setNewPrice("");
  };

  const handleSaveEdit = async () => {
    if (!isAdmin || !editing) return;
    const name = editing.name.trim();
    const duration = Number.parseInt(editing.duration, 10);
    if (!name || !Number.isFinite(duration)) return;
    const priceCents = editing.price.trim()
      ? Math.round(parseFloat(editing.price) * 100)
      : 0;
    await updateGlobalType({
      id: editing.id,
      name,
      duration_minutes: duration,
      price_cents: priceCents,
    });
    cancelEdit();
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    await deleteGlobalType(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
        Loading appointment types…
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-2 text-sm text-red-600">Could not load appointment types.</p>
    );
  }

  return (
    <div className={cn(controlPanelSectionRootClass, "space-y-6")}>
      {/* Page header */}
      <ControlPanelPageChrome
        tab="visit_types_global"
        title={APPOINTMENT_TYPE_COPY.pageTitleLabel}
        description={APPOINTMENT_TYPE_COPY.pageSubtitleLabel}
        actions={
          isAdmin ? (
            <button
              type="button"
              className={emeraldGlassPrimaryButtonClass}
              disabled={busy}
              onClick={() => {
                const el = document.getElementById("global-appt-type-name");
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
                el?.focus();
              }}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add Global Type
            </button>
          ) : null
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <PatientStatCard
          variant="sky"
          icon={Tag}
          title="Total Types"
          subtitle="Global + all custom types"
          value={totalTypes}
          valueSkeleton={isLoading}
        />
        <PatientStatCard
          variant="violet"
          icon={Globe}
          title="Global Types"
          subtitle="Shared across all doctors"
          value={globalTypes.length}
          valueSkeleton={isLoading}
        />
        <PatientStatCard
          variant="emerald"
          icon={UserCog}
          title="Custom Types"
          subtitle="Doctor-specific visit types"
          value={data?.customTypes?.length ?? 0}
          valueSkeleton={isLoading}
        />
        <PatientStatCard
          variant="amber"
          icon={DollarSign}
          title="With Pricing"
          subtitle="Types with explicit visit fee"
          value={withPricing}
          valueSkeleton={isLoading}
        />
      </div>

      {!isAdmin ? (
        <p className="rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-xs text-amber-900">
          You can view this list; changing appointment types requires an admin account.
        </p>
      ) : null}

      {/* ── Global Types Section ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
          <Globe className="h-4 w-4 text-sky-600 shrink-0" aria-hidden />
          <h3 className="text-sm font-semibold text-gray-800">Global Types</h3>
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-normal text-sky-700">
            {globalTypes.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{APPOINTMENT_TYPE_COPY.globalSectionBlurb}</p>

        {globalTypes.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No global types yet — add one below.</p>
        ) : (
          <ul className="space-y-2">
            {globalTypes.map((t) => (
              <TypeRow
                key={t.id}
                type={t}
                isAdmin={isAdmin}
                editing={editing?.id === t.id ? editing : null}
                busy={busy}
                onStartEdit={() => startEdit(t)}
                onCancelEdit={cancelEdit}
                onSaveEdit={handleSaveEdit}
                onRequestDelete={() => setDeleteTarget(t)}
                onEditChange={(field, val) =>
                  setEditing((prev) => (prev ? { ...prev, [field]: val } : prev))
                }
                rowClass="bg-sky-50/40"
              />
            ))}
          </ul>
        )}

        {/* Add global type form — admin only */}
        {isAdmin ? (
          <div className="rounded-lg border border-dashed border-sky-200/80 bg-white/60 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-sky-900/80">
              Add global type
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="grid flex-1 gap-2 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="global-appt-type-name" className="text-xs">
                    Title
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
                    Duration (min)
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
                <div className="space-y-1">
                  <Label htmlFor="global-appt-type-price" className="text-xs">
                    Visit Fee (€)
                  </Label>
                  <Input
                    id="global-appt-type-price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="0.00"
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
                {isCreating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                )}
                Add
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      {/* ── Custom Types by Doctor Section — admin only ── */}
      {isAdmin && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <UserCog className="h-4 w-4 text-violet-600 shrink-0" aria-hidden />
            <h3 className="text-sm font-semibold text-gray-800">Custom Types by Doctor</h3>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-normal text-violet-700">
              {data?.customTypes?.length ?? 0}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{APPOINTMENT_TYPE_COPY.customSectionBlurb}</p>

          {customGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No doctor-specific types yet.
            </p>
          ) : (
            <div className="space-y-4">
              {customGroups.map((group) => (
                <div key={group.doctorId ?? "unknown"} className="space-y-2">
                  <p className="text-xs font-semibold text-violet-800">
                    {group.doctorLabel}
                  </p>
                  <ul className="space-y-1.5">
                    {group.types.map((t) => (
                      <TypeRow
                        key={t.id}
                        type={t}
                        isAdmin={isAdmin}
                        editing={editing?.id === t.id ? editing : null}
                        busy={busy}
                        onStartEdit={() => startEdit(t)}
                        onCancelEdit={cancelEdit}
                        onSaveEdit={handleSaveEdit}
                        onRequestDelete={() => setDeleteTarget(t)}
                        onEditChange={(field, val) =>
                          setEditing((prev) => (prev ? { ...prev, [field]: val } : prev))
                        }
                        rowClass="bg-violet-50/40"
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="destructive"
        title={DELETE_APPOINTMENT_TYPE_CONFIRM_TITLE}
        subtitle={
          deleteTarget
            ? buildCpAdminAppointmentTypeDeleteConfirmSubtitle(deleteTarget)
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmDisabled={isDeleting}
        onConfirm={() => {
          if (deleteTarget) {
            void handleDelete(deleteTarget.id);
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

/** Single type row — shared between global and custom sections. */
function TypeRow({
  type,
  isAdmin,
  editing,
  busy,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onRequestDelete,
  onEditChange,
  rowClass,
}: {
  type: AdminAllTypeRow;
  isAdmin: boolean;
  editing: EditState | null;
  busy: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onRequestDelete: () => void;
  onEditChange: (field: "name" | "duration" | "price", val: string) => void;
  rowClass?: string;
}) {
  if (editing) {
    return (
      <li
        className={cn(
          "flex flex-col gap-2 rounded-lg border px-3 py-2 text-xs sm:flex-row sm:items-end",
          rowClass
        )}
      >
        <div className="grid flex-1 gap-2 sm:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wide text-gray-600">Name</Label>
            <Input
              value={editing.name}
              onChange={(e) => onEditChange("name", e.target.value)}
              disabled={busy}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wide text-gray-600">Duration (min)</Label>
            <Input
              type="number"
              min={5}
              max={720}
              value={editing.duration}
              onChange={(e) => onEditChange("duration", e.target.value)}
              disabled={busy}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wide text-gray-600">Visit fee (€)</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={editing.price}
              placeholder="0.00"
              onChange={(e) => onEditChange("price", e.target.value)}
              disabled={busy}
              className="h-8 text-xs"
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
            onClick={onSaveEdit}
          >
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            disabled={busy}
            onClick={onCancelEdit}
          >
            Cancel
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li
      className={cn(
        "flex flex-col gap-2 rounded-lg border px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between",
        rowClass
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <span className="truncate font-medium text-gray-800">{type.name}</span>
        <Badge
          variant="outline"
          className="gap-1 text-[10px] calendar-glass-badge calendar-glass-badge-sky"
        >
          <Clock className="h-2.5 w-2.5" aria-hidden />
          {type.duration_minutes} min
        </Badge>
        {type.price_cents > 0 ? (
          <Badge
            variant="outline"
            className="gap-1 text-[10px] calendar-glass-badge calendar-glass-badge-emerald"
          >
            <DollarSign className="h-2.5 w-2.5" aria-hidden />
            {formatPrice(type.price_cents)}
          </Badge>
        ) : (
          <span className="text-[10px] text-muted-foreground italic">No price</span>
        )}
        {!type.is_active && (
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            Inactive
          </Badge>
        )}
      </div>
      {isAdmin ? (
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-7 w-7 border-gray-200/80"
            disabled={busy}
            title="Edit type"
            onClick={onStartEdit}
          >
            <Pencil className="h-3 w-3" aria-hidden />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-7 w-7 border-red-200/80 text-red-600 hover:bg-red-50"
            disabled={busy}
            title="Delete type"
            onClick={onRequestDelete}
          >
            <Trash2 className="h-3 w-3" aria-hidden />
          </Button>
        </div>
      ) : null}
    </li>
  );
}
