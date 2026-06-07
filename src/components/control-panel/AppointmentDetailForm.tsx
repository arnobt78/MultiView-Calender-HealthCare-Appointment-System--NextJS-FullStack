"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppointments } from "@/hooks/useAppointments";
import { useCategories } from "@/hooks/useCategories";
import { usePatients } from "@/hooks/usePatients";
import VideoCall from "@/components/calendar/VideoCall";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import {
  buildAppointmentDeleteConfirmSubtitle,
  DELETE_APPOINTMENT_CONFIRM_TITLE,
} from "@/lib/confirm-delete-dialog-copy";
import type { Appointment } from "@/types/types";
import {
  isCategoryActive,
  isPatientActive,
  partitionForBookingSelect,
  sortCategoriesForBookingSelect,
  sortPatientsForBookingSelect,
} from "@/lib/entity-active-status";
import { ActiveInactiveSelectSections } from "@/components/shared/select/ActiveInactiveSelectSections";

interface AppointmentDetailFormProps {
  appointment: Appointment;
}

export function AppointmentDetailForm({ appointment }: AppointmentDetailFormProps) {
  const router = useRouter();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { updateAppointment, isUpdating, deleteAppointment, isDeleting } = useAppointments();
  const { categories } = useCategories();
  const { patients } = usePatients();

  const toLocal = (iso: string) => iso ? iso.slice(0, 16) : "";

  const [form, setForm] = useState({
    title: appointment.title ?? "",
    start: toLocal(appointment.start),
    end: toLocal(appointment.end),
    location: appointment.location ?? "",
    notes: appointment.notes ?? "",
    status: appointment.status ?? "pending",
    category: appointment.category ?? "",
    patient: appointment.patient ?? "",
  });

  const patientSelectPartition = useMemo(
    () =>
      partitionForBookingSelect({
        items: patients,
        isActive: isPatientActive,
        getId: (p) => p.id,
        currentId: form.patient,
        sortSelectable: sortPatientsForBookingSelect,
      }),
    [patients, form.patient]
  );

  const categorySelectPartition = useMemo(
    () =>
      partitionForBookingSelect({
        items: categories,
        isActive: isCategoryActive,
        getId: (c) => c.id,
        currentId: form.category,
        sortSelectable: sortCategoriesForBookingSelect,
      }),
    [categories, form.category]
  );

  const handleSave = () => {
    /*
     * The "Schema: appointments" block above this form is rendered by a Server Component
     * (`app/control-panel/appointments/[id]/page.tsx`), so React Query cache invalidation
     * alone cannot repaint that SSR snapshot in-place.
     *
     * `router.refresh()` revalidates the current route tree after PATCH success, which keeps
     * the user on the same page while updating the server-rendered schema fields immediately.
     */
    updateAppointment({
      id: appointment.id,
      title: form.title,
      start: form.start,
      end: form.end,
      location: form.location,
      notes: form.notes,
      status: form.status as "pending" | "done" | "alert",
      category: form.category || undefined,
      patient: form.patient || undefined,
    }, {
      onSuccess: () => {
        router.refresh();
      },
    });
  };

  const handleDelete = () => {
    deleteAppointment(appointment.id, {
      onSuccess: () => router.push("/control-panel"),
    });
  };

  return (
    <div className="space-y-2 pt-4 border-t">
      <h3 className="font-semibold text-sm">Edit Appointment</h3>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Appointment title"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="apptdetail-start">Start</Label>
            <Input
              id="apptdetail-start"
              type="datetime-local"
              title="Appointment start date and time"
              value={form.start}
              onChange={(e) => setForm((p) => ({ ...p, start: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apptdetail-end">End</Label>
            <Input
              id="apptdetail-end"
              type="datetime-local"
              title="Appointment end date and time"
              value={form.end}
              onChange={(e) => setForm((p) => ({ ...p, end: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            placeholder="Location or video link"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Patient</Label>
            <Select value={form.patient} onValueChange={(v) => setForm((p) => ({ ...p, patient: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                <ActiveInactiveSelectSections
                  selectable={patientSelectPartition.selectable}
                  inactiveDisplay={patientSelectPartition.inactiveDisplay}
                  getItemKey={(p) => p.id}
                  getTextValue={(p) => `${p.firstname} ${p.lastname}`}
                  renderSelectableItem={(p) => (
                    <span>
                      {p.firstname} {p.lastname}
                    </span>
                  )}
                  renderInactiveItem={(p) => (
                    <span>
                      {p.firstname} {p.lastname}
                    </span>
                  )}
                />
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <ActiveInactiveSelectSections
                  selectable={categorySelectPartition.selectable}
                  inactiveDisplay={categorySelectPartition.inactiveDisplay}
                  getItemKey={(c) => c.id}
                  getTextValue={(c) => c.label}
                  renderSelectableItem={(c) => <span>{c.label}</span>}
                  renderInactiveItem={(c) => <span>{c.label}</span>}
                />
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Notes…"
            rows={3}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          onClick={handleSave}
          disabled={isUpdating || !form.title.trim()}
          className="flex-1 sm:flex-none"
        >
          {isUpdating ? "Saving…" : "Save changes"}
        </Button>
        <VideoCall appointmentId={appointment.id} appointmentTitle={appointment.title ?? "Video Consultation"} />
        <Button
          variant="outline"
          type="button"
          onClick={() => window.print()}
          className="gap-2"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button
          variant="destructive"
          type="button"
          disabled={isDeleting}
          onClick={() => setDeleteConfirmOpen(true)}
        >
          {isDeleting ? "Deleting…" : "Delete"}
        </Button>
        <ConfirmActionDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          variant="destructive"
          title={DELETE_APPOINTMENT_CONFIRM_TITLE}
          subtitle={buildAppointmentDeleteConfirmSubtitle(appointment.title ?? "", "detail")}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          confirmDisabled={isDeleting}
          onConfirm={() => {
            handleDelete();
            setDeleteConfirmOpen(false);
          }}
        />
      </div>
    </div>
  );
}
