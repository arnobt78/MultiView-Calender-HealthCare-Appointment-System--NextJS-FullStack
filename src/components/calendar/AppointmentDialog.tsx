"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn, toTitleCaseLabel } from "@/lib/utils";
import {
  skyGlassBackButtonClass,
  skyGlassPrimaryButtonClass,
} from "@/lib/calendar-header-action-styles";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Category,
  Patient,
  Appointment,
} from "@/types/types";
import { useQueryClient } from "@tanstack/react-query";
import { usePatients } from "@/hooks/usePatients";
import { useCategories } from "@/hooks/useCategories";
import { useDoctorsDirectory } from "@/hooks/useDoctorsDirectory";
import { prefetchDoctorsDirectory } from "@/lib/prefetch-doctors-directory";
import { useAppointments, FullAppointment } from "@/hooks/useAppointments";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { isValidUUID } from "@/lib/validation";
import { invalidateAssigneesActivitiesAppointment } from "@/lib/query-client";
import { notify } from "@/lib/notify";
import { appointmentCreateSchema } from "@/lib/schemas/appointment";
import { prefetchSchedulingMonthWithAdjacent } from "@/lib/prefetch-scheduling";
import { Calendar, Loader2, X } from "lucide-react";

/** Client-side upload cap (bytes) — keep in sync with UI note in `AppointmentDialogGeneralSection`. */
const MAX_ATTACHMENT_BYTES = 1048576;
// Using Vercel Blob for file storage (better for demo projects on Vercel)
import { uploadFileViaAPI } from "@/lib/vercelBlob";
import { AppointmentDialogGeneralSection } from "@/components/calendar/appointment-dialog/AppointmentDialogGeneralSection";
import { AppointmentDialogAssigneesSection } from "@/components/calendar/appointment-dialog/AppointmentDialogAssigneesSection";
import {
  addPatientAssigneeToAppointment,
  enrichAssigneesWithPatientIds,
  fetchAppointmentAssigneesForDialog,
  removeAppointmentAssignee,
} from "@/lib/appointment-dialog-assignees";
import { utcToLocalInputValue, localInputValueToUTC } from "@/lib/datetime-local";
import { appointmentStartToSlotPickDateStr } from "@/lib/prefetch-appointment-detail-edit";
import { appointmentStartToSlotPickIso } from "@/lib/scheduling/slot-pick-selection";
import { prefetchAppointmentTypesForDoctor } from "@/lib/prefetch-appointment-types";
import { enrichFullAppointmentDialogSeeds } from "@/lib/appointment-detail-dialog";
import {
  normalizeAppointmentStatus,
  type AppointmentStatus,
} from "@/lib/appointment-status-display";
import type { AppointmentAssignee } from "@/types/types";

type Props = {
  trigger?: React.ReactNode;
  appointment?: FullAppointment;
  onSuccess?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Telehealth queue CTA — pre-filter visit types to video only (REQ-0091). */
  telehealthBookingPreset?: boolean;
};

/**
 * Appointment create/edit host: two-column layout with General vs Access & extras.
 * State stays here so save/assignee/activity mutations remain one place; child sections are presentational.
 *
 * Modal chrome: sky border + glow (see `GlobalSearch`), inner layout rhythm aligned with Add Patient dialog
 * (`PatientManagement`): custom close, scroll body, sky-tinted footer. Uploads enforce `MAX_ATTACHMENT_BYTES`
 * per file before `uploadFileViaAPI` (see `handleFileChange`).
 */
export default function AppointmentDialog({
  trigger,
  appointment,
  onSuccess,
  isOpen,
  onOpenChange,
  telehealthBookingPreset = false,
}: Props) {
  const isEditMode = Boolean(appointment);
  const isControlled = typeof isOpen === "boolean";
  // Controlled + closed: must not flash open on detail mount when `appointment` is seeded for edit.
  const [open, setOpen] = useState(() =>
    isControlled ? isOpen : isEditMode
  );
  const prevControlledIsOpenRef = useRef(isControlled ? isOpen : false);

  const { patients = [] } = usePatients();
  const { categories = [] } = useCategories();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const showTreatingPhysicianPicker = Boolean(user) && (user?.role ?? "") !== "patient";
  const { data: directoryData, isLoading: directoryDoctorsLoading } = useDoctorsDirectory({
    // Warm directory while detail mounts dialog closed (edit seed present) — avoids picker flash on open.
    enabled: showTreatingPhysicianPicker && (open || Boolean(appointment?.id)),
  });
  const directoryDoctors = useMemo(
    () => directoryData?.doctors ?? [],
    [directoryData?.doctors]
  );
  /** Calendar/list edit — enrich list row with picker seeds before `doctors.all` fully hydrates. */
  const enrichedAppointment = useMemo(
    () =>
      appointment ? enrichFullAppointmentDialogSeeds(appointment, directoryDoctors) : undefined,
    [appointment, directoryDoctors]
  );
  const { createAppointmentAsync, updateAppointmentAsync } = useAppointments();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [patientId, setPatientId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [attachments, setAttachments] = useState(""); // comma-separated string
  const [status, setStatus] = useState("pending");
  /** Chief complaint / presenting symptom stored on the appointment row for clinical context. */
  const [chiefComplaint, setChiefComplaint] = useState("");
  /** B2: User.id of treating physician — persisted as `treating_physician_id`; defaults to calendar owner when unset. */
  const [treatingPhysicianId, setTreatingPhysicianId] = useState("");
  /** Cal-style slot picker — reset in `resetFormState` when the dialog closes so the next open is clean. */
  const [slotPickDateStr, setSlotPickDateStr] = useState("");
  const [slotPickTypeId, setSlotPickTypeId] = useState("");
  /** UTC ISO of picked slot — lifted for edit re-seed + chip highlight on reopen. */
  const [slotPickStartIso, setSlotPickStartIso] = useState<string | null>(null);
  /**
   * Warm visit types + scheduling while edit dialog is mounted (detail page) or open.
   * Prefers treating physician over session user for admin scheduling another doctor's calendar.
   */
  useEffect(() => {
    if (!open && !appointment?.id) return;
    const schedDoctor = treatingPhysicianId || user?.id;
    if (!schedDoctor || !isValidUUID(schedDoctor)) return;
    prefetchAppointmentTypesForDoctor(queryClient, schedDoctor);
    if (slotPickTypeId && isValidUUID(slotPickTypeId)) {
      prefetchSchedulingMonthWithAdjacent(queryClient, {
        doctorId: schedDoctor,
        schedulingScope: { kind: "type", typeId: slotPickTypeId },
        excludeAppointmentId: appointment?.id,
      });
    }
  }, [
    open,
    appointment?.id,
    user?.id,
    queryClient,
    treatingPhysicianId,
    slotPickTypeId,
  ]);

  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileProgress, setFileProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** Edit-mode share list — synced from appointment seed + live GET after add/remove mutations. */
  const [dialogAssignees, setDialogAssignees] = useState<AppointmentAssignee[]>([]);
  const [assigneeMutationBusy, setAssigneeMutationBusy] = useState(false);
  const editAppointmentId = appointment?.id ?? null;

  const resetFormState = () => {
    setTitle("");
    setNotes("");
    setStart("");
    setEnd("");
    setPatientId("");
    setCategoryId("");
    setLocation("");
    setAttachments("");
    setStatus("pending");
    setChiefComplaint("");
    // Empty shows "Select Doctor" in UI; create API still receives calendar owner via `treating_physician: id || user?.id`.
    setTreatingPhysicianId("");
    setSlotPickDateStr("");
    setSlotPickTypeId("");
    setSlotPickStartIso(null);
    setUploadedFiles([]);
    setError(null);
    setUploading(false);
    setLoading(false);
    setFileProgress({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setDialogAssignees([]);
    setAssigneeMutationBusy(false);
  };

  const syncDialogAssigneesFromServer = useCallback(
    async (appointmentId: string, seed?: AppointmentAssignee[]) => {
      const rows = await fetchAppointmentAssigneesForDialog(appointmentId);
      setDialogAssignees(enrichAssigneesWithPatientIds(rows, patients, seed));
    },
    [patients]
  );

  /**
   * Populate edit fields from appointment row. Called on appointment change and on every open
   * (controlled detail: close resets form; reopen must re-seed because `appointment` ref is stable).
   */
  const seedFormFromAppointment = useCallback(
    (appt: FullAppointment) => {
      setTitle(appt.title || "");
      setNotes(appt.notes || "");
      setStart(utcToLocalInputValue(appt.start));
      setEnd(utcToLocalInputValue(appt.end));
      setPatientId(appt.patient || "");
      setCategoryId(appt.category || "");
      setLocation(appt.location || "");
      setAttachments((appt.attachments || []).join(", "));
      setStatus(appt.status || "pending");
      setChiefComplaint(appt.chief_complaint || "");
      setSlotPickTypeId(appt.appointment_type_id || "");
      setSlotPickDateStr(appointmentStartToSlotPickDateStr(appt.start));
      setSlotPickStartIso(appointmentStartToSlotPickIso(appt.start));
      setTreatingPhysicianId(
        appt.treating_physician_id ?? appt.user_id ?? user?.id ?? ""
      );
      const seed = appt.appointment_assignee ?? [];
      setDialogAssignees(enrichAssigneesWithPatientIds(seed, patients, seed));
      if (appt.id && isValidUUID(appt.id)) {
        void syncDialogAssigneesFromServer(appt.id, seed).catch(() => {
          /* keep seed on fetch failure */
        });
      }
    },
    [patients, user?.id, syncDialogAssigneesFromServer]
  );

  useEffect(() => {
    if (!isControlled) return;
    const wasOpen = prevControlledIsOpenRef.current;
    prevControlledIsOpenRef.current = Boolean(isOpen);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(isOpen);
    // Update Visit sets `isOpen` directly — does not call handleDialogOpenChange; re-seed after close reset.
    if (isOpen && !wasOpen && appointment) {
      seedFormFromAppointment(appointment);
    }
  }, [isOpen, isControlled, appointment, seedFormFromAppointment]);

  useEffect(() => {
    if (appointment) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync form from appointment prop / live detail updates
      seedFormFromAppointment(appointment);
      // Controlled parents own dialog visibility — seed fields only (detail mount must stay closed).
      if (!isControlled) {
        setOpen(true);
      }
    } else {
      setTreatingPhysicianId("");
      setDialogAssignees([]);
    }
  }, [appointment, seedFormFromAppointment, isControlled]);

  /** Re-map assignee chips when the patients cache hydrates after SSR seed. */
  useEffect(() => {
    if (!editAppointmentId || dialogAssignees.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDialogAssignees((prev) =>
      enrichAssigneesWithPatientIds(prev, patients, appointment?.appointment_assignee)
    );
  }, [patients, editAppointmentId, appointment?.appointment_assignee, dialogAssignees.length]);

  const handleAddDialogAssignee = async (patientId: string) => {
    if (!editAppointmentId || !isValidUUID(editAppointmentId)) return;
    if (dialogAssignees.some((a) => a.user === patientId)) return;
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;
    if (!patient.email?.trim()) {
      notify.error({
        title: "Cannot share",
        subtitle: "Patient needs an email to share.",
      });
      return;
    }

    setAssigneeMutationBusy(true);
    setError(null);
    try {
      await addPatientAssigneeToAppointment(editAppointmentId, patientId, patient.email);
      await invalidateAssigneesActivitiesAppointment(queryClient, editAppointmentId);
      await syncDialogAssigneesFromServer(editAppointmentId, dialogAssignees);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to add assignee";
      setError(message);
      notify.error({ title: "Share failed", subtitle: message });
    } finally {
      setAssigneeMutationBusy(false);
    }
  };

  const handleRemoveDialogAssignee = async (
    userId: string | null,
    assigneeId?: string
  ) => {
    if (!editAppointmentId) return;
    if (!assigneeId) {
      setDialogAssignees((prev) => prev.filter((a) => a.user !== userId));
      return;
    }

    setAssigneeMutationBusy(true);
    setError(null);
    try {
      await removeAppointmentAssignee(assigneeId);
      await invalidateAssigneesActivitiesAppointment(queryClient, editAppointmentId);
      await syncDialogAssigneesFromServer(editAppointmentId);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to remove assignee";
      setError(message);
      notify.error({ title: "Remove share failed", subtitle: message });
    } finally {
      setAssigneeMutationBusy(false);
    }
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
    if (nextOpen) {
      if (showTreatingPhysicianPicker) {
        prefetchDoctorsDirectory(queryClient);
      }
      if (appointment) {
        seedFormFromAppointment(appointment);
      }
    } else {
      resetFormState();
    }
  };

  /**
   * Required for save — asterisks in `AppointmentDialogGeneralSection` must match this set exactly:
   * title, start, end, patient (client), category; end must be on/after start (same rule as here).
   */
  const canSave = useMemo(
    () =>
      Boolean(
        title.trim() &&
        start &&
        end &&
        patientId &&
        categoryId &&
        new Date(localInputValueToUTC(start)).getTime() <= new Date(localInputValueToUTC(end)).getTime()
      ),
    [title, start, end, patientId, categoryId]
  );

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!title || !start || !end || !patientId || !categoryId) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      const safeStart = localInputValueToUTC(start);
      const safeEnd = localInputValueToUTC(end);
      /** Comma-separated UI string → URL list for Zod + API (same field name end-to-end: `attachments`). */
      const parsedAttachments = attachments.split(",").map((s) => s.trim()).filter(Boolean);

      const saveStatus: AppointmentStatus = isEditMode
        ? normalizeAppointmentStatus(status)
        : status === "cancelled"
          ? "pending"
          : normalizeAppointmentStatus(status);

      const parsed = appointmentCreateSchema.safeParse({
        title,
        start: safeStart,
        end: safeEnd,
        patient: patientId || null,
        category: categoryId || null,
        location: location || null,
        notes: notes || "",
        status: saveStatus,
        attachments: parsedAttachments,
      });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || "Please check the form fields.");
        notify.error({
          title: "Invalid appointment details",
          subtitle: parsed.error.issues[0]?.message || "Please check the form fields.",
        });
        setLoading(false);
        return;
      }

      let apptId = appointment?.id;

      if (isEditMode && apptId) {
        const updates: Partial<Appointment> = {};
        if (title !== appointment?.title) updates.title = title;
        if (notes !== appointment?.notes) updates.notes = notes;
        if (start !== utcToLocalInputValue(appointment?.start || "")) updates.start = safeStart;
        if (end !== utcToLocalInputValue(appointment?.end || "")) updates.end = safeEnd;
        if (patientId !== appointment?.patient) updates.patient = patientId;
        if (categoryId !== appointment?.category) updates.category = categoryId;
        if (location !== appointment?.location) updates.location = location;
        if (attachments !== (appointment?.attachments || []).join(", ")) updates.attachments = parsedAttachments;
        if (status !== appointment?.status) updates.status = saveStatus;
        if (chiefComplaint !== (appointment?.chief_complaint ?? "")) {
          (updates as Record<string, unknown>).chief_complaint = chiefComplaint.trim() || null;
        }
        if (slotPickTypeId && slotPickTypeId !== (appointment?.appointment_type_id ?? "")) {
          (updates as Record<string, unknown>).appointment_type_id = slotPickTypeId;
        }
        updates.updated_at = new Date().toISOString();

        const prevTreating =
          appointment?.treating_physician_id ?? appointment?.user_id ?? "";
        if (treatingPhysicianId !== prevTreating) {
          (updates as Partial<Appointment> & { treating_physician?: string | null }).treating_physician =
            treatingPhysicianId || null;
        }

        if (Object.keys(updates).length > 0) {
          await updateAppointmentAsync({ id: apptId, ...updates });
        }

      } else {
        const createResult = await createAppointmentAsync({
          title,
          notes,
          start: safeStart,
          end: safeEnd,
          patient: patientId,
          category: categoryId,
          location,
          attachments: parsedAttachments,
          status: saveStatus,
          treating_physician: treatingPhysicianId || user?.id,
          // New clinical fields — appointment_type_id drives is_telehealth derivation server-side
          ...(slotPickTypeId ? { appointment_type_id: slotPickTypeId } : {}),
          ...(chiefComplaint.trim() ? { chief_complaint: chiefComplaint.trim() } : {}),
        } as Partial<Appointment> & { treating_physician?: string; appointment_type_id?: string; chief_complaint?: string });
        apptId = createResult.appointment.id;
      }

      if (apptId) {
        await invalidateAssigneesActivitiesAppointment(queryClient, apptId);
      }

      handleDialogOpenChange(false);
      onSuccess?.();
    } catch (e: unknown) {
      if (typeof e === "object" && e && "message" in e) {
        notify.error({
          title: "Save failed",
          subtitle: (e as { message: string }).message || "Unknown error",
        });
        setError((e as { message: string }).message || "Unknown error");
      } else {
        notify.error({
          title: "Save failed",
          subtitle: "Unknown error",
        });
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload — reject individual files over MAX_ATTACHMENT_BYTES before hitting the API.
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setError(null);
    const files = Array.from(e.target.files);
    const uploadedFileNames: string[] = [];
    const skippedOversized: string[] = [];
    for (const file of files) {
      setFileProgress((prev) => ({ ...prev, [file.name]: 0 }));
      if (file.size > MAX_ATTACHMENT_BYTES) {
        skippedOversized.push(file.name);
        setFileProgress((prev) => ({ ...prev, [file.name]: 0 }));
        continue;
      }
      try {
        // Upload to Vercel Blob with progress tracking
        // Uses project-specific folder from environment variable
        const result = await uploadFileViaAPI(
          file,
          (progress) => {
            setFileProgress((prev) => ({
              ...prev,
              [file.name]: progress,
            }));
          }
        );
        // Store the Vercel Blob URL (full URL for easy access)
        uploadedFileNames.push(result.url);
      } catch (error: unknown) {
        setError(`Error uploading: ${file.name}`);
        setFileProgress((prev) => ({ ...prev, [file.name]: 0 }));
        continue;
      }
    }
    if (skippedOversized.length > 0) {
      const skipMsg = `Skipped (over 1MB): ${skippedOversized.join(", ")}`;
      setError((prev) => (prev?.trim() ? `${prev} ${skipMsg}` : skipMsg));
    }
    setUploadedFiles((prev) => [...prev, ...uploadedFileNames]);
    setAttachments((prev: string) =>
      prev
        ? prev + ", " + uploadedFileNames.join(", ")
        : uploadedFileNames.join(", ")
    );
    setUploading(false);
    e.target.value = "";
  };

  const handleRemoveUploadedFile = async (publicId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f !== publicId));
    setAttachments((prev) =>
      prev
        .split(",")
        .map((s) => s.trim())
        .filter((f) => f && f !== publicId)
        .join(", ")
    );
    // Optionally: remove from Vercel Blob storage (not just UI)
    try {
      // Delete via API route (requires authentication)
      await fetch("/api/storage/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: publicId }),
      });
    } catch (error: unknown) {
      console.error("Error deleting file from Vercel Blob:", error);
      // Continue even if deletion fails - file is removed from UI
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {/*
        Shell: same rhythm as Add Patient dialog (custom close, header band, scroll body, tinted footer)
        with Global Search sky border + outer glow — `showCloseButton={false}` avoids duplicate X controls.
      */}
      <DialogContent
        showCloseButton={false}
        className="flex h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] flex-col gap-0 overflow-hidden rounded-[28px] border border-sky-400/30 bg-white p-0 shadow-[0_30px_80px_rgba(2,132,199,0.35)] backdrop-blur-sm"
      >
        <div className="shrink-0 bg-white pt-6 text-gray-700">
          <div className="px-6">
            <div className="flex items-start gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 text-sky-700">
                <Calendar className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-left text-lg font-semibold text-gray-700">
                  {isEditMode
                    ? toTitleCaseLabel("Edit Appointment")
                    : toTitleCaseLabel("Create New Appointment")}
                </DialogTitle>
                <DialogDescription className="text-left text-sm text-muted-foreground">
                  {isEditMode
                    ? toTitleCaseLabel("Update scheduling details and appointment type.")
                    : toTitleCaseLabel("Set the client, time, and appointment type.")}
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-sky-100 hover:text-sky-800"
                >
                  <X className="h-4 w-4" aria-hidden />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </div>
          </div>
          <div className="mx-6 mt-4 border-b border-sky-200/60" />
        </div>
        {error && (
          <div className="shrink-0 px-6 pt-2 text-xs text-red-600">{error}</div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 text-gray-700">
          <div className="grid grid-cols-1 gap-6">
            <section className="min-w-0">
              <h3 className="mb-2 text-sm font-semibold tracking-tight text-gray-700">
                {toTitleCaseLabel("Core Appointment Scheduling")}
              </h3>
              <AppointmentDialogGeneralSection
                title={title}
                setTitle={setTitle}
                notes={notes}
                setNotes={setNotes}
                start={start}
                setStart={setStart}
                end={end}
                setEnd={setEnd}
                patientId={patientId}
                setPatientId={setPatientId}
                categoryId={categoryId}
                setCategoryId={setCategoryId}
                location={location}
                setLocation={setLocation}
                attachments={attachments}
                setAttachments={setAttachments}
                status={status}
                setStatus={setStatus}
                patients={patients}
                categories={categories}
                uploading={uploading}
                fileProgress={fileProgress}
                uploadedFiles={uploadedFiles}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
                onRemoveUploadedFile={handleRemoveUploadedFile}
                showTreatingPhysicianPicker={showTreatingPhysicianPicker}
                directoryDoctors={directoryDoctors}
                directoryDoctorsLoading={directoryDoctorsLoading}
                treatingPhysicianDirectorySeed={
                  enrichedAppointment?.treating_physician_directory_seed
                }
                visitTypeSeed={enrichedAppointment?.appointment_type_visit_seed}
                treatingPhysicianId={treatingPhysicianId}
                setTreatingPhysicianId={setTreatingPhysicianId}
                /**
                 * Prefer treating physician so admin scheduling for a specific doctor sees that
                 * doctor's available slots. Fall back to session user if no physician selected.
                 */
                availabilityDoctorId={treatingPhysicianId || user?.id || ""}
                slotPickDateStr={slotPickDateStr}
                setSlotPickDateStr={setSlotPickDateStr}
                slotPickTypeId={slotPickTypeId}
                setSlotPickTypeId={setSlotPickTypeId}
                slotPickStartIso={slotPickStartIso}
                setSlotPickStartIso={setSlotPickStartIso}
                chiefComplaint={chiefComplaint}
                setChiefComplaint={setChiefComplaint}
                excludeAppointmentId={editAppointmentId ?? undefined}
                telehealthBookingPreset={telehealthBookingPreset}
              />
            </section>
            {editAppointmentId && showTreatingPhysicianPicker ? (
              <section className="min-w-0">
                <h3 className="mb-2 text-sm font-semibold tracking-tight text-gray-700">
                  {toTitleCaseLabel("Access & Sharing")}
                </h3>
                <AppointmentDialogAssigneesSection
                  assignees={dialogAssignees}
                  patients={patients}
                  selectedPatientId={patientId}
                  onAddAssignee={(id) => {
                    void handleAddDialogAssignee(id);
                  }}
                  onRemoveAssignee={(uid, assigneeId) => {
                    void handleRemoveDialogAssignee(uid, assigneeId);
                  }}
                />
              </section>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-sky-200/60 bg-sky-50/40 px-6 py-3">
          <Button
            type="button"
            variant="ghost"
            className={cn(
              skyGlassBackButtonClass,
              "rounded-full disabled:pointer-events-none disabled:opacity-50"
            )}
            onClick={() => handleDialogOpenChange(false)}
            disabled={loading || uploading || assigneeMutationBusy}
          >
            <X className="size-4 shrink-0" aria-hidden />
            {toTitleCaseLabel("Cancel")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleSave}
            disabled={loading || uploading || assigneeMutationBusy || !canSave}
            className={cn(
              skyGlassPrimaryButtonClass,
              "rounded-full disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                {toTitleCaseLabel("Saving…")}
              </>
            ) : (
              <>
                <Calendar className="size-4 shrink-0" aria-hidden />
                {isEditMode
                  ? toTitleCaseLabel("Update Appointment")
                  : toTitleCaseLabel("Save New Appointment")}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
