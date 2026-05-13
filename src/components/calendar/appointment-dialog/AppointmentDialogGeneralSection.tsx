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
 * id so busy intervals match `POST /api/appointments` ownership. Treating physician trigger uses **only**
 * `SelectValue` so Radix does not duplicate avatars already rendered inside each `SelectItem`.
 */

import { type ChangeEvent, type CSSProperties, type ReactNode, type RefObject, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { addMinutes, format } from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
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
import { cn, toTitleCaseLabel } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { isValidUUID } from "@/lib/validation";
import { utcToLocalInputValue } from "@/lib/datetime-local";
import { resolvePatientPortraitUrl } from "@/lib/patient-portrait";
import { useAvailabilitySlots } from "@/hooks/useAvailabilitySlots";
import { SafeImage } from "@/components/ui/safe-image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, Patient, User } from "@/types/types";

/** Mirrors `PatientPortalPage` / GET `/api/appointment-types` — drives slot duration + buffers server-side. */
type AppointmentTypeRow = {
  id: string;
  name: string;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  slot_interval_minutes: number;
  minimum_notice_minutes: number;
  user_id: string | null;
};

/** Matches `MAX_ATTACHMENT_BYTES` in `AppointmentDialog.tsx` — keep both in sync. */
const MAX_ATTACHMENT_BYTES_LABEL = "1 MB";

/** Shared vertical rhythm with login email/password rows (`h-11` / 2.75rem). */
const glassRowControlBase =
  "h-11 min-h-[2.75rem] w-full min-w-0 rounded-2xl border border-sky-200/50 bg-white/75 px-3 py-0 text-sm leading-none text-gray-700 shadow-[0_8px_24px_rgba(2,132,199,0.14)] backdrop-blur-md transition-colors";

const glassInputClass = cn(
  glassRowControlBase,
  "placeholder:text-gray-500 focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-200/40"
);

const glassSelectTriggerClass = cn(
  glassRowControlBase,
  "cursor-pointer hover:bg-white/90 data-[placeholder]:text-gray-500 focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-200/40 flex w-full items-center gap-2 [&_[data-slot=select-value]]:line-clamp-1 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:text-left"
);

const glassDatetimeInputClass = cn(
  glassInputClass,
  "relative cursor-pointer pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
);

const glassTextareaClass = cn(
  "w-full min-w-0 rounded-2xl border border-sky-200/50 bg-white/75 px-3 py-2 text-sm text-gray-700 shadow-[0_8px_24px_rgba(2,132,199,0.14)] backdrop-blur-md transition-colors placeholder:text-gray-500 focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-200/40 min-h-[88px] resize-y"
);

const glassCardClass =
  "rounded-2xl border border-sky-200/55 bg-sky-50/35 p-3 shadow-[0_10px_32px_rgba(2,132,199,0.12)] backdrop-blur-md";

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
  doctors: User[];
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
};

function doctorLabel(d: User) {
  return d.display_name?.trim() ? d.display_name : d.email;
}

/** Prefer stored profile image; otherwise deterministic robohash (set4) for list + trigger consistency. */
function doctorAvatarSrc(d: User) {
  const trimmed = d.image?.trim();
  if (trimmed) return trimmed;
  return `https://robohash.org/${encodeURIComponent(d.id)}.png?size=64x64&set=set4`;
}

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

function DoctorMiniAvatar({ user, className }: { user: User; className?: string }) {
  const alt = doctorLabel(user);
  const src = doctorAvatarSrc(user);
  return (
    <span
      className={cn(
        "relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-sky-200/80",
        className
      )}
    >
      <SafeImage
        src={src}
        alt={alt}
        fill
        sizes="32px"
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
  doctors,
  treatingPhysicianId,
  setTreatingPhysicianId,
  availabilityDoctorId,
  slotPickDateStr,
  setSlotPickDateStr,
  slotPickTypeId,
  setSlotPickTypeId,
  chiefComplaint,
  setChiefComplaint,
}: Props) {
  const { data: typesData, isLoading: typesLoading } = useQuery({
    queryKey: queryKeys.appointmentTypes.byDoctor(availabilityDoctorId),
    queryFn: () =>
      apiClient<{ types: AppointmentTypeRow[] }>(
        `/api/appointment-types?doctorId=${encodeURIComponent(availabilityDoctorId)}`
      ),
    enabled: isValidUUID(availabilityDoctorId),
    staleTime: 5 * 60 * 1000,
  });
  const types = useMemo(() => typesData?.types ?? [], [typesData]);

  /** When the user has not chosen a type yet, default to the first returned type (portal parity). */
  const resolvedSlotTypeId = useMemo(
    () => slotPickTypeId || types[0]?.id || "",
    [slotPickTypeId, types]
  );

  const { data: slotsPayload, isLoading: slotsLoading } = useAvailabilitySlots(
    resolvedSlotTypeId && slotPickDateStr ? availabilityDoctorId : null,
    resolvedSlotTypeId && slotPickDateStr ? slotPickDateStr : null,
    resolvedSlotTypeId && slotPickDateStr ? resolvedSlotTypeId : null
  );
  const slots = slotsPayload?.slots ?? [];

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === patientId),
    [patients, patientId]
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId]
  );

  const selectedSlotType = useMemo(
    () => types.find((t) => t.id === resolvedSlotTypeId),
    [types, resolvedSlotTypeId]
  );

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
          className={cn(glassInputClass, "cursor-text")}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel htmlFor="notes" icon={FileText}>
          {toTitleCaseLabel("Notes")}
        </FieldLabel>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={cn(glassTextareaClass, "cursor-text")}
        />
      </div>

      {/* Chief complaint — presenting symptom / reason for visit stored on appointment for clinical context */}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="start" icon={CalendarClock}>
            {toTitleCaseLabel("Start")} <span className="text-gray-700">*</span>
          </FieldLabel>
          <Input
            type="datetime-local"
            id="start"
            value={start}
            onChange={(e) => {
              const nextStart = e.target.value;
              setStart(nextStart);
              if (end && nextStart && end < nextStart) {
                setEnd(nextStart);
              }
            }}
            className={cn(glassDatetimeInputClass)}
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="end" icon={CalendarClock}>
            {toTitleCaseLabel("End")} <span className="text-gray-700">*</span>
          </FieldLabel>
          <Input
            type="datetime-local"
            id="end"
            value={end}
            onChange={(e) => {
              const newEnd = e.target.value;
              if (start && newEnd < start) {
                setEnd(start);
              } else {
                setEnd(newEnd);
              }
            }}
            disabled={!start}
            min={start || undefined}
            className={cn(glassDatetimeInputClass)}
          />
        </div>
      </div>

      {/*
        Cal-style optional path: same `/api/availability/slots` contract as `BookAppointmentDialog` in
        `PatientPortalPage`. `availabilityDoctorId` is the calendar owner (session user), matching how
        `computeAvailabilitySlots` loads busy rows (`owner_id`), not the optional treating physician FK.
      */}
      {isValidUUID(availabilityDoctorId) ? (
        <div className={cn("space-y-3", glassCardClass)}>
          <FieldLabel icon={Timer}>
            {toTitleCaseLabel("Suggested start times (availability)")}
          </FieldLabel>
          <p className="text-xs leading-relaxed text-gray-600">
            Pick a visit length and day, then a chip fills Start/End above. Empty lists mean no weekly hours,
            time off, or open gaps for that configuration — you can still type times manually.
          </p>
          {typesLoading ? (
            <Skeleton className="h-11 w-full rounded-2xl" />
          ) : types.length === 0 ? (
            <p className="text-xs text-gray-600">
              No appointment types for this account — seed or create types + weekly availability in Control
              Panel to enable slot suggestions.
            </p>
          ) : (
            <>
              <Select value={resolvedSlotTypeId || undefined} onValueChange={setSlotPickTypeId}>
                <SelectTrigger className={glassSelectTriggerClass} aria-label="Appointment type for slots">
                  <SelectValue placeholder={toTitleCaseLabel("Visit type (duration)")} />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.id} value={t.id} textValue={t.name}>
                      <span className="flex w-full min-w-0 items-center justify-between gap-2">
                        <span className="truncate">{t.name}</span>
                        <span className="shrink-0 text-xs text-gray-500">{t.duration_minutes} min</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="space-y-1">
                <Label htmlFor="slot-pick-date-input" className="text-xs text-gray-600">
                  {toTitleCaseLabel("Date for slot list")}
                </Label>
                <Input
                  id="slot-pick-date-input"
                  type="date"
                  value={slotPickDateStr}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setSlotPickDateStr(e.target.value)}
                  className={cn(glassInputClass, "cursor-pointer")}
                />
              </div>
              {resolvedSlotTypeId && slotPickDateStr ? (
                slotsLoading ? (
                  <Skeleton className="h-14 w-full rounded-2xl" />
                ) : (
                  <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-0.5">
                    {slots.length === 0 ? (
                      <p className="text-xs text-amber-800">{toTitleCaseLabel("No open slots this day.")}</p>
                    ) : (
                      slots.map((iso) => (
                        <Button
                          key={iso}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="cursor-pointer rounded-full border-sky-200/80 bg-white/90 text-xs font-medium text-sky-900 hover:bg-sky-50"
                          onClick={() => {
                            const dur = selectedSlotType?.duration_minutes ?? 30;
                            const endUtc = addMinutes(new Date(iso), dur).toISOString();
                            setStart(utcToLocalInputValue(iso));
                            setEnd(utcToLocalInputValue(endUtc));
                          }}
                        >
                          {format(new Date(iso), "HH:mm")}
                        </Button>
                      ))
                    )}
                  </div>
                )
              ) : null}
              {slotsPayload?.timezone ? (
                <p className="text-[10px] text-gray-500">
                  {toTitleCaseLabel("Availability math uses IANA zone")}: {slotsPayload.timezone}
                  {" — "}
                  {toTitleCaseLabel("chip labels use your browser local clock")}
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel icon={UserRound}>
            {toTitleCaseLabel("Client")} <span className="text-gray-700">*</span>
          </FieldLabel>
          <Select value={patientId || undefined} onValueChange={setPatientId}>
            <SelectTrigger className={glassSelectTriggerClass}>
              {selectedPatient ? (
                <PickerAvatar
                  src={resolvePatientPortraitUrl(selectedPatient)}
                  alt={`${selectedPatient.firstname} ${selectedPatient.lastname}`}
                />
              ) : null}
              <SelectValue placeholder={toTitleCaseLabel("Select Client")} />
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
            {toTitleCaseLabel("Category")} <span className="text-gray-700">*</span>
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
              <SelectValue placeholder={toTitleCaseLabel("Select Category")} />
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

      {showTreatingPhysicianPicker && (
        <div className={cn("space-y-2", glassCardClass)}>
          <FieldLabel icon={Stethoscope}>{toTitleCaseLabel("Treating Physician")}</FieldLabel>
          <p className="text-xs leading-relaxed text-gray-600">
            Clinical Contact For This Visit (B2). Calendar Ownership Stays On The Scheduling Account
            (`user_id`); Change This Only When Someone Else Is The Treating Clinician.
          </p>
          <Select
            value={treatingPhysicianId || undefined}
            onValueChange={setTreatingPhysicianId}
          >
            {/*
              Trigger shows a single `SelectValue` so the selected item’s row (with avatar inside `SelectItem`)
              is not duplicated next to a second manual avatar.
            */}
            <SelectTrigger className={glassSelectTriggerClass}>
              <SelectValue placeholder={toTitleCaseLabel("Select Doctor")} />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id} textValue={doctorLabel(d)}>
                  <span className="flex items-center gap-2">
                    <DoctorMiniAvatar user={d} className="h-7 w-7" />
                    <span className="truncate">{doctorLabel(d)}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
          <FieldLabel icon={ListTodo}>{toTitleCaseLabel("Status")}</FieldLabel>
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
