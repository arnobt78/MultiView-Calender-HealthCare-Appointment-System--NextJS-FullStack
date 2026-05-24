"use client";

/**
 * Core scheduling fields for an appointment: title, window, client (`patient_id`), category, location,
 * attachments, status, and optional B2 **treating physician** (User FK `treating_physician_id`).
 * `user_id` on the row remains the **calendar owner**; this picker only sets who is shown as the clinical
 * contact when it differs from the owner. Dates are edited as local `datetime-local` strings and
 * converted to UTC on save in the parent dialog.
 *
 * UI: `h-11` controls match login card inputs (`Login.tsx`); `datetime-local` uses WebKit picker indicator
 * positioning so the calendar control sits on the right like select chevrons. Client avatars use
 * `resolvePatientPortraitUrl` (demo table avatars + clinical JSON + robohash). Optional **Cal-style** slot
 * row reuses `GET /api/availability/slots` (see `docs/PROJECT_WALKTHROUGH.md`) with the **calendar owner**
 * id so busy intervals match `POST /api/appointments` ownership. Treating physician uses the same
 * `DoctorDirectoryPickerList` as patient booking (`GET /api/doctors` / `queryKeys.doctors.all`).
 */

import {
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { addMinutes, format, parseISO } from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  FileText,
  Heading2,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Paperclip,
  Stethoscope,
  Timer,
  Upload,
  UserRound,
  ListTodo,
} from "lucide-react";
import {
  staffAppointmentGlassRowControlBase,
  staffAppointmentGlassSectionClass,
  staffAppointmentGlassSelectTriggerClass,
} from "@/lib/appointment-dialog-ui-classes";
import { cn, toTitleCaseLabel } from "@/lib/utils";
import { isValidUUID } from "@/lib/validation";
import { utcToLocalInputValue } from "@/lib/datetime-local";
import { resolvePatientPortraitUrl } from "@/lib/patient-portrait";
import { prefetchSchedulingMonthWithAdjacent } from "@/lib/prefetch-scheduling";
import type { FlexDurationMinutes } from "@/lib/scheduling/flexible-type-config";
import { SchedulingPanel } from "@/components/shared/scheduling/SchedulingPanel";
import { SchedulingManualOverride } from "@/components/shared/scheduling/SchedulingManualOverride";
import { StaffAppointmentPickerField } from "@/components/shared/scheduling/StaffAppointmentPickerField";
import {
  VisitTypePickerList,
  VisitTypeSummaryCard,
} from "@/components/shared/scheduling/VisitTypePickerList";
import type { VisitTypePickerItem } from "@/components/shared/scheduling/VisitTypePickerList";
import { useBookableTypesForDoctor } from "@/hooks/useBookableTypesForDoctor";
import { SafeImage } from "@/components/ui/safe-image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, Patient } from "@/types/types";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";
import { DoctorDirectoryPickerCard } from "@/components/shared/doctor-display/DoctorDirectoryPickerCard";
import { DoctorDirectoryPickerList } from "@/components/shared/doctor-display/DoctorDirectoryPickerList";

/** Matches `MAX_ATTACHMENT_BYTES` in `AppointmentDialog.tsx` — keep both in sync. */
const MAX_ATTACHMENT_BYTES_LABEL = "1 MB";

const glassInputClass = cn(
  staffAppointmentGlassRowControlBase,
  "placeholder:text-gray-500 focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-200/40"
);

/** Radix Select trigger — shared shell + `SelectValue` slot rules (chevron styled in `select.tsx`). */
const glassSelectTriggerClass = cn(
  staffAppointmentGlassSelectTriggerClass,
  "data-[placeholder]:text-gray-500",
  "[&_[data-slot=select-value]]:line-clamp-1 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:text-left"
);

const glassDatetimeInputClass = cn(
  glassInputClass,
  "relative cursor-pointer pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
);

const glassTextareaClass = cn(
  "w-full min-w-0 rounded-2xl border border-sky-200/50 bg-white/75 px-3 py-2 text-sm text-gray-700 shadow-[0_8px_24px_rgba(2,132,199,0.14)] backdrop-blur-md transition-colors placeholder:text-gray-500 focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-200/40 min-h-[88px] resize-y"
);

const glassFileButtonClass =
  "inline-flex h-11 min-h-[2.75rem] w-full shrink-0 items-center justify-center gap-2 rounded-2xl border border-sky-300/45 bg-white/80 px-4 text-sm font-medium text-sky-900 shadow-[0_8px_22px_rgba(2,132,199,0.18)] backdrop-blur-md transition-all hover:border-sky-400/55 hover:bg-sky-50/90 hover:shadow-[0_12px_28px_rgba(2,132,199,0.22)] disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:min-w-[10rem] [&_svg]:size-4";

type Props = {
  title: string;
  setTitle: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  start: string;
  setStart: (v: string) => void;
  end: string;
  setEnd: (v: string) => void;
  patientId: string;
  setPatientId: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  attachments: string;
  setAttachments: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  patients: Patient[];
  categories: Category[];
  uploading: boolean;
  fileProgress: Record<string, number>;
  uploadedFiles: string[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveUploadedFile: (url: string) => void;
  /** When false (e.g. patient role), the treating-physician row is omitted — server still defaults B2 on create. */
  showTreatingPhysicianPicker: boolean;
  directoryDoctors: DoctorDirectoryRow[];
  directoryDoctorsLoading?: boolean;
  treatingPhysicianId: string;
  setTreatingPhysicianId: (v: string) => void;
  /**
   * Session user id passed from `AppointmentDialog` — must equal appointment `owner_id` on create so
   * `/api/availability/slots` busy detection matches this calendar (see `computeAvailabilitySlots`).
   */
  availabilityDoctorId: string;
  /** Lifted to parent so `resetFormState` clears slot UI when the dialog closes. */
  slotPickDateStr: string;
  setSlotPickDateStr: (v: string) => void;
  slotPickTypeId: string;
  setSlotPickTypeId: (v: string) => void;
  /** Chief complaint / presenting symptom from the patient — stored on appointment for clinical context. */
  chiefComplaint: string;
  setChiefComplaint: (v: string) => void;
  /** Edit mode — keeps the appointment's slot selectable in the grid. */
  excludeAppointmentId?: string;
};

/** Safe swatch for category `color` (hex) — invalid values fall back to neutral slate. */
function categorySwatchStyle(color: string | null | undefined): CSSProperties {
  const raw = color?.trim();
  if (raw && /^#[0-9a-fA-F]{3,8}$/.test(raw)) return { backgroundColor: raw };
  return { backgroundColor: "rgb(203 213 225)" };
}

function PickerAvatar({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-sky-200/80",
        className
      )}
    >
      <SafeImage
        src={src}
        alt={alt}
        fill
        sizes="28px"
        className="object-cover object-center"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </span>
  );
}

function FieldLabel({
  htmlFor,
  icon: Icon,
  children,
}: {
  htmlFor?: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-gray-700">
      <Icon className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
      <Label htmlFor={htmlFor} className="text-gray-700">
        {children}
      </Label>
    </div>
  );
}

/** Mandatory scheduling fields — same marker as Title. */
function RequiredMark() {
  return <span className="text-gray-700"> *</span>;
}

export function AppointmentDialogGeneralSection({
  title,
  setTitle,
  notes,
  setNotes,
  start,
  setStart,
  end,
  setEnd,
  patientId,
  setPatientId,
  categoryId,
  setCategoryId,
  location,
  setLocation,
  attachments,
  setAttachments,
  status,
  setStatus,
  patients,
  categories,
  uploading,
  fileProgress,
  uploadedFiles,
  fileInputRef,
  onFileChange,
  onRemoveUploadedFile,
  showTreatingPhysicianPicker,
  directoryDoctors,
  directoryDoctorsLoading = false,
  treatingPhysicianId,
  setTreatingPhysicianId,
  availabilityDoctorId,
  slotPickDateStr,
  setSlotPickDateStr,
  slotPickTypeId,
  setSlotPickTypeId,
  chiefComplaint,
  setChiefComplaint,
  excludeAppointmentId,
}: Props) {
  const queryClient = useQueryClient();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [slotPickStartIso, setSlotPickStartIso] = useState<string | null>(null);
  const [staffFlexDuration, setStaffFlexDuration] = useState<FlexDurationMinutes>(30);
  const [physicianPickerOpen, setPhysicianPickerOpen] = useState(false);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  /** Flexible visit — duration chip pick counts as a selection for collapsed summary card. */
  const [staffFlexTypePicked, setStaffFlexTypePicked] = useState(false);

  /** Treating-physician picker must be chosen before type/slots; else use calendar owner id. */
  const staffSchedulingDoctorId = showTreatingPhysicianPicker
    ? treatingPhysicianId
    : availabilityDoctorId;

  const { types, typesLoading, isStaffFlexible } = useBookableTypesForDoctor(
    staffSchedulingDoctorId
  );

  /** Typed visits default to first bookable type; flexible physicians skip auto-select. */
  const resolvedSlotTypeId = useMemo(() => {
    if (isStaffFlexible) return slotPickTypeId;
    return slotPickTypeId || types[0]?.id || "";
  }, [slotPickTypeId, types, isStaffFlexible]);

  const selectedSlotType = useMemo(
    () => types.find((t) => t.id === resolvedSlotTypeId),
    [types, resolvedSlotTypeId]
  );

  const selectedStaffType = useMemo(
    () => types.find((t) => t.id === slotPickTypeId) ?? null,
    [types, slotPickTypeId]
  );

  const selectedDirectoryDoctor = useMemo(
    () => directoryDoctors.find((d) => d.id === treatingPhysicianId),
    [directoryDoctors, treatingPhysicianId]
  );

  const prefetchStaffSchedulingScope = useCallback(
    (scope: { kind: "type"; typeId: string } | { kind: "flex"; durationMinutes: number }) => {
      if (!isValidUUID(staffSchedulingDoctorId)) return;
      prefetchSchedulingMonthWithAdjacent(queryClient, {
        doctorId: staffSchedulingDoctorId,
        schedulingScope: scope,
        excludeAppointmentId,
      });
    },
    [staffSchedulingDoctorId, excludeAppointmentId, queryClient]
  );

  function handleStaffSelectType(type: VisitTypePickerItem) {
    setSlotPickTypeId(type.id);
    setStaffFlexTypePicked(false);
    setSlotPickDateStr("");
    setSlotPickStartIso(null);
    setTypePickerOpen(false);
    prefetchStaffSchedulingScope({ kind: "type", typeId: type.id });
  }

  function handleStaffFlexDuration(minutes: FlexDurationMinutes) {
    setStaffFlexDuration(minutes);
    setStaffFlexTypePicked(true);
    setSlotPickDateStr("");
    setSlotPickStartIso(null);
    prefetchStaffSchedulingScope({ kind: "flex", durationMinutes: minutes });
  }

  /** Parity with patient booking step 2 — warm flex month map as soon as types finish loading. */
  useEffect(() => {
    if (typesLoading || !isStaffFlexible || !isValidUUID(staffSchedulingDoctorId)) return;
    prefetchStaffSchedulingScope({ kind: "flex", durationMinutes: staffFlexDuration });
  }, [
    typesLoading,
    isStaffFlexible,
    staffSchedulingDoctorId,
    staffFlexDuration,
    prefetchStaffSchedulingScope,
  ]);

  /** Prefetch-only: warm month map for first bookable type on open (does not set slotPickTypeId). */
  useEffect(() => {
    if (typesLoading || isStaffFlexible || !isValidUUID(staffSchedulingDoctorId)) return;
    const effectiveTypeId = slotPickTypeId || types[0]?.id;
    if (!isValidUUID(effectiveTypeId)) return;
    prefetchStaffSchedulingScope({ kind: "type", typeId: effectiveTypeId });
  }, [
    typesLoading,
    isStaffFlexible,
    staffSchedulingDoctorId,
    slotPickTypeId,
    types,
    prefetchStaffSchedulingScope,
  ]);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === patientId),
    [patients, patientId]
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId]
  );

  function handleSlotPick(iso: string) {
    setSlotPickStartIso(iso);
    const dur = selectedSlotType?.duration_minutes ?? 30;
    const endUtc = addMinutes(new Date(iso), dur).toISOString();
    setStart(utcToLocalInputValue(iso));
    setEnd(utcToLocalInputValue(endUtc));
    setSlotPickDateStr(format(parseISO(iso), "yyyy-MM-dd"));
  }

  return (
    <div className="space-y-4 text-gray-700">
      <div className="space-y-2">
        <FieldLabel htmlFor="title" icon={Heading2}>
          {toTitleCaseLabel("Title")} <span className="text-gray-700">*</span>
        </FieldLabel>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Appointment title (e.g. follow-up consultation)"
          className={cn(glassInputClass, "cursor-text")}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel htmlFor="chief-complaint" icon={MessageSquare}>
          {toTitleCaseLabel("Chief Complaint")}
        </FieldLabel>
        <Input
          id="chief-complaint"
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.target.value)}
          placeholder="Presenting symptom or reason for visit…"
          maxLength={500}
          className={cn(glassInputClass, "cursor-text")}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel htmlFor="notes" icon={FileText}>
          {toTitleCaseLabel("Internal Notes")}
        </FieldLabel>
        {/* `notes` is staff-only; `chief_complaint` is the patient-facing clinical line on cards. */}
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional — staff-only context, not shown to patients."
          rows={2}
          className={cn(glassTextareaClass, "cursor-text min-h-[72px]")}
        />
      </div>

      {showTreatingPhysicianPicker ? (
        <StaffAppointmentPickerField
          icon={Stethoscope}
          label={
            <>
              {toTitleCaseLabel("Treating Physician")}
              <RequiredMark />
            </>
          }
          placeholder={toTitleCaseLabel("Select Doctor/Treating Physician")}
          triggerValue={
            selectedDirectoryDoctor
              ? selectedDirectoryDoctor.display_name?.trim() ||
              selectedDirectoryDoctor.email?.trim() ||
              "Doctor"
              : undefined
          }
          selectedContent={
            selectedDirectoryDoctor ? (
              <DoctorDirectoryPickerCard doctor={selectedDirectoryDoctor} selected readOnly />
            ) : undefined
          }
          changeLabel={toTitleCaseLabel("Change doctor")}
          open={physicianPickerOpen}
          onOpenChange={(next) => {
            setPhysicianPickerOpen(next);
            if (next) setTypePickerOpen(false);
          }}
        >
          <DoctorDirectoryPickerList
            doctors={directoryDoctors}
            selectedDoctorId={treatingPhysicianId}
            onSelectDoctor={(id) => {
              setTreatingPhysicianId(id);
              setSlotPickDateStr("");
              setSlotPickTypeId("");
              setSlotPickStartIso(null);
              setStart("");
              setEnd("");
              setStaffFlexTypePicked(false);
            }}
            isLoading={directoryDoctorsLoading}
            fillHeight={false}
            dropdownMode
            onAfterSelect={() => {
              setPhysicianPickerOpen(false);
              setTypePickerOpen(true);
            }}
          />
        </StaffAppointmentPickerField>
      ) : null}

      {isValidUUID(staffSchedulingDoctorId) ? (
        <StaffAppointmentPickerField
          icon={Timer}
          label={
            <>
              {toTitleCaseLabel("Select Appointment Type & Duration Based on Selected Doctor's Availability")}
              <RequiredMark />
            </>
          }
          placeholder={toTitleCaseLabel("Select Appointment Type")}
          triggerValue={
            isStaffFlexible && staffFlexTypePicked
              ? toTitleCaseLabel(`Flexible Booking · ${staffFlexDuration} Min`)
              : selectedStaffType
                ? `${selectedStaffType.name} · ${selectedStaffType.duration_minutes} min`
                : undefined
          }
          selectedContent={
            isStaffFlexible && staffFlexTypePicked ? (
              <VisitTypeSummaryCard flexLabel={`Flexible booking · ${staffFlexDuration} min`} />
            ) : selectedStaffType ? (
              <VisitTypeSummaryCard type={selectedStaffType} />
            ) : undefined
          }
          changeLabel={toTitleCaseLabel("Change appointment type")}
          open={typePickerOpen}
          onOpenChange={setTypePickerOpen}
        >
          <VisitTypePickerList
            key={staffSchedulingDoctorId}
            typesLoading={typesLoading}
            isFlexible={isStaffFlexible}
            types={types}
            selectedType={selectedStaffType}
            onSelectType={handleStaffSelectType}
            flexDuration={staffFlexDuration}
            onFlexDurationChange={handleStaffFlexDuration}
            dropdownMode
            onAfterSelect={() => setTypePickerOpen(false)}
          />
        </StaffAppointmentPickerField>
      ) : null}

      {isValidUUID(staffSchedulingDoctorId) && (isStaffFlexible || resolvedSlotTypeId) ? (
        <div className={staffAppointmentGlassSectionClass}>
          <FieldLabel icon={CalendarDays}>
            {toTitleCaseLabel("Pick a Date & Time Based on Selected Doctor's Availability")}
            <RequiredMark />
          </FieldLabel>
          <SchedulingPanel
            doctorId={staffSchedulingDoctorId}
            typeId={resolvedSlotTypeId}
            typeDuration={
              isStaffFlexible
                ? staffFlexDuration
                : (selectedSlotType?.duration_minutes ?? 30)
            }
            dateStr={slotPickDateStr}
            onDateStrChange={(v) => {
              setSlotPickDateStr(v);
              setSlotPickStartIso(null);
            }}
            selectedSlot={slotPickStartIso}
            onSelectSlot={handleSlotPick}
            excludeAppointmentId={excludeAppointmentId}
            today={today}
            isFlexible={isStaffFlexible}
            flexDurationMinutes={staffFlexDuration}
            layout="split"
            hideCalendarCaption
            className="min-w-0 w-full"
          />
        </div>
      ) : null}

      <SchedulingManualOverride start={start} setStart={setStart} end={end} setEnd={setEnd} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel icon={UserRound}>
            {toTitleCaseLabel("Client/Patient")}
            <RequiredMark />
          </FieldLabel>
          <Select value={patientId || undefined} onValueChange={setPatientId}>
            <SelectTrigger className={glassSelectTriggerClass}>
              {selectedPatient ? (
                <PickerAvatar
                  src={resolvePatientPortraitUrl(selectedPatient)}
                  alt={`${selectedPatient.firstname} ${selectedPatient.lastname}`}
                />
              ) : null}
              <SelectValue placeholder={toTitleCaseLabel("Select Client/Patient")} />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.id} value={p.id} textValue={`${p.firstname} ${p.lastname}`}>
                  <span className="flex items-center gap-2">
                    <PickerAvatar
                      src={resolvePatientPortraitUrl(p)}
                      alt={`${p.firstname} ${p.lastname}`}
                    />
                    <span className="truncate">
                      {p.firstname} {p.lastname}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <FieldLabel icon={LayoutGrid}>
            {toTitleCaseLabel("Service/Medical Category")}
            <RequiredMark />
          </FieldLabel>
          <Select value={categoryId || undefined} onValueChange={setCategoryId}>
            <SelectTrigger className={glassSelectTriggerClass}>
              {selectedCategory ? (
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-sky-200/80"
                  style={categorySwatchStyle(selectedCategory.color)}
                  aria-hidden
                />
              ) : null}
              <SelectValue placeholder={toTitleCaseLabel("Select Service/Medical Category")} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id} textValue={c.label}>
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-sky-200/80"
                      style={categorySwatchStyle(c.color)}
                      aria-hidden
                    />
                    <span className="truncate">{c.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="location" icon={MapPin}>
            {toTitleCaseLabel("Location")}
          </FieldLabel>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={cn(glassInputClass, "cursor-text")}
          />
        </div>
        <div className="space-y-2">
          <FieldLabel icon={ListTodo}>{toTitleCaseLabel("Select Status")}</FieldLabel>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className={glassSelectTriggerClass}>
              <SelectValue placeholder={toTitleCaseLabel("Select Status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">{toTitleCaseLabel("Open")}</SelectItem>
              <SelectItem value="done">{toTitleCaseLabel("Done")}</SelectItem>
              <SelectItem value="alert">{toTitleCaseLabel("Alert")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="attachments" icon={Paperclip}>
            Attachments (Comma-Separated)
          </FieldLabel>
          <Input
            id="attachments"
            value={attachments}
            onChange={(e) => setAttachments(e.target.value)}
            className={cn(glassInputClass, "cursor-text")}
          />
        </div>
        <div className="space-y-2">
          <FieldLabel icon={Upload}>{toTitleCaseLabel("Choose Files")}</FieldLabel>
          <input
            id="appointment-file-upload"
            type="file"
            multiple
            ref={fileInputRef}
            aria-label="Upload attachment files"
            title="Upload attachment files"
            onChange={onFileChange}
            disabled={uploading}
            className="sr-only"
          />
          <Button
            type="button"
            variant="ghost"
            disabled={uploading}
            className={glassFileButtonClass}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="shrink-0" aria-hidden />
            {uploading ? toTitleCaseLabel("Uploading…") : toTitleCaseLabel("Choose Files")}
          </Button>
        </div>
      </div>
      <p className="text-xs text-gray-600">
        Note: Each Uploaded File Must Be At Most {MAX_ATTACHMENT_BYTES_LABEL}; Larger Files Are Skipped Before
        Upload.
      </p>
      {uploading && <div className="text-xs text-sky-700">{toTitleCaseLabel("Uploading…")}</div>}
      {Object.keys(fileProgress).length > 0 && (
        <div className="mt-1 text-xs text-sky-700">
          {Object.entries(fileProgress).map(([name, prog]) => (
            <div key={name}>
              {name}: {prog}%
            </div>
          ))}
        </div>
      )}
      {uploadedFiles.length > 0 && (
        <div className="mt-1 text-xs text-emerald-700">
          {toTitleCaseLabel("Uploaded")}:{" "}
          {uploadedFiles.map((f) => (
            <span key={f} className="mr-2 inline-flex items-center">
              <a
                href={f}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer underline hover:text-sky-800"
              >
                {toTitleCaseLabel("File")}
              </a>
              <button
                type="button"
                className="ml-1 cursor-pointer rounded text-red-500 hover:bg-red-100"
                onClick={() => onRemoveUploadedFile(f)}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
