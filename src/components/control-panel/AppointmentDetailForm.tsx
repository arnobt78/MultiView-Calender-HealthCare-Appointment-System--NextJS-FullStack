"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppointments } from "@/hooks/useAppointments";
import { useCategories } from "@/hooks/useCategories";
import { usePatients } from "@/hooks/usePatients";
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
import type { Appointment } from "@/types/types";
import {
  isCategoryActive,
  isPatientActive,
  partitionForBookingSelect,
  sortCategoriesForBookingSelect,
  sortPatientsForBookingSelect,
} from "@/lib/entity-active-status";
import { ActiveInactiveSelectSections } from "@/components/shared/select/ActiveInactiveSelectSections";
import { APPOINTMENT_DETAIL_EDIT_FORM_ID } from "@/lib/appointment-detail-form-id";

interface AppointmentDetailFormProps {
  appointment: Appointment;
}

/** Inline edit fields — footer `AppointmentDetailActionBar` owns Save/Video/Print/Delete. */
export function AppointmentDetailForm({ appointment }: AppointmentDetailFormProps) {
  const router = useRouter();
  const { updateAppointment } = useAppointments();
  const { categories } = useCategories();
  const { patients } = usePatients();

  const toLocal = (iso: string) => (iso ? iso.slice(0, 16) : "");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    updateAppointment(
      {
        id: appointment.id,
        title: form.title,
        start: form.start,
        end: form.end,
        location: form.location,
        notes: form.notes,
        status: form.status as "pending" | "done" | "alert",
        category: form.category || undefined,
        patient: form.patient || undefined,
      },
      {
        onSuccess: () => {
          router.refresh();
        },
      }
    );
  };

  return (
    <form
      id={APPOINTMENT_DETAIL_EDIT_FORM_ID}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="Appointment title"
          required
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
    </form>
  );
}
