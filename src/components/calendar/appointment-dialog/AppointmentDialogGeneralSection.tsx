"use client";

/**
 * Core scheduling fields for an appointment: title, window, client (`patient_id`), category, location,
 * attachments, status, and optional B2 **treating physician** (User FK `treating_physician_id`).
 * `user_id` on the row remains the **calendar owner**; this picker only sets who is shown as the clinical
 * contact when it differs from the owner. Dates are edited as local `datetime-local` strings and
 * converted to UTC on save in the parent dialog.
 *
 * UI: responsive two-column-ish rows (client+category, location+status, attachments+file), glass fields,
 * label icons, and required `*` markers that must stay aligned with `canSave` in `AppointmentDialog.tsx`.
 * Treating physician options use stored `image` when present, otherwise a stable **robohash** URL keyed
 * by `user.id` so avatars stay deterministic without extra API calls.
 */

import { type ChangeEvent, type ReactNode, type RefObject, useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  FileText,
  Heading2,
  LayoutGrid,
  MapPin,
  Paperclip,
  Stethoscope,
  Upload,
  UserRound,
  ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import type { Category, Patient, User } from "@/types/types";

/** Matches `MAX_ATTACHMENT_BYTES` in `AppointmentDialog.tsx` — keep both in sync. */
const MAX_ATTACHMENT_BYTES_LABEL = "1 MB";

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

const glassInputClass =
  "w-full min-w-0 rounded-2xl border border-sky-200/50 bg-white/75 text-gray-700 shadow-[0_8px_24px_rgba(2,132,199,0.14)] backdrop-blur-md transition-colors placeholder:text-gray-500 focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-200/40";

const glassSelectTriggerClass =
  "w-full min-w-0 cursor-pointer rounded-2xl border border-sky-200/50 bg-white/75 text-gray-700 shadow-[0_8px_24px_rgba(2,132,199,0.14)] backdrop-blur-md hover:bg-white/90 data-[placeholder]:text-gray-500 focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-200/40";

const glassTextareaClass = cn(glassInputClass, "min-h-[88px] resize-y");

const glassCardClass =
  "rounded-2xl border border-sky-200/55 bg-sky-50/35 p-3 shadow-[0_10px_32px_rgba(2,132,199,0.12)] backdrop-blur-md";

const glassFileButtonClass =
  "inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-2xl border border-sky-300/45 bg-white/80 px-4 text-sm font-medium text-sky-900 shadow-[0_8px_22px_rgba(2,132,199,0.18)] backdrop-blur-md transition-all hover:border-sky-400/55 hover:bg-sky-50/90 hover:shadow-[0_12px_28px_rgba(2,132,199,0.22)] disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:min-w-[10rem] [&_svg]:size-4";

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
}: Props) {
  const selectedDoctor = useMemo(
    () => doctors.find((d) => d.id === treatingPhysicianId),
    [doctors, treatingPhysicianId]
  );

  return (
    <div className="space-y-4 text-gray-700">
      <div className="space-y-2">
        <FieldLabel htmlFor="title" icon={Heading2}>
          Title <span className="text-gray-700">*</span>
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
          Notes
        </FieldLabel>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={cn(glassTextareaClass, "cursor-text")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="start" icon={CalendarClock}>
            Start <span className="text-gray-700">*</span>
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
            className={cn(glassInputClass, "cursor-pointer")}
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="end" icon={CalendarClock}>
            End <span className="text-gray-700">*</span>
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
            className={cn(glassInputClass, "cursor-pointer")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel icon={UserRound}>
            Client <span className="text-gray-700">*</span>
          </FieldLabel>
          <Select value={patientId} onValueChange={setPatientId}>
            <SelectTrigger className={glassSelectTriggerClass}>
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.id} value={p.id} textValue={`${p.firstname} ${p.lastname}`}>
                  {p.firstname} {p.lastname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <FieldLabel icon={LayoutGrid}>
            Category <span className="text-gray-700">*</span>
          </FieldLabel>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className={glassSelectTriggerClass}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id} textValue={c.label}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showTreatingPhysicianPicker && (
        <div className={cn("space-y-2", glassCardClass)}>
          <FieldLabel icon={Stethoscope}>Treating physician</FieldLabel>
          <p className="text-xs leading-relaxed text-gray-600">
            Clinical contact for this visit (B2). Calendar ownership stays on the scheduling account
            (`user_id`); change this only when someone else is the treating clinician.
          </p>
          <Select value={treatingPhysicianId} onValueChange={setTreatingPhysicianId}>
            <SelectTrigger className={glassSelectTriggerClass}>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {selectedDoctor ? <DoctorMiniAvatar user={selectedDoctor} /> : null}
                <SelectValue placeholder="Select doctor" />
              </div>
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
            Location
          </FieldLabel>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={cn(glassInputClass, "cursor-text")}
          />
        </div>
        <div className="space-y-2">
          <FieldLabel icon={ListTodo}>Status</FieldLabel>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className={glassSelectTriggerClass}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Open</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="attachments" icon={Paperclip}>
            Attachments (comma-separated)
          </FieldLabel>
          <Input
            id="attachments"
            value={attachments}
            onChange={(e) => setAttachments(e.target.value)}
            className={cn(glassInputClass, "cursor-text")}
          />
        </div>
        <div className="space-y-2">
          <FieldLabel icon={Upload}>Choose files</FieldLabel>
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
            {uploading ? "Uploading…" : "Choose files"}
          </Button>
        </div>
      </div>
      <p className="text-xs text-gray-600">
        Note: each uploaded file must be at most {MAX_ATTACHMENT_BYTES_LABEL}; larger files are skipped
        before upload.
      </p>
      {uploading && <div className="text-xs text-sky-700">Uploading…</div>}
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
          Uploaded:{" "}
          {uploadedFiles.map((f) => (
            <span key={f} className="mr-2 inline-flex items-center">
              <a
                href={f}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer underline hover:text-sky-800"
              >
                File
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
