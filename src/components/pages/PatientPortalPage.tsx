"use client";

/**
 * PatientPortalPage
 *
 * Redesigned with:
 * - One shadcn Card for sidebar (Profile + Summary + Invoices); Appointment History is its own Card
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
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { AppointmentListColorBar } from "@/components/shared/AppointmentListColorBar";
import { useAppointmentColor } from "@/context/AppointmentColorContext";
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

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Cake,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  CreditCard,
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
import type { Patient, PatientClinicalProfile, User as AppUser } from "@/types/types";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { DoctorSelectOption } from "@/components/shared/doctor-display/DoctorSelectOption";
import { DoctorLinkStack } from "@/components/shared/doctor-display/DoctorLinkStack";
import { notify } from "@/lib/notify";
import { useUsers } from "@/hooks/useUsers";
import { useAvailabilitySlots } from "@/hooks/useAvailabilitySlots";
import { queryKeys } from "@/lib/query-keys";
import { invalidateAfterAppointmentMutation } from "@/lib/query-client";
import { getPatientCareLevelLabel } from "@/lib/patient-care-level";

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

// ---------------------------------------------------------------------------
// Status meta
// ---------------------------------------------------------------------------

/**
 * Status row badges — use the same `calendar-glass-badge*` utilities as MonthView /
 * CalendarHeader so portal appointment chips match dashboard calendar styling.
 */
const STATUS_META: Record<
  string,
  { icon: React.ReactNode; glassCls: string; label: string; dotCls: string }
> = {
  done: {
    icon: <CalendarCheck className="h-3.5 w-3.5" />,
    glassCls: "calendar-glass-badge-emerald",
    label: "Done",
    dotCls: "bg-emerald-400",
  },
  pending: {
    icon: <CalendarClock className="h-3.5 w-3.5" />,
    glassCls: "calendar-glass-badge-amber",
    label: "Pending",
    dotCls: "bg-amber-400",
  },
  alert: {
    icon: <CalendarX className="h-3.5 w-3.5" />,
    glassCls: "calendar-glass-badge-rose",
    label: "Alert",
    dotCls: "bg-red-400",
  },
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
  const doctors: AppUser[] = usersData?.users ?? [];

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
          /* Default sky-blue glassmorphic glow button — `has-[>svg]:px-5` overrides Button CVA `has-[>svg]:px-3` so horizontal padding matches design. */
          <Button
            className={cn(
              "gap-2 from-sky-500 via-zinc-400 to-sky-800 bg-linear-to-r hover:bg-sky-700 text-white shadow-[0_0_24px_rgba(2,132,199,0.4)] hover:shadow-[0_0_36px_rgba(2,132,199,0.65)] transition-all duration-200 cursor-pointer px-5 has-[>svg]:px-5"
            )}
          >
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
                    <SelectItem key={d.id} value={d.id} textValue={d.display_name ?? d.email}>
                      <DoctorSelectOption doctor={d} />
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

type ApptRow = PortalPrefetchData["appointments"][number];

function AppointmentTimeline({ appointments, loading }: { appointments: ApptRow[]; loading?: boolean }) {
  const { getAppointmentColorToken } = useAppointmentColor();
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
    /**
     * Single shadcn `Card` — section title + toolbar + list live inside one `CardContent`
     * so the heading is not visually split from the body (same pattern as sidebar).
     */
    <Card className="rounded-[24px] border border-violet-100/60 bg-card shadow-[0_8px_32px_rgba(139,92,246,0.15)] overflow-hidden">
      <CardContent className="space-y-4 p-4 text-gray-700 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-100/70 pb-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-violet-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 border border-violet-200 shrink-0">
              <CalendarDays className="h-3.5 w-3.5 text-violet-600" />
            </span>
            Appointment History
            {!loading && (
              <Badge
                variant="outline"
                className="calendar-glass-badge calendar-glass-badge-violet font-bold ml-1"
              >
                {filtered.length}
              </Badge>
            )}
          </h3>
          <div className="inline-flex bg-muted/60 rounded-full p-1 gap-1 border">
            {filterTabs.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
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
        <div className="space-y-4">

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
              <Stethoscope className="mb-3 h-10 w-10 text-gray-400" />
              <p className="font-medium text-gray-700">No appointments yet</p>
              <p className="mt-1 text-xs text-gray-600">Your history will appear here once you&apos;ve had appointments.</p>
            </div>
          ) : (
            /* Timeline */
            <div className="relative space-y-3 before:absolute before:inset-y-0 before:left-[18px] before:w-0.5 before:bg-linear-to-b before:from-sky-300/60 before:via-sky-200/40 before:to-transparent">
              {filtered.map((appt) => {
                const status = appt.status ?? "pending";
                const meta = STATUS_META[status] ?? STATUS_META.pending;
                const startDate = new Date(appt.start);
                const colorToken = getAppointmentColorToken(
                  appt.id,
                  appt.category?.color ?? null
                );
                return (
                  <div key={appt.id} className="relative pl-12">
                    {/* Timeline dot — colored by status */}
                    <div className={`absolute left-2 top-4 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background text-white shadow-sm ${meta.dotCls}`}>
                      {meta.icon}
                    </div>
                    {/*
                      Dashboard list row: left color bar + token-tinted surface (same tokens as
                      `AppointmentList` + `AppointmentListColorBar`).
                    */}
                    <div
                      className="relative flex min-h-[100px] items-stretch overflow-hidden rounded-2xl border shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                      style={{
                        backgroundColor: colorToken.cardBgColor,
                        borderColor: colorToken.cardBorderColor,
                      }}
                    >
                      <AppointmentListColorBar color={colorToken.lineColor} />
                      <div className="flex min-w-0 flex-1 flex-col gap-1 p-4 pl-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <RoleEntityLink
                                kind="appointment"
                                id={appt.id}
                                label={appt.title}
                                className="text-sm font-semibold"
                              />
                              <Badge
                                variant="outline"
                                className={cn("calendar-glass-badge gap-1 text-xs", meta.glassCls)}
                              >
                                {meta.icon}
                                <span className="ml-1">{meta.label}</span>
                              </Badge>
                              {appt.category && (
                                <Badge
                                  variant="outline"
                                  className="calendar-glass-badge calendar-glass-badge-violet gap-1 text-xs"
                                >
                                  <span
                                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                                    style={{ background: appt.category.color ?? "#888" }}
                                  />
                                  {appt.category.label}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 shrink-0 text-gray-500" />
                                <span className="font-medium text-gray-700">
                                  {format(startDate, "dd MMM yyyy, HH:mm")}
                                  {" — "}
                                  {format(new Date(appt.end), "HH:mm")}
                                </span>
                              </span>
                              {appt.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 shrink-0 text-gray-500" />
                                  <span className="font-medium text-gray-700">{appt.location}</span>
                                </span>
                              )}
                              {appt.owner && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 shrink-0 text-gray-500" />
                                  <span className="text-gray-600">Calendar owner</span>
                                  <span className="font-medium text-gray-700">
                                    {appt.owner.display_name ?? appt.owner.email}
                                  </span>
                                </span>
                              )}
                              {/*
                                B2: When `treating_physician_id` differs from `user_id`, show the clinical
                                contact so portal copy matches staff snapshot / serializers.
                              */}
                              {appt.treating_physician &&
                                appt.treating_physician_id &&
                                appt.treating_physician_id !== appt.user_id && (
                                  <span className="flex items-center gap-1">
                                    <Stethoscope className="h-3 w-3 shrink-0 text-gray-500" />
                                    <span className="text-gray-600">Treating physician</span>
                                    <span className="font-medium text-gray-700">
                                      {appt.treating_physician.display_name ??
                                        appt.treating_physician.email}
                                    </span>
                                  </span>
                                )}
                            </div>
                            {appt.notes && (
                              <p className="flex items-start gap-1 text-xs text-gray-600">
                                <FileText className="mt-0.5 h-3 w-3 shrink-0 text-gray-500" />
                                {appt.notes}
                              </p>
                            )}
                          </div>
                          <p className="shrink-0 text-xs font-medium text-gray-500">
                            {isToday(startDate) ? "Today" : format(startDate, "EEE, dd MMM")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-700">No {filter} appointments.</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
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
    queryFn: () => apiClient<PortalPrefetchData>("/api/patient-portal"),
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

  const { data: portalDoctorsData } = useUsers({ role: "doctor", limit: 200 });
  const portalDoctors = portalDoctorsData?.users ?? [];

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

  /**
   * Avatar URL resolution for `UserAvatar` / `SafeImage` (same stack as PatientDetailScreen):
   * - Treat empty strings like missing (DB sometimes stores "" for image).
   * - `UserAvatar` applies `referrerPolicy="no-referrer"` for OAuth CDN images.
   * - Robohash PNG fallback; prefetch includes `userImage` — see `prefetchPortalData`.
   */
  const clinicalImageUrl = (patient?.clinical_profile as PatientClinicalProfile & { image_url?: string })?.image_url;
  const trimmedOAuth = userImage?.trim() ? userImage : null;
  const trimmedClinical = clinicalImageUrl?.trim() ? clinicalImageUrl : null;
  const robohashFallback =
    patient != null
      ? `https://robohash.org/${encodeURIComponent(patient.email || patient.id)}.png?set=set4&size=128x128`
      : undefined;
  const avatarSrc = trimmedOAuth ?? trimmedClinical ?? robohashFallback;

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
    <div className="space-y-4 py-0 pb-0 text-gray-700">
      {/* Page header — always static */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-gray-700 md:text-2xl">
            <Activity className="h-5 w-5 text-sky-600 md:h-6 md:w-6" />
            Patient Portal
          </h1>
          <p className="text-sm text-gray-600">
            View your appointment history and request new appointments
          </p>
        </div>
        {/* Glassmorphic Book button */}
        <BookAppointmentDialog />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Left sidebar: one shadcn Card — section titles sit inside the same CardContent
            as their body (no separate tinted CardHeader strip above the white panel). */}
        <div>
          <Card className="rounded-[24px] border border-slate-200/80 bg-card shadow-[0_8px_32px_rgba(99,102,241,0.12)] overflow-hidden">
            <CardContent className="space-y-6 p-4 text-gray-700 sm:p-6">
              {/* ── My Profile ───────────────────────────────── */}
              <section aria-labelledby="pp-profile-heading">
                <h3
                  id="pp-profile-heading"
                  className="text-sm font-semibold flex items-center gap-2 text-sky-800 mb-3"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 border border-sky-200 shrink-0">
                    <User className="h-3.5 w-3.5 text-sky-600" />
                  </span>
                  My Profile
                </h3>
                <div className="space-y-3">
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
                      {/* Avatar + name — `UserAvatar` matches control-panel patient detail (`SafeImage` + object-cover). */}
                      <div className="flex items-start gap-3">
                        <UserAvatar
                          src={avatarSrc}
                          fallbackText={`${patient.firstname?.[0] ?? "?"}${patient.lastname?.[0] ?? "?"}`}
                          sizeClassName="h-16 w-16"
                          loading={false}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold leading-tight text-gray-700">
                            {patient.firstname} {patient.lastname}
                          </p>
                          {patient.email && (
                            <p className="mt-0.5 truncate text-xs text-gray-600">{patient.email}</p>
                          )}
                          {patient.pronoun && (
                            <p className="text-xs text-gray-600">{patient.pronoun}</p>
                          )}
                          {/* Status + age badges inline below name */}
                          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                            {patient.active ? (
                              <Badge
                                variant="outline"
                                className="calendar-glass-badge calendar-glass-badge-emerald gap-1 text-[10px] py-0"
                              >
                                <ShieldCheck className="h-2.5 w-2.5" /> Active
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="calendar-glass-badge calendar-glass-badge-slate gap-1 text-[10px] py-0"
                              >
                                <ShieldOff className="h-2.5 w-2.5" /> Inactive
                              </Badge>
                            )}
                            {age !== null && (
                              <Badge
                                variant="outline"
                                className="calendar-glass-badge calendar-glass-badge-sky gap-1 text-[10px] py-0"
                              >
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
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-muted/60">
                            <Hash className="h-3 w-3 text-gray-500" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <dt className="text-gray-600">Patient ID</dt>
                            <dd className="break-all font-mono text-[10px] text-gray-700">{patient.id}</dd>
                          </div>
                        </div>

                        {/* Birth Date */}
                        {patient.birth_date && (
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-orange-100 bg-orange-50">
                              <Cake className="h-3 w-3 text-orange-500" />
                            </span>
                            <div>
                              <dt className="text-gray-600">Birth Date</dt>
                              <dd className="font-medium text-gray-700">
                                {format(new Date(patient.birth_date), "dd MMM yyyy")}
                              </dd>
                            </div>
                          </div>
                        )}

                        {/* Care Tier */}
                        {patient.care_level != null && (
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-violet-100 bg-violet-50">
                              <Layers className="h-3 w-3 text-violet-500" />
                            </span>
                            <div>
                              <dt className="text-gray-600">Care Tier (1–10)</dt>
                              <dd className="font-medium text-gray-700">
                                {getPatientCareLevelLabel(patient.care_level)}
                              </dd>
                            </div>
                          </div>
                        )}

                        {/* Primary Doctor — prefer serializePatient flat fields; tolerate legacy nested primary_doctor from older API responses until all callers align. */}
                        <div className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-100 bg-sky-50">
                            <Stethoscope className="h-3 w-3 text-sky-500" />
                          </span>
                          <div className="min-w-0">
                            <dt className="text-gray-600">Primary Doctor</dt>
                            <dd className="font-medium text-gray-700">
                              {(() => {
                                type LegacyNested = {
                                  primary_doctor?: { display_name?: string | null; email?: string } | null;
                                };
                                const pRow = patient as Patient & LegacyNested;
                                const nested = pRow.primary_doctor;
                                if (pRow.primary_doctor_id && pRow.primary_doctor_display?.trim()) {
                                  const doc = portalDoctors.find((x) => x.id === pRow.primary_doctor_id);
                                  return (
                                    <DoctorLinkStack
                                      doctorId={pRow.primary_doctor_id}
                                      name={pRow.primary_doctor_display.trim()}
                                      email={pRow.primary_doctor_email}
                                      specialty={doc?.specialty ?? null}
                                      linkKind="role"
                                      nameClassName="font-normal"
                                    />
                                  );
                                }
                                if (nested && (nested.display_name?.trim() || nested.email)) {
                                  return (
                                    <>
                                      {nested.display_name?.trim() || nested.email}
                                      {nested.email && nested.display_name?.trim() ? (
                                        <span className="text-gray-600"> ({nested.email.trim()})</span>
                                      ) : null}
                                    </>
                                  );
                                }
                                return pRow.primary_doctor_display ?? "—";
                              })()}
                            </dd>
                          </div>
                        </div>

                        {/* Referral — always shown */}
                        <div className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-teal-100 bg-teal-50">
                            <GitBranch className="h-3 w-3 text-teal-500" />
                          </span>
                          <div>
                            <dt className="text-gray-600">Referral</dt>
                            <dd className="font-medium text-gray-700">
                              {clinicalProfile?.referral_source
                                ? `${clinicalProfile.referral_source}${clinicalProfile.referral_detail ? ` — ${clinicalProfile.referral_detail}` : ""}`
                                : "—"}
                            </dd>
                          </div>
                        </div>

                        {/* Allergies */}
                        <div className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-100 bg-amber-50">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                          </span>
                          <div>
                            <dt className="text-gray-600">Allergies</dt>
                            <dd className="font-medium text-gray-700">
                              {clinicalProfile?.allergies?.length
                                ? clinicalProfile.allergies.join(", ")
                                : "—"}
                            </dd>
                          </div>
                        </div>

                        {/* Clinical Notes */}
                        <div className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                            <FileText className="h-3 w-3 text-slate-500" />
                          </span>
                          <div>
                            <dt className="text-gray-600">Clinical Notes</dt>
                            <dd className="leading-relaxed text-gray-700">
                              {clinicalProfile?.notes ?? "—"}
                            </dd>
                          </div>
                        </div>
                      </dl>
                    </>
                  ) : (
                    /* No patient record */
                    <div className="py-6 text-center">
                      <User className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                      <p className="text-sm text-gray-700">No patient record linked to your account.</p>
                    </div>
                  )}
                </div>
              </section>

              <Separator />

              {/* ── Summary ───────────────────────────────────── */}
              <section aria-labelledby="pp-summary-heading">
                <h3
                  id="pp-summary-heading"
                  className="text-sm font-semibold flex items-center gap-2 text-emerald-800 mb-3"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 border border-emerald-200 shrink-0">
                    <Activity className="h-3.5 w-3.5 text-emerald-600" />
                  </span>
                  Summary
                </h3>
                <div className="space-y-3">
                  {(
                    [
                      {
                        label: "Total Appointments",
                        value: total,
                        icon: <CalendarDays className="h-4 w-4 text-sky-500" />,
                        glassCls: "calendar-glass-badge-sky",
                      },
                      {
                        label: "Completed",
                        value: done,
                        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                        glassCls: "calendar-glass-badge-emerald",
                      },
                      {
                        label: "Upcoming",
                        value: upcoming,
                        icon: <CalendarClock className="h-4 w-4 text-blue-500" />,
                        glassCls: "calendar-glass-badge-blue",
                      },
                    ] as const
                  ).map(({ label, value, icon, glassCls }) => (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm text-gray-700">
                        {icon}
                        {label}
                      </span>
                      {loading ? (
                        <Skeleton className="h-5 w-10 rounded-full" />
                      ) : (
                        <Badge
                          variant="outline"
                          className={cn("calendar-glass-badge font-bold text-sm", glassCls)}
                        >
                          {value}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <Separator />

              {/* ── Invoices ──────────────────────────────────── */}
              <section aria-labelledby="pp-invoices-heading">
                <h3
                  id="pp-invoices-heading"
                  className="text-sm font-semibold flex items-center gap-2 text-amber-800 mb-3 flex-wrap"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 border border-amber-200 shrink-0">
                    <Receipt className="h-3.5 w-3.5 text-amber-600" />
                  </span>
                  Invoices
                  {!invoicesLoading && invoices.length > 0 && (
                    <Badge
                      variant="outline"
                      className="calendar-glass-badge calendar-glass-badge-amber font-bold ml-1"
                    >
                      {invoices.length}
                    </Badge>
                  )}
                </h3>
                <div>
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
                    <div className="py-4 text-center">
                      <CreditCard className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-xs text-gray-700">No invoices on file.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {invoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-700">{inv.description ?? "Invoice"}</p>
                            {inv.due_date && (
                              <p className="text-[10px] text-gray-600">
                                Due {format(new Date(inv.due_date), "dd MMM yyyy")}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="font-semibold text-gray-700">
                              {(inv.amount / 100).toFixed(2)} {inv.currency.toUpperCase()}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "calendar-glass-badge text-[10px] py-0",
                                inv.status === "paid"
                                  ? "calendar-glass-badge-emerald"
                                  : inv.status === "overdue"
                                    ? "calendar-glass-badge-rose"
                                    : inv.status === "sent"
                                      ? "calendar-glass-badge-sky"
                                      : "calendar-glass-badge-slate"
                              )}
                            >
                              {inv.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
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
