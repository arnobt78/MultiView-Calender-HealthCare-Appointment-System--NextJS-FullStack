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

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Category,
  Patient,
  Appointment,
  AppointmentAssignee,
} from "@/types/types";
import { useQueryClient } from "@tanstack/react-query";
import { usePatients } from "@/hooks/usePatients";
import { useCategories } from "@/hooks/useCategories";
import { useUsers } from "@/hooks/useUsers";
import { useAppointments, FullAppointment } from "@/hooks/useAppointments";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { isValidUUID } from "@/lib/validation";
import { invalidateAssigneesActivitiesAppointment } from "@/lib/query-client";
import { notify } from "@/lib/notify";
import { appointmentCreateSchema } from "@/lib/schemas/appointment";
import { Calendar, CalendarCheck, Loader2, X } from "lucide-react";

/** Client-side upload cap (bytes) — keep in sync with UI note in `AppointmentDialogGeneralSection`. */
const MAX_ATTACHMENT_BYTES = 1048576;
// Using Vercel Blob for file storage (better for demo projects on Vercel)
import { uploadFileViaAPI } from "@/lib/vercelBlob";
import { AppointmentDialogGeneralSection } from "@/components/calendar/appointment-dialog/AppointmentDialogGeneralSection";
import { AppointmentDialogAssigneesSection } from "@/components/calendar/appointment-dialog/AppointmentDialogAssigneesSection";
import { utcToLocalInputValue, localInputValueToUTC } from "@/lib/datetime-local";

type Props = {
  trigger?: React.ReactNode;
  appointment?: FullAppointment;
  onSuccess?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
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
}: Props) {
  const isEditMode = Boolean(appointment);
  const [open, setOpen] = useState(isEditMode);

  // Sync open state with parent if controlled
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (typeof isOpen === "boolean") setOpen(isOpen);
  }, [isOpen]);

  const { patients = [] } = usePatients();
  const { categories = [] } = useCategories();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: doctorsData } = useUsers(
    { role: "doctor", limit: 200 },
    // Staff-only list: patients must not hit `/api/users` from this dialog.
    { enabled: Boolean(user) && (user?.role ?? "") !== "patient" }
  );
  const doctors = useMemo(() => doctorsData?.users ?? [], [doctorsData]);
  const { createAppointmentAsync, updateAppointmentAsync } = useAppointments();

  /**
   * When the sheet opens, prefetch visit types for the calendar owner — matches the child `useQuery` key /
   * `staleTime` so the first paint often skips a loading skeleton (TanStack dedupes with `CalendarHeader`).
   */
  useEffect(() => {
    if (!open || !user?.id) return;
    if (!isValidUUID(user.id)) return;
    void queryClient.prefetchQuery({
      queryKey: queryKeys.appointmentTypes.byDoctor(user.id),
      queryFn: () =>
        apiClient<{ types: unknown[] }>(
          `/api/appointment-types?doctorId=${encodeURIComponent(user.id)}`
        ),
      staleTime: 5 * 60 * 1000,
    });
  }, [open, user?.id, queryClient]);

  const [assignees, setAssignees] = useState<AppointmentAssignee[]>([]); // type-safe

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
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileProgress, setFileProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setUploadedFiles([]);
    setAssignees([]);
    setError(null);
    setSuccess(false);
    setUploading(false);
    setLoading(false);
    setFileProgress({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (appointment) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(appointment.title || "");
      setNotes(appointment.notes || "");
      setStart(utcToLocalInputValue(appointment.start));
      setEnd(utcToLocalInputValue(appointment.end));
      setPatientId(appointment.patient || "");
      setCategoryId(appointment.category || "");
      setLocation(appointment.location || "");
      setAttachments((appointment.attachments || []).join(", "));
      setStatus(appointment.status || "pending");
      setChiefComplaint(appointment.chief_complaint || "");
      setSlotPickTypeId(appointment.appointment_type_id || "");
      setOpen(true);

      if (appointment.appointment_assignee) {
        setAssignees(appointment.appointment_assignee);
      } else {
        setAssignees([]);
      }

      setTreatingPhysicianId(
        appointment.treating_physician_id ?? appointment.user_id ?? user?.id ?? ""
      );
    } else {
      setAssignees([]);
      setTreatingPhysicianId("");
    }
  }, [appointment, user?.id]);

  const handleDialogOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
    if (!nextOpen) {
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
    setSuccess(false);
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

      const parsed = appointmentCreateSchema.safeParse({
        title,
        start: safeStart,
        end: safeEnd,
        patient: patientId || null,
        category: categoryId || null,
        location: location || null,
        notes: notes || "",
        status: status as "pending" | "done" | "alert",
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
        if (status !== appointment?.status) updates.status = status as "pending" | "done" | "alert";
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

        const isOwner = appointment?.user_id === user?.id;
        if (isOwner) {
          const existingAssigneesData = await queryClient.fetchQuery({
            queryKey: queryKeys.appointments.assignees(apptId),
            queryFn: () =>
              apiClient<{ assignees: AppointmentAssignee[] }>(
                `/api/appointments/${apptId}/assignees`
              ),
          });
          const existingAssignees = existingAssigneesData.assignees || [];

          const allAssignees = [...existingAssignees, ...assignees];
          const dedupedMap = new Map();
          for (const a of allAssignees) {
            const key = `${a.user || ''}|${a.invited_email || ''}`;
            if (!dedupedMap.has(key)) {
              dedupedMap.set(key, a);
            } else {
              const prev = dedupedMap.get(key);
              const statusOrder: Record<'accepted' | 'pending', number> = { accepted: 2, pending: 1 };
              const permOrder: Record<'full' | 'write' | 'read', number> = { full: 3, write: 2, read: 1 };
              const prevStatus = prev && typeof prev.status === 'string' && (prev.status === 'accepted' || prev.status === 'pending') ? statusOrder[prev.status as 'accepted' | 'pending'] : 0;
              const currStatus = typeof a.status === 'string' && (a.status === 'accepted' || a.status === 'pending') ? statusOrder[a.status as 'accepted' | 'pending'] : 0;
              const prevPerm = prev && typeof prev.permission === 'string' && (prev.permission === 'full' || prev.permission === 'write' || prev.permission === 'read') ? permOrder[prev.permission as 'full' | 'write' | 'read'] : 0;
              const currPerm = typeof a.permission === 'string' && (a.permission === 'full' || a.permission === 'write' || a.permission === 'read') ? permOrder[a.permission as 'full' | 'write' | 'read'] : 0;
              if (currStatus > prevStatus || (currStatus === prevStatus && currPerm > prevPerm)) {
                dedupedMap.set(key, a);
              }
            }
          }
          const mergedAssignees = Array.from(dedupedMap.values());

          await fetch(`/api/appointments/${apptId}/assignees`, { method: "DELETE" });

          const uniqueAssigneesMap = new Map();
          for (const a of mergedAssignees) {
            const key = `${a.user || ''}|${a.invited_email || ''}`;
            if (!uniqueAssigneesMap.has(key)) {
              uniqueAssigneesMap.set(key, a);
            }
          }
          const uniqueAssignees = Array.from(uniqueAssigneesMap.values());
          if (uniqueAssignees.length > 0) {
            await fetch(`/api/appointments/${apptId}/assignees`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                assignees: uniqueAssignees.map((a: AppointmentAssignee) => ({
                  appointment: apptId,
                  user: a.user,
                  user_type: a.user_type,
                  invited_email: a.invited_email || null,
                  status: typeof a.status === "string" ? a.status : "pending",
                  permission: typeof a.permission === "string" ? a.permission : "read",
                })),
              }),
            });
          }
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
          status: status as "pending" | "done" | "alert",
          treating_physician: treatingPhysicianId || user?.id,
          // New clinical fields — appointment_type_id drives is_telehealth derivation server-side
          ...(slotPickTypeId ? { appointment_type_id: slotPickTypeId } : {}),
          ...(chiefComplaint.trim() ? { chief_complaint: chiefComplaint.trim() } : {}),
        } as Partial<Appointment> & { treating_physician?: string; appointment_type_id?: string; chief_complaint?: string });
        apptId = createResult.appointment.id;

        if (assignees.length > 0) {
          const dedupedMap = new Map();
          for (const a of assignees) {
            const key = `${a.user || ''}|${a.invited_email || ''}`;
            if (!dedupedMap.has(key)) {
              dedupedMap.set(key, a);
            } else {
              const prev = dedupedMap.get(key);
              const statusOrder: Record<'accepted' | 'pending', number> = { accepted: 2, pending: 1 };
              const permOrder: Record<'full' | 'write' | 'read', number> = { full: 3, write: 2, read: 1 };
              const prevStatus = typeof prev?.status === 'string' && (prev.status === 'accepted' || prev.status === 'pending') ? statusOrder[prev.status as 'accepted' | 'pending'] : 0;
              const currStatus = typeof a.status === 'string' && (a.status === 'accepted' || a.status === 'pending') ? statusOrder[a.status as 'accepted' | 'pending'] : 0;
              const prevPerm = typeof prev?.permission === 'string' && (prev.permission === 'full' || prev.permission === 'write' || prev.permission === 'read') ? permOrder[prev.permission as 'full' | 'write' | 'read'] : 0;
              const currPerm = typeof a.permission === 'string' && (a.permission === 'full' || a.permission === 'write' || a.permission === 'read') ? permOrder[a.permission as 'full' | 'write' | 'read'] : 0;
              if (currStatus > prevStatus || (currStatus === prevStatus && currPerm > prevPerm)) {
                dedupedMap.set(key, a);
              }
            }
          }
          const uniqueAssignees = Array.from(dedupedMap.values());
          await fetch(`/api/appointments/${apptId}/assignees`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              assignees: uniqueAssignees.map((a: AppointmentAssignee) => ({
                appointment: apptId,
                user: a.user,
                user_type: a.user_type,
                invited_email: a.invited_email || null,
                status: typeof a.status === "string" ? a.status : "pending",
                permission: typeof a.permission === "string" ? a.permission : "read",
              })),
            }),
          });
        }
      }

      if (apptId) {
        await invalidateAssigneesActivitiesAppointment(queryClient, apptId);
      }

      setSuccess(true);
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

  const handleAddAssignee = (userId: string) => {
    if (!userId) return;
    if (assignees.some((a) => a.user === userId)) return;
    // Patients are not users — store null for user FK, use user_type to identify the assignee kind
    setAssignees((prev) => [
      ...prev,
      {
        id: "temp-" + Date.now(),
        created_at: new Date().toISOString(),
        appointment: appointment?.id || "",
        user: null,
        user_type: "patients",
      },
    ]);
  };
  const handleRemoveAssignee = (userId: string | null, assigneeId?: string) => {
    if (assigneeId) {
      setAssignees((prev) => prev.filter((a) => a.id !== assigneeId));
    } else if (userId) {
      setAssignees((prev) => prev.filter((a) => a.user !== userId));
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
        aria-describedby={undefined}
        className="flex h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] flex-col gap-0 overflow-hidden rounded-[28px] border border-sky-400/30 bg-white p-0 shadow-[0_30px_80px_rgba(2,132,199,0.35)] backdrop-blur-sm"
      >
        <div className="shrink-0 bg-white pt-6 text-gray-700">
          <div className="px-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 text-sky-700">
                <Calendar className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-left text-xl font-semibold text-gray-700">
                  {isEditMode
                    ? toTitleCaseLabel("Edit Appointment")
                    : toTitleCaseLabel("Create New Appointment")}
                </DialogTitle>
                <DialogDescription
                  id="appointment-dialog-desc"
                  className="text-left text-sm text-muted-foreground"
                >
                  {isEditMode
                    ? toTitleCaseLabel(
                        "Update scheduling on the left; manage sharing and activity notes on the right."
                      )
                    : toTitleCaseLabel(
                        "Set the client and time on the left; optionally share with another patient on the right."
                      )}
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
        {success && (
          <div className="shrink-0 px-6 pt-2 text-xs text-green-600">
            {toTitleCaseLabel("Successfully saved!")}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 text-gray-700">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            <section className="min-w-0">
              <h3 className="mb-2 text-sm font-semibold tracking-tight text-gray-700">
                {toTitleCaseLabel("Core scheduling")}
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
                showTreatingPhysicianPicker={Boolean(user) && (user?.role ?? "") !== "patient"}
                doctors={doctors}
                treatingPhysicianId={treatingPhysicianId}
                setTreatingPhysicianId={setTreatingPhysicianId}
                /**
                 * Cal-style slot engine (`/api/availability/slots`) keys busy intervals by `owner_id`
                 * — staff creates on the signed-in calendar (`POST /api/appointments`), so this must
                 * match the session user, not the optional treating physician row.
                 */
                availabilityDoctorId={user?.id ?? ""}
                slotPickDateStr={slotPickDateStr}
                setSlotPickDateStr={setSlotPickDateStr}
                slotPickTypeId={slotPickTypeId}
                setSlotPickTypeId={setSlotPickTypeId}
                chiefComplaint={chiefComplaint}
                setChiefComplaint={setChiefComplaint}
              />
            </section>
            <section className="flex min-w-0 flex-col gap-6 lg:border-l lg:border-sky-200/70 lg:pl-8">
              <div>
                <h3 className="mb-2 text-sm font-semibold tracking-tight text-gray-700">Access &amp; Sharing</h3>
                <AppointmentDialogAssigneesSection
                  assignees={assignees}
                  patients={patients}
                  selectedPatientId={patientId}
                  onAddAssignee={handleAddAssignee}
                  onRemoveAssignee={handleRemoveAssignee}
                />
              </div>
            </section>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-sky-200/60 bg-sky-50/40 px-6 py-3">
          <Button
            type="button"
            variant="ghost"
            className={cn(
              skyGlassBackButtonClass,
              "cursor-pointer rounded-full disabled:pointer-events-none disabled:opacity-50"
            )}
            onClick={() => handleDialogOpenChange(false)}
            disabled={loading || uploading}
          >
            <X className="size-4 shrink-0" aria-hidden />
            {toTitleCaseLabel("Cancel")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleSave}
            disabled={loading || uploading || !canSave}
            className={cn(
              skyGlassPrimaryButtonClass,
              "cursor-pointer rounded-full disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                {toTitleCaseLabel("Saving…")}
              </>
            ) : (
              <>
                <CalendarCheck className="size-4 shrink-0" aria-hidden />
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
