"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Category,
  Patient,
  Appointment,
  AppointmentAssignee,
  Activity,
  Relative,
} from "@/types/types";
import { usePatients } from "@/hooks/usePatients";
import { useCategories } from "@/hooks/useCategories";
import { useRelatives } from "@/hooks/useRelatives";
import { useAppointments, FullAppointment } from "@/hooks/useAppointments";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
// Using Vercel Blob for file storage (better for demo projects on Vercel)
import { uploadFileViaAPI, deleteFile } from "@/lib/vercelBlob";

type Props = {
  trigger?: React.ReactNode;
  appointment?: FullAppointment;
  onSuccess?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

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
  const { relatives = [] } = useRelatives();
  const { user } = useAuth();
  const { createAppointmentAsync, updateAppointmentAsync } = useAppointments();

  const [assignees, setAssignees] = useState<AppointmentAssignee[]>([]); // type-safe
  const [activityType, setActivityType] = useState("");
  const [activityContent, setActivityContent] = useState("");
  const [activityList, setActivityList] = useState<Activity[]>([]);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [patientId, setPatientId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [attachements, setattachements] = useState(""); // comma-separated string
  const [status, setStatus] = useState("pending");
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileProgress, setFileProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setattachements((appointment.attachements || []).join(", "));
      setStatus(appointment.status || "pending");
      setOpen(true);

      if (appointment.appointment_assignee) {
        setAssignees(appointment.appointment_assignee);
      } else {
        setAssignees([]);
      }

      if (appointment.activities) {
        setActivityList(appointment.activities);
      } else {
        setActivityList([]);
      }
    } else {
      setAssignees([]);
      setActivityList([]);
    }
  }, [appointment]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      if (!isEditMode && (!title || !start || !end || !patientId || !categoryId)) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      const safeStart = localInputValueToUTC(start);
      const safeEnd = localInputValueToUTC(end);
      const attachementArray = attachements.split(",").map((s) => s.trim()).filter(Boolean);
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
        if (attachements !== (appointment?.attachements || []).join(", ")) updates.attachements = attachementArray;
        if (status !== appointment?.status) updates.status = status as "pending" | "done" | "alert";
        updates.updated_at = new Date().toISOString();

        if (Object.keys(updates).length > 0) {
          await updateAppointmentAsync({ id: apptId, ...updates });
        }

        const isOwner = appointment?.user_id === user?.id;
        if (isOwner) {
          const existingAssigneesRes = await fetch(`/api/appointments/${apptId}/assignees`);
          const existingAssigneesData = await existingAssigneesRes.json();
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

          await Promise.all([
            fetch(`/api/appointments/${apptId}/assignees`, { method: "DELETE" }),
            fetch(`/api/appointments/${apptId}/activities`, { method: "DELETE" }),
          ]);

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
                assignees: uniqueAssignees.map((a: any) => ({
                  appointment: apptId,
                  user: a.user,
                  user_type: a.user_type,
                  invited_email: a.invited_email || null,
                  status: typeof a.status === 'string' ? a.status : "pending",
                  permission: typeof a.permission === 'string' ? a.permission : "read",
                })),
              }),
            });
          }
        }
      } else {
        const newAppt = await createAppointmentAsync({
          title,
          notes,
          start: safeStart,
          end: safeEnd,
          patient: patientId,
          category: categoryId,
          location,
          attachements: attachementArray,
          status: status as "pending" | "done" | "alert",
          user_id: user?.id,
        });

        apptId = newAppt.id;

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
              assignees: uniqueAssignees.map((a: any) => ({
                appointment: apptId,
                user: a.user,
                user_type: a.user_type,
                invited_email: a.invited_email || null,
                status: typeof a.status === 'string' ? a.status : "pending",
                permission: typeof a.permission === 'string' ? a.permission : "read",
              })),
            }),
          });
        }
      }

      if (activityList.length > 0 && apptId) {
        const activitiesToInsert = activityList.map((act) => ({
          appointment: apptId,
          type: act.type,
          content: act.content,
          created_by: act.created_by || user?.id,
        }));
        await fetch(`/api/appointments/${apptId}/activities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activities: activitiesToInsert }),
        });
      }

      setSuccess(true);
      setOpen(false);
      onSuccess?.();
    } catch (e: unknown) {
      if (typeof e === "object" && e && "message" in e) {
        toast.error((e as { message: string }).message || "Unknown error");
        setError((e as { message: string }).message || "Unknown error");
      } else {
        toast.error("Unknown error");
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setError(null);
    const files = Array.from(e.target.files);
    const uploadedFileNames: string[] = [];
    for (const file of files) {
      setFileProgress((prev) => ({ ...prev, [file.name]: 0 }));
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
      } catch (error) {
        setError(`Error uploading: ${file.name}`);
        setFileProgress((prev) => ({ ...prev, [file.name]: 0 }));
        continue;
      }
    }
    setUploadedFiles((prev) => [...prev, ...uploadedFileNames]);
    setattachements((prev: string) =>
      prev
        ? prev + ", " + uploadedFileNames.join(", ")
        : uploadedFileNames.join(", ")
    );
    setUploading(false);
  };

  const handleRemoveUploadedFile = async (publicId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f !== publicId));
    setattachements((prev) =>
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
    } catch (error) {
      console.error("Error deleting file from Vercel Blob:", error);
      // Continue even if deletion fails - file is removed from UI
    }
  };

  // Helper: get current user (if available)
  const getCurrentUserId = async (): Promise<string> => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        return data?.user?.id || "";
      }
      return "";
    } catch {
      return "";
    }
  };

  const handleAddAssignee = (userId: string) => {
    if (!userId) return;
    if (assignees.some((a) => a.user === userId)) return;
    const user_type = patients.find((p) => p.id === userId)
      ? "patients"
      : "relatives";
    // Important: When user_type is "patients" or "relatives", the "user" field should be null
    // because the appointment_assignee.user field has a foreign key to users.id
    // Patients and relatives are not users, so we store null and use user_type to identify them
    setAssignees((prev) => [
      ...prev,
      {
        id: "temp-" + Date.now(),
        created_at: new Date().toISOString(),
        appointment: appointment?.id || "",
        user: null, // Always null for patients/relatives (they're not users)
        user_type,
        // Store the patient/relative ID in a way that can be retrieved later if needed
        // Note: The current schema doesn't have a separate field for patient/relative ID
        // This might need schema changes if you need to track which specific patient/relative
      },
    ]);
  };
  const handleRemoveAssignee = (userId: string | null, assigneeId?: string) => {
    if (assigneeId) {
      // Remove by assignee ID (more reliable for patients/relatives)
      setAssignees((prev) => prev.filter((a) => a.id !== assigneeId));
    } else if (userId) {
      // Remove by user ID (for backward compatibility)
      setAssignees((prev) => prev.filter((a) => a.user !== userId));
    }
  };
  const handleAddActivity = async () => {
    if (!activityType || !activityContent) return;
    // Prevent duplicate activities (same type/content)
    if (
      activityList.some(
        (a) => a.type === activityType && a.content === activityContent
      )
    )
      return;
    const created_by = await getCurrentUserId();
    setActivityList((prev) => [
      ...prev,
      {
        id: "temp-" + Date.now(),
        created_at: new Date().toISOString(),
        created_by,
        appointment: appointment?.id || "",
        type: activityType,
        content: activityContent,
      },
    ]);
    setActivityType("");
    setActivityContent("");
  };
  const handleRemoveActivity = (id: string) => {
    setActivityList((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange ? onOpenChange : setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent aria-describedby="">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit appointment" : "Create new appointment"}
          </DialogTitle>
        </DialogHeader>
        {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
        {success && (
          <div className="text-green-600 text-xs mb-2">
            Successfully saved!
          </div>
        )}
        <Tabs defaultValue="general" className="w-full pt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="cursor-pointer">General</TabsTrigger>
            <TabsTrigger value="assignees" className="cursor-pointer">Assignments</TabsTrigger>
            <TabsTrigger value="activities" className="cursor-pointer">Activities</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 py-2 mt-0">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start</Label>
                <Input
                  type="datetime-local"
                  id="start"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End</Label>
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
                  min={start || undefined}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger className="cursor-pointer hover:bg-gray-100 transition-colors">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.firstname} {p.lastname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="cursor-pointer hover:bg-gray-100 transition-colors">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachements">Attachments (comma-separated)</Label>
              <Input
                id="attachements"
                value={attachements}
                onChange={(e) => setattachements(e.target.value)}
                className="cursor-pointer"
              />
              <Input
                id="appointment-file-upload"
                type="file"
                multiple
                ref={fileInputRef}
                aria-label="Upload attachment files"
                title="Upload attachment files"
                onChange={handleFileChange}
                disabled={uploading}
                className="cursor-pointer"
              />
              {uploading && (
                <div className="text-xs text-blue-600">Uploading...</div>
              )}
              {Object.keys(fileProgress).length > 0 && (
                <div className="text-xs text-blue-600 mt-1">
                  {Object.entries(fileProgress).map(([name, prog]) => (
                    <div key={name}>
                      {name}: {prog}%
                    </div>
                  ))}
                </div>
              )}
              {uploadedFiles.length > 0 && (
                <div className="text-xs text-green-600 mt-1">
                  Uploaded:{" "}
                  {uploadedFiles.map((f) => (
                    <span key={f} className="inline-flex items-center mr-2">
                      <a
                        href={f}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline cursor-pointer hover:text-blue-700"
                      >
                        File
                      </a>
                      <button
                        type="button"
                        className="ml-1 text-red-500 cursor-pointer hover:bg-red-100 rounded"
                        onClick={() => handleRemoveUploadedFile(f)}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="cursor-pointer hover:bg-gray-100 transition-colors">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Open</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </TabsContent>

          <TabsContent value="assignees" className="space-y-4 py-2 mt-0">
            <div className="space-y-2">
              <Label>Assign (Patients/Relatives)</Label>
              <Select onValueChange={handleAddAssignee}>
                <SelectTrigger className="cursor-pointer hover:bg-gray-100 transition-colors">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      Patient: {p.firstname} {p.lastname}
                    </SelectItem>
                  ))}
                  {relatives.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      Relative: {r.firstname} {r.lastname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-1">
                {assignees.map((a) => {
                  const p = patients.find((x) => x.id === a.user);
                  const r = relatives.find((x) => x.id === a.user);
                  return (
                    <span
                      key={a.user}
                      className="bg-gray-200 px-2 py-1 rounded text-xs flex items-center gap-1"
                    >
                      {p
                        ? `Patient: ${p.firstname} ${p.lastname}`
                        : r
                          ? `Relative: ${r.firstname} ${r.lastname}`
                          : a.user}
                      <span className="ml-1 text-gray-400">[{a.user_type}]</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAssignee(a.user, a.id)}
                        className="ml-1 text-red-500 cursor-pointer hover:bg-red-100 rounded"
                      >
                        &times;
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4 py-2 mt-0">
            <div className="space-y-2">
              <Label>Add activity</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type (eg. Phone, Visit)"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="cursor-pointer"
                />
                <Input
                  placeholder="Content"
                  value={activityContent}
                  onChange={(e) => setActivityContent(e.target.value)}
                  className="cursor-pointer"
                />
                <Button
                  type="button"
                  onClick={handleAddActivity}
                  disabled={loading}
                  className="cursor-pointer transition-colors"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-col gap-1 mt-1">
                {activityList.map((a) => (
                  <span
                    key={a.id}
                    className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-1"
                  >
                    {a.type}: {a.content}
                    <button
                      type="button"
                      onClick={() => handleRemoveActivity(a.id)}
                      className="ml-1 text-red-500 cursor-pointer hover:bg-red-100 rounded"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <Button
          onClick={handleSave}
          disabled={loading || uploading}
          className="cursor-pointer transition-colors"
        >
          {loading
            ? "Save..."
            : isEditMode
              ? "Save changes"
              : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// Helper: Convert UTC ISO string to local datetime-local input value (YYYY-MM-DDTHH:mm)
function utcToLocalInputValue(utcString: string) {
  if (!utcString) return "";
  const date = new Date(utcString);
  // Get local time in YYYY-MM-DDTHH:mm
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}
// Helper: Convert local datetime-local input value to UTC ISO string
function localInputValueToUTC(localValue: string) {
  if (!localValue) return "";
  // localValue is YYYY-MM-DDTHH:mm
  const date = new Date(localValue);
  return date.toISOString();
}
