"use client";

/**
 * PatientPortalPage
 *
 * Redesigned with:
 * - Glassmorphic cards for My Profile, Summary, and Appointment History
 * - Full patient data display (avatar/robohash, age, primary doctor, referral,
 *   allergies, clinical notes, invoices) using schema fields
 * - 4-step cal.com-style booking wizard:
 *     Step 1: Doctor + Appointment Type
 *     Step 2: Date picker
 *     Step 3: Available time slots (via /api/availability/slots)
 *     Step 4: Title + Notes → Submit
 * - Pill-style All / Upcoming / Past toggle with icons
 * - Inline skeleton pattern: structural chrome always mounted, only data values pulse
 */

import { useState, useEffect, useLayoutEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addMinutes, differenceInYears, format, isPast, isFuture, isToday } from "date-fns";
import type { PortalPrefetchData } from "@/lib/server-prefetch";
import { apiClient, handleApiError } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Cake,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  GitBranch,
  Hash,
  History,
  Layers,
  List,
  MapPin,
  Receipt,
  ShieldCheck,
  ShieldOff,
  Stethoscope,
  Timer,
  User,
  CalendarX,
} from "lucide-react";
import type { Patient, Appointment } from "@/types/types";
import { notify } from "@/lib/notify";
import { useUsers } from "@/hooks/useUsers";
import { useAvailabilitySlots } from "@/hooks/useAvailabilitySlots";
import { queryKeys } from "@/lib/query-keys";
import { invalidateAfterAppointmentMutation } from "@/lib/query-client";
import { getPatientCareLevelLabel } from "@/lib/patient-care-level";
import type { PatientClinicalProfile } from "@/types/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Serialized invoice row from /api/invoices */
interface InvoiceRow {
  id: string;
  created_at: string;
  appointment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  description: string | null;
}

interface AppointmentType {
  id: string;
  name: string;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  slot_interval_minutes: number;
  minimum_notice_minutes: number;
  user_id: string | null;
}

interface PortalData {
  appointments: (Appointment & {
    category?: { label: string; color: string | null };
    owner?: { display_name: string | null; email: string };
  })[];
  patient: (Patient & {
    primary_doctor?: { display_name: string | null; email: string } | null;
  }) | null;
  userImage?: string | null;
  message?: string;
}

// ---------------------------------------------------------------------------
// Status meta
// ---------------------------------------------------------------------------

const STATUS_META: Record<string, { icon: React.ReactNode; cls: string; label: string; dotCls: string }> = {
  done: { icon: <CalendarCheck className="h-3.5 w-3.5" />, cls: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Done", dotCls: "bg-emerald-400" },
  pending: { icon: <CalendarClock className="h-3.5 w-3.5" />, cls: "bg-amber-100 text-amber-700 border-amber-200", label: "Pending", dotCls: "bg-amber-400" },
  alert: { icon: <CalendarX className="h-3.5 w-3.5" />, cls: "bg-red-100 text-red-700 border-red-200", label: "Alert", dotCls: "bg-red-400" },
};

// ---------------------------------------------------------------------------
// BOOKING WIZARD — 4-step cal.com-style dialog
// ---------------------------------------------------------------------------

/**
 * 4-step booking wizard:
 *   1. Doctor + Appointment Type
 *   2. Date selection (native date input)
 *   3. Available time slots fetched from /api/availability/slots
 *   4. Title + Notes + submit
 */
interface BookAppointmentDialogProps {
  /** Pre-select a doctor when opened from the services page */
  preselectedDoctorId?: string;
  /** Custom trigger element — defaults to the sky-blue Request button */
  trigger?: React.ReactNode;
}

export function BookAppointmentDialog({ preselectedDoctorId, trigger }: BookAppointmentDialogProps = {}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Step 1 state — preselect doctor if provided from services page
  const [doctorId, setDoctorId] = useState(preselectedDoctorId ?? "");
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(null);
  // For "flexible" bookings (no appointment types defined for the doctor)
  const [flexDuration, setFlexDuration] = useState(30);

  // Step 2 state
  const [dateStr, setDateStr] = useState(""); // YYYY-MM-DD

  // Step 3 state
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Step 4 state
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  // Doctors list
  const { data: usersData } = useUsers({ role: "doctor" });
  const doctors = usersData?.users ?? [];

  // Appointment types for selected doctor
  const { data: typesData, isLoading: typesLoading } = useQuery({
    queryKey: queryKeys.appointmentTypes.byDoctor(doctorId),
    queryFn: () => apiClient<{ types: AppointmentType[] }>(`/api/appointment-types?doctorId=${doctorId}`),
    enabled: Boolean(doctorId),
    staleTime: 5 * 60 * 1000,
  });
  const types = typesData?.types ?? [];
  const isFlexible = !typesLoading && types.length === 0 && Boolean(doctorId);

  // Effective type id: if flexible use a sentinel, otherwise use the selected type's id
  const effectiveTypeId = selectedType?.id ?? "";

  // Available slots for step 3
  const { data: slotsData, isLoading: slotsLoading } = useAvailabilitySlots(
    step === 3 && !isFlexible ? doctorId : null,
    step === 3 && !isFlexible ? dateStr : null,
    step === 3 && !isFlexible ? effectiveTypeId : null,
  );
  const slots: string[] = slotsData?.slots ?? [];

  // Duration to use
  const duration = isFlexible ? flexDuration : (selectedType?.duration_minutes ?? 30);

  function resetAll() {
    setStep(1);
    setDoctorId("");
    setSelectedType(null);
    setFlexDuration(30);
    setDateStr("");
    setSelectedSlot(null);
    setTitle("");
    setNotes("");
  }

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (!v) resetAll();
  }

  // When advancing to step 4, pre-fill title with the appointment type name if not already set.
  // Using a callback inside the step transition (handleNext) keeps this out of effects.
  function advanceToStep4() {
    if (selectedType && !title) setTitle(selectedType.name);
    setStep(4);
  }

  /** Portal booking payload — typed to match POST /api/patient-portal body */
  interface BookingPayload {
    title: string;
    start: string;
    end: string;
    doctorId: string;
    notes?: string;
  }

  const bookMutation = useMutation({
    mutationFn: (body: BookingPayload) =>
      apiClient("/api/patient-portal", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: async () => {
      notify.crud({
        action: "created",
        entity: "Appointment request",
        detail: "Your appointment request was submitted successfully.",
      });
      // Invalidate portal history + full appointment pipeline (activities, notifications,
      // availability slots, invoices, overview, insights) so all views reflect the new booking.
      await queryClient.invalidateQueries({ queryKey: queryKeys.patientPortal.all });
      await invalidateAfterAppointmentMutation(queryClient);
      handleOpenChange(false);
    },
    onError: (e) => handleApiError(e, "Failed to book appointment"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!doctorId || !selectedSlot || !title) return;
    const startDt = new Date(selectedSlot);
    const endDt = addMinutes(startDt, duration);
    bookMutation.mutate({
      title,
      start: startDt.toISOString(),
      end: endDt.toISOString(),
      doctorId,
      ...(notes ? { notes } : {}),
    });
  }

  const selectedDoctor = doctors.find((d) => d.id === doctorId);
  const today = new Date().toISOString().slice(0, 10);

  // Progress dots
  const steps = ["Doctor & Type", "Date", "Time Slot", "Details"];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          /* Default sky-blue glassmorphic glow button */
          <Button className="gap-2 bg-sky-600 hover:bg-sky-700 text-white shadow-[0_0_24px_rgba(2,132,199,0.4)] hover:shadow-[0_0_36px_rgba(2,132,199,0.65)] transition-all duration-300 px-5">
            <CalendarPlus className="h-4 w-4" />
            Request / Book Appointment
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-sky-600" />
            Request New Appointment
          </DialogTitle>
        </DialogHeader>

        {/* Step progress indicator */}
        <div className="flex items-center justify-center gap-2 pb-2">
          {steps.map((label, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <div key={n} className="flex items-center gap-1">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${done
                    ? "bg-sky-600 text-white"
                    : active
                      ? "bg-sky-100 text-sky-700 ring-2 ring-sky-400"
                      : "bg-muted text-muted-foreground"
                    }`}
                  title={label}
                >
                  {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 w-6 rounded ${done ? "bg-sky-600" : "bg-muted"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Doctor & Type ─────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4 text-sky-600" />
                Preferred Doctor
              </Label>
              <Select value={doctorId} onValueChange={(v) => { setDoctorId(v); setSelectedType(null); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a doctor…" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.display_name ?? d.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {doctorId && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Timer className="h-4 w-4 text-sky-600" />
                  Appointment Type
                </Label>
                {typesLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                  </div>
                ) : isFlexible ? (
                  /* No types defined — offer duration picker */
                  <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3 space-y-2">
                    <p className="text-sm text-sky-700 font-medium">Flexible Booking</p>
                    <p className="text-xs text-muted-foreground">This doctor hasn&apos;t set fixed appointment types. Choose a duration.</p>
                    <div className="flex gap-2 flex-wrap">
                      {[15, 30, 45, 60].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setFlexDuration(d)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${flexDuration === d
                            ? "bg-sky-600 text-white border-sky-600"
                            : "border-sky-200 text-sky-700 hover:bg-sky-50"
                            }`}
                        >
                          {d} min
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Defined appointment types — show as cards */
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {types.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedType(t)}
                        className={`w-full text-left rounded-xl border p-3 transition-all ${selectedType?.id === t.id
                          ? "border-sky-500 bg-sky-50 ring-1 ring-sky-400"
                          : "border-border hover:border-sky-300 hover:bg-sky-50/40"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{t.name}</span>
                          <Badge variant="outline" className="text-xs gap-1">
                            <Clock className="h-3 w-3" />
                            {t.duration_minutes} min
                          </Badge>
                        </div>
                        {t.buffer_before_minutes > 0 || t.buffer_after_minutes > 0 ? (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Buffer: {t.buffer_before_minutes}m before · {t.buffer_after_minutes}m after
                          </p>
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button
                disabled={!doctorId || (!isFlexible && !selectedType)}
                onClick={() => setStep(2)}
                className="gap-1.5"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Date ────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-sky-600" />
                Pick a Date
              </Label>
              <Input
                type="date"
                value={dateStr}
                min={today}
                onChange={(e) => { setDateStr(e.target.value); setSelectedSlot(null); }}
                className="text-sm"
              />
              {selectedDoctor && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  Dr. {selectedDoctor.display_name ?? selectedDoctor.email}
                  {selectedType && ` · ${selectedType.name} · ${selectedType.duration_minutes} min`}
                  {isFlexible && ` · ${flexDuration} min`}
                </p>
              )}
            </div>
            <div className="flex justify-between pt-1">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                disabled={!dateStr}
                onClick={() => isFlexible ? advanceToStep4() : setStep(3)}
                className="gap-1.5"
              >
                {isFlexible ? "Continue" : "See Slots"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Time Slot (skipped for flexible bookings) ── */}
        {step === 3 && !isFlexible && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-sky-600" />
                Available Slots — {dateStr ? format(new Date(dateStr + "T12:00:00"), "EEE, dd MMM yyyy") : ""}
              </Label>
              {slotsLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-9 rounded-lg" />)}
                </div>
              ) : slots.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center">
                  <CalendarX className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
                  <p className="text-sm font-medium">No slots available</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different date or doctor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                  {slots.map((slot) => {
                    const slotTime = format(new Date(slot), "HH:mm");
                    const endTime = format(addMinutes(new Date(slot), duration), "HH:mm");
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-lg border px-2 py-2 text-sm font-medium transition-all ${selectedSlot === slot
                          ? "bg-sky-600 text-white border-sky-600"
                          : "border-border hover:border-sky-400 hover:bg-sky-50"
                          }`}
                      >
                        <span className="block">{slotTime}</span>
                        <span className="block text-[10px] opacity-70">→ {endTime}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex justify-between pt-1">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                disabled={!selectedSlot}
                onClick={advanceToStep4}
                className="gap-1.5"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Details & Confirm ───────────────────────── */}
        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Booking summary pill */}
            <div className="rounded-xl bg-sky-50/80 border border-sky-200 p-3 text-sm space-y-1">
              {selectedDoctor && (
                <div className="flex items-center gap-2 text-sky-800">
                  <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                  <span>Dr. {selectedDoctor.display_name ?? selectedDoctor.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sky-800">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {dateStr ? format(new Date(dateStr + "T12:00:00"), "EEEE, dd MMM yyyy") : "—"}
                  {(selectedSlot || isFlexible) && " · "}
                  {selectedSlot && format(new Date(selectedSlot), "HH:mm")}
                  {selectedSlot && ` → ${format(addMinutes(new Date(selectedSlot), duration), "HH:mm")}`}
                  {isFlexible && !selectedSlot && ` · ${flexDuration} min`}
                </span>
              </div>
              {selectedType && (
                <div className="flex items-center gap-2 text-sky-800">
                  <Timer className="h-3.5 w-3.5 shrink-0" />
                  <span>{selectedType.name} · {selectedType.duration_minutes} min</span>
                </div>
              )}
            </div>

            {/* For flexible bookings, show a time input */}
            {isFlexible && (
              <div className="space-y-1.5">
                <Label htmlFor="pp-flex-time" className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-sky-600" /> Preferred Start Time
                </Label>
                <Input
                  id="pp-flex-time"
                  type="time"
                  required
                  onChange={(e) => {
                    if (dateStr && e.target.value) {
                      setSelectedSlot(`${dateStr}T${e.target.value}:00`);
                    }
                  }}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="pp-title" className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-sky-600" /> Reason for Visit
              </Label>
              <Input
                id="pp-title"
                placeholder="Reason for visit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pp-notes" className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-muted-foreground" /> Additional Notes
              </Label>
              <Textarea
                id="pp-notes"
                placeholder="Symptoms, medications, special requests…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-between pt-1">
              <Button type="button" variant="outline" onClick={() => setStep(isFlexible ? 2 : 3)} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                type="submit"
                disabled={bookMutation.isPending || !title || !selectedSlot}
                className="gap-1.5 shadow-[0_0_16px_rgba(2,132,199,0.3)]"
              >
                {bookMutation.isPending ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Submitting…</>
                ) : (
                  <><CalendarCheck className="h-4 w-4" /> Confirm Request</>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// APPOINTMENT TIMELINE
// ---------------------------------------------------------------------------

type ApptRow = PortalData["appointments"][number];

function AppointmentTimeline({ appointments, loading }: { appointments: ApptRow[]; loading?: boolean }) {
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  const filtered = appointments.filter((a) => {
    const d = new Date(a.start);
    if (filter === "upcoming") return isFuture(d) || isToday(d);
    if (filter === "past") return isPast(d) && !isToday(d);
    return true;
  });

  const filterTabs: { key: "all" | "upcoming" | "past"; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All", icon: <List className="h-3.5 w-3.5" /> },
    { key: "upcoming", label: "Upcoming", icon: <CalendarClock className="h-3.5 w-3.5" /> },
    { key: "past", label: "Past", icon: <History className="h-3.5 w-3.5" /> },
  ];

  return (
    /* Purple-glow glassmorphic container */
    <div className="rounded-[24px] border border-violet-100/60 bg-card shadow-[0_8px_32px_rgba(139,92,246,0.15)] overflow-hidden">
      {/* Violet header: title + filtered count badge + pill toggle */}
      <div className="bg-violet-50/60 border-b border-violet-100/60 px-5 py-3 flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-violet-800">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 border border-violet-200 shrink-0">
            <CalendarDays className="h-3.5 w-3.5 text-violet-600" />
          </span>
          Appointment History
          {/* Dynamic filtered count — updates as tab changes */}
          {!loading && (
            <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 font-bold ml-1">
              {filtered.length}
            </Badge>
          )}
        </h3>
        {/* Pill-style filter tabs */}
        <div className="inline-flex bg-muted/60 rounded-full p-1 gap-1 border">
          {filterTabs.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === key
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-5 space-y-4">

      {/* Skeleton while loading */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="relative pl-12">
              <Skeleton className="absolute left-2 top-3 h-5 w-5 rounded-full" />
              <div className="rounded-xl border p-4 space-y-2">
                <div className="flex justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-40 rounded" />
                    <Skeleton className="h-3 w-56 rounded" />
                  </div>
                  <Skeleton className="h-4 w-14 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Stethoscope className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium">No appointments yet</p>
          <p className="text-xs text-muted-foreground mt-1">Your history will appear here once you&apos;ve had appointments.</p>
        </div>
      ) : (
        /* Timeline */
        <div className="relative space-y-3 before:absolute before:inset-y-0 before:left-[18px] before:w-0.5 before:bg-linear-to-b before:from-sky-300/60 before:via-sky-200/40 before:to-transparent">
          {filtered.map((appt) => {
            const status = appt.status ?? "pending";
            const meta = STATUS_META[status] ?? STATUS_META.pending;
            const startDate = new Date(appt.start);
            return (
              <div key={appt.id} className="relative pl-12">
                {/* Timeline dot — colored by status */}
                <div className={`absolute left-2 top-4 h-5 w-5 rounded-full border-2 border-background ${meta.dotCls} flex items-center justify-center shadow-sm z-10 text-white`}>
                  {meta.icon}
                </div>
                <Card className={`transition-all hover:-translate-y-0.5 duration-200 ${
                  status === "done" ? "bg-emerald-50/60 border-emerald-200 hover:shadow-[0_4px_20px_rgba(16,185,129,0.15)]" :
                  status === "alert" ? "bg-red-50/60 border-red-200 hover:shadow-[0_4px_20px_rgba(239,68,68,0.15)]" :
                  "bg-amber-50/60 border-amber-200 hover:shadow-[0_4px_20px_rgba(245,158,11,0.15)]"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1 flex-1 min-w-0">
                        {/* Title + badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm">{appt.title}</h4>
                          <Badge className={`text-xs border ${meta.cls}`}>
                            {meta.icon}
                            <span className="ml-1">{meta.label}</span>
                          </Badge>
                          {appt.category && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <span
                                className="h-2 w-2 rounded-full inline-block shrink-0"
                                style={{ background: appt.category.color ?? "#888" }}
                              />
                              {appt.category.label}
                            </Badge>
                          )}
                        </div>
                        {/* Meta row */}
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(startDate, "dd MMM yyyy, HH:mm")}
                            {" — "}
                            {format(new Date(appt.end), "HH:mm")}
                          </span>
                          {appt.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {appt.location}
                            </span>
                          )}
                          {appt.owner && (
                            <span className="flex items-center gap-1">
                              <Stethoscope className="h-3 w-3" />
                              Dr. {appt.owner.display_name ?? appt.owner.email}
                            </span>
                          )}
                        </div>
                        {appt.notes && (
                          <p className="text-xs text-muted-foreground flex items-start gap-1">
                            <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                            {appt.notes}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground shrink-0 font-medium">
                        {isToday(startDate) ? "Today" : format(startDate, "EEE, dd MMM")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">No {filter} appointments.</p>
          )}
        </div>
      )}
      </div>{/* end inner p-5 */}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------------------------

type PatientPortalPageProps = {
  /**
   * Server-prefetched portal data — seeds queryKeys.patientPortal.all so the
   * profile card and timeline render on first paint without a loading flash.
   */
  initialPortalData?: PortalPrefetchData | null;
};

export default function PatientPortalPage({ initialPortalData }: PatientPortalPageProps = {}) {
  const queryClient = useQueryClient();

  // Seed cache synchronously before first paint to avoid skeleton flash
  useLayoutEffect(() => {
    if (initialPortalData != null) {
      queryClient.setQueryData(queryKeys.patientPortal.all, initialPortalData);
    }
  }, [queryClient, initialPortalData]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.patientPortal.all,
    queryFn: () => apiClient<PortalData>("/api/patient-portal"),
    // SSR seed via setQueryData (above) means first paint is instant; 30 s window
    // prevents redundant re-fetches on rapid tab switches / re-mounts.
    staleTime: 30_000,
  });

  // Mount guard: shows skeleton on SSR first paint, then swaps to real data
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  // Fetch patient's invoices — enabled after mount to avoid SSR mismatch
  const { data: invoicesData, isLoading: invoicesLoading, isError: invoicesError } = useQuery({
    queryKey: queryKeys.invoices.all,
    queryFn: () => apiClient<{ invoices: InvoiceRow[] }>("/api/invoices"),
    enabled: isMounted,
    staleTime: 2 * 60 * 1000,
  });

  const loading = !isMounted || isLoading;

  const patient = data?.patient ?? null;
  const userImage = data?.userImage ?? null;
  const appointments = data?.appointments ?? [];

  const done = appointments.filter((a) => a.status === "done").length;
  const upcoming = appointments.filter((a) => isFuture(new Date(a.start)) || isToday(new Date(a.start))).length;
  const total = appointments.length;

  // Derive age from birth_date
  const age = patient?.birth_date
    ? differenceInYears(new Date(), new Date(patient.birth_date))
    : null;

  // Avatar: user OAuth image > clinical_profile.image_url > dicebear professional avatar
  const clinicalImageUrl = (patient?.clinical_profile as PatientClinicalProfile & { image_url?: string })?.image_url;
  const avatarSrc =
    userImage ??
    clinicalImageUrl ??
    (patient ? `https://api.dicebear.com/9.x/personas/svg?seed=${patient.id}&backgroundColor=b6e3f4` : undefined);

  const clinicalProfile = patient?.clinical_profile as PatientClinicalProfile;
  const invoices = invoicesData?.invoices ?? [];

  if (isError) {
    return (
      <div className="py-8">
        <p className="text-red-500">Error: {(error as Error)?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 py-0 pb-0">
      {/* Page header — always static */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-4 border-b">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 md:h-6 md:w-6 text-sky-600" />
            Patient Portal
          </h1>
          <p className="text-muted-foreground text-sm">
            View your appointment history and request new appointments
          </p>
        </div>
        {/* Glassmorphic Book button */}
        <BookAppointmentDialog />
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Left sidebar: My Profile + Summary */}
        <div className="space-y-4">
          {/* ── My Profile Card — sky glow glass ─────────────── */}
          <Card className="rounded-[24px] border bg-card shadow-[0_8px_32px_rgba(99,102,241,0.13)] overflow-hidden">
            <CardHeader className="pb-2 bg-sky-50/60 border-b border-sky-100/70">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-sky-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 border border-sky-200 shrink-0">
                  <User className="h-3.5 w-3.5 text-sky-600" />
                </span>
                My Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {loading ? (
                /* Skeleton */
                <>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-16 w-16 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                      <Skeleton className="h-3 w-14 rounded" />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2.5">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                        <Skeleton className="h-3.5 flex-1 rounded" />
                      </div>
                    ))}
                  </div>
                </>
              ) : patient ? (
                <>
                  {/* Avatar + name + status badges — all in one row */}
                  <div className="flex items-start gap-3">
                    <Avatar className="h-16 w-16 ring-2 ring-sky-200 shadow-md shrink-0">
                      <AvatarImage src={avatarSrc} alt={`${patient.firstname} ${patient.lastname}`} />
                      <AvatarFallback className="text-sky-700 bg-sky-100 font-bold text-lg">
                        {`${patient.firstname[0]}${patient.lastname[0]}`.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm leading-tight truncate">
                        {patient.firstname} {patient.lastname}
                      </p>
                      {patient.email && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{patient.email}</p>
                      )}
                      {patient.pronoun && (
                        <p className="text-xs text-muted-foreground/70">{patient.pronoun}</p>
                      )}
                      {/* Status + age badges inline below name */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                        {patient.active ? (
                          <Badge className="gap-1 text-[10px] py-0 bg-emerald-100 text-emerald-700 border-emerald-200">
                            <ShieldCheck className="h-2.5 w-2.5" /> Active
                          </Badge>
                        ) : (
                          <Badge className="gap-1 text-[10px] py-0 bg-gray-100 text-gray-600 border-gray-200">
                            <ShieldOff className="h-2.5 w-2.5" /> Inactive
                          </Badge>
                        )}
                        {age !== null && (
                          <Badge variant="outline" className="text-[10px] py-0 gap-1">
                            <Cake className="h-2.5 w-2.5" /> Age {age}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Info fields — icons have rounded bg pill like PatientDetailView */}
                  <dl className="space-y-2.5 text-xs">

                    {/* Patient ID */}
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/60 border shrink-0 mt-0.5">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <dt className="text-muted-foreground">Patient ID</dt>
                        <dd className="font-mono text-[10px] break-all text-muted-foreground">{patient.id}</dd>
                      </div>
                    </div>

                    {/* Birth Date */}
                    {patient.birth_date && (
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-50 border border-orange-100 shrink-0">
                          <Cake className="h-3 w-3 text-orange-500" />
                        </span>
                        <div>
                          <dt className="text-muted-foreground">Birth Date</dt>
                          <dd className="font-medium">{format(new Date(patient.birth_date), "dd MMM yyyy")}</dd>
                        </div>
                      </div>
                    )}

                    {/* Care Tier */}
                    {patient.care_level != null && (
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-50 border border-violet-100 shrink-0">
                          <Layers className="h-3 w-3 text-violet-500" />
                        </span>
                        <div>
                          <dt className="text-muted-foreground">Care Tier (1–10)</dt>
                          <dd className="font-medium">{getPatientCareLevelLabel(patient.care_level)}</dd>
                        </div>
                      </div>
                    )}

                    {/* Primary Doctor — clickable link to doctor detail */}
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-50 border border-sky-100 shrink-0 mt-0.5">
                        <Stethoscope className="h-3 w-3 text-sky-500" />
                      </span>
                      <div className="min-w-0">
                        <dt className="text-muted-foreground">Primary Doctor</dt>
                        {patient.primary_doctor ? (
                          <dd className="font-medium">
                            <Link
                              href={`/control-panel/doctors/${patient.primary_doctor_id ?? ""}`}
                              className="text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1 truncate"
                            >
                              {patient.primary_doctor.display_name ?? patient.primary_doctor.email}
                              <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                            </Link>
                            <span className="text-[10px] text-muted-foreground">{patient.primary_doctor.email}</span>
                          </dd>
                        ) : (
                          <dd className="text-muted-foreground">—</dd>
                        )}
                      </div>
                    </div>

                    {/* Referral — always shown */}
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 border border-teal-100 shrink-0 mt-0.5">
                        <GitBranch className="h-3 w-3 text-teal-500" />
                      </span>
                      <div>
                        <dt className="text-muted-foreground">Referral</dt>
                        <dd className="font-medium">
                          {clinicalProfile?.referral_source
                            ? `${clinicalProfile.referral_source}${clinicalProfile.referral_detail ? ` — ${clinicalProfile.referral_detail}` : ""}`
                            : "—"}
                        </dd>
                      </div>
                    </div>

                    {/* Allergies */}
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 border border-amber-100 shrink-0 mt-0.5">
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                      </span>
                      <div>
                        <dt className="text-muted-foreground">Allergies</dt>
                        <dd className="font-medium">
                          {clinicalProfile?.allergies?.length
                            ? clinicalProfile.allergies.join(", ")
                            : "—"}
                        </dd>
                      </div>
                    </div>

                    {/* Clinical Notes */}
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 border border-slate-200 shrink-0 mt-0.5">
                        <FileText className="h-3 w-3 text-slate-500" />
                      </span>
                      <div>
                        <dt className="text-muted-foreground">Clinical Notes</dt>
                        <dd className="leading-relaxed text-muted-foreground">
                          {clinicalProfile?.notes ?? "—"}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </>
              ) : (
                /* No patient record */
                <div className="text-center py-6">
                  <User className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No patient record linked to your account.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Summary Card — emerald glow glass ─────────────── */}
          <Card className="rounded-[24px] border bg-card shadow-[0_8px_32px_rgba(16,185,129,0.16)] overflow-hidden">
            <CardHeader className="pb-2 bg-emerald-50/60 border-b border-emerald-100/70">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 border border-emerald-200 shrink-0">
                  <Activity className="h-3.5 w-3.5 text-emerald-600" />
                </span>
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(
                [
                  {
                    label: "Total Appointments",
                    value: total,
                    icon: <CalendarDays className="h-4 w-4 text-sky-500" />,
                    badgeCls: "bg-sky-100 text-sky-700 border-sky-200",
                  },
                  {
                    label: "Completed",
                    value: done,
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                    badgeCls: "bg-emerald-100 text-emerald-700 border-emerald-200",
                  },
                  {
                    label: "Upcoming",
                    value: upcoming,
                    icon: <CalendarClock className="h-4 w-4 text-blue-500" />,
                    badgeCls: "bg-blue-100 text-blue-700 border-blue-200",
                  },
                ] as const
              ).map(({ label, value, icon, badgeCls }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    {icon}
                    {label}
                  </span>
                  {loading ? (
                    <Skeleton className="h-5 w-10 rounded-full" />
                  ) : (
                    <Badge variant="outline" className={`font-bold text-sm ${badgeCls}`}>
                      {value}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ── Invoices Card — amber/gold glow glass ─────────── */}
          <Card className="rounded-[24px] border bg-card shadow-[0_8px_32px_rgba(245,158,11,0.14)] overflow-hidden">
            <CardHeader className="pb-2 bg-amber-50/60 border-b border-amber-100/70">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 border border-amber-200 shrink-0">
                  <Receipt className="h-3.5 w-3.5 text-amber-600" />
                </span>
                Invoices
                {!invoicesLoading && invoices.length > 0 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold ml-1">
                    {invoices.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {invoicesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full rounded" />
                  ))}
                </div>
              ) : invoicesError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Failed to load invoices. Please refresh.
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-4">
                  <CreditCard className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">No invoices on file.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{inv.description ?? "Invoice"}</p>
                        {inv.due_date && (
                          <p className="text-muted-foreground text-[10px]">
                            Due {format(new Date(inv.due_date), "dd MMM yyyy")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-semibold">
                          {(inv.amount / 100).toFixed(2)} {inv.currency.toUpperCase()}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] py-0 ${
                            inv.status === "paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : inv.status === "overdue"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : inv.status === "sent"
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {inv.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Appointment History — spans 2 columns */}
        <div className="md:col-span-2">
          <AppointmentTimeline appointments={appointments} loading={loading} />
        </div>
      </div>
    </div>
  );
}
